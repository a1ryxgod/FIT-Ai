import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { SkeletonStatRow, SkeletonList } from '@/components/ui/Skeleton'
import { useTodaySummary, useFoodProducts, useLogFood } from '@/hooks/useNutrition'
import { round1 } from '@/utils/helpers'

const MACRO_GOALS = { calories: 2000, protein: 150, carbs: 250, fats: 70 }

// Meal type grouping matching MyFitnessPal pattern
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch',     label: 'Lunch',     icon: '☀️'  },
  { key: 'dinner',    label: 'Dinner',    icon: '🌙' },
  { key: 'snack',     label: 'Snacks',    icon: '🍎'  },
]

export default function Nutrition() {
  const [showLogModal, setShowLogModal] = useState(false)
  const [activeMeal, setActiveMeal] = useState('breakfast')

  const { data: todayData, isLoading: loadingToday } = useTodaySummary()
  const totals = todayData?.totals ?? {}
  const logs   = todayData?.logs   ?? []

  // Group logs by meal_type (fallback: all under 'lunch' if no meal_type field)
  const byMeal = MEAL_TYPES.reduce((acc, { key }) => {
    acc[key] = logs.filter((l) => (l.meal_type ?? 'lunch') === key)
    return acc
  }, {})

  const handleAddFood = (mealKey) => {
    setActiveMeal(mealKey)
    setShowLogModal(true)
  }

  return (
    <Layout title="Nutrition">
      {/* Calorie header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">Today</h2>
          <Button onClick={() => setShowLogModal(true)} size="sm">+ Log Food</Button>
        </div>

        {loadingToday ? <SkeletonStatRow /> : (
          <>
            {/* Hero calorie card */}
            <Card className="mb-4">
              <div className="text-center mb-3">
                <p className="text-caption text-slate-500">Calories Consumed</p>
                <div className="flex items-end justify-center gap-1 mt-1">
                  <span className="text-[40px] font-bold text-white leading-none">{Math.round(totals.calories ?? 0)}</span>
                  <span className="text-small text-slate-500 mb-1">/ {MACRO_GOALS.calories} kcal</span>
                </div>
              </div>
              {/* Main progress ring placeholder — simple bar */}
              <div className="progress-track h-3 mb-4">
                <div
                  className="progress-fill h-3 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round(((totals.calories ?? 0) / MACRO_GOALS.calories) * 100))}%`,
                    background: 'linear-gradient(90deg, rgb(var(--brand-500)), rgb(var(--brand-400)))',
                  }}
                />
              </div>
              {/* Macro row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Protein', val: totals.protein ?? 0, goal: MACRO_GOALS.protein, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: 'Carbs',   val: totals.carbs   ?? 0, goal: MACRO_GOALS.carbs,   color: 'bg-amber-500',   textColor: 'text-amber-400'   },
                  { label: 'Fats',    val: totals.fats    ?? 0, goal: MACRO_GOALS.fats,    color: 'bg-blue-500',    textColor: 'text-blue-400'    },
                ].map(({ label, val, goal, color, textColor }) => {
                  const pct = Math.min(100, Math.round((val / goal) * 100))
                  return (
                    <div key={label} className="bg-surface-750 rounded-xl p-3">
                      <p className={`text-base font-bold ${textColor}`}>
                        {round1(val)}<span className="text-caption font-normal text-slate-500 ml-0.5">g</span>
                      </p>
                      <p className="text-caption text-slate-500 mb-1.5">{label}</p>
                      <div className="progress-track h-1">
                        <div className={`progress-fill h-1 ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">{pct}% of goal</p>
                    </div>
                  )
                })}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Meal sections */}
      <div>
        <p className="section-title">Food Log</p>
        {loadingToday ? (
          <SkeletonList count={2} />
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.map(({ key, label, icon }) => {
              const mealLogs = byMeal[key] ?? []
              const mealCals = mealLogs.reduce((sum, l) => {
                const factor = (l.grams ?? 100) / 100
                return sum + ((l.product?.calories ?? 0) * factor)
              }, 0)

              return (
                <Card key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="font-semibold text-slate-100 text-small">{label}</p>
                        {mealLogs.length > 0 && (
                          <p className="text-caption text-slate-500">{round1(mealCals)} kcal</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleAddFood(key)}>
                      + Add
                    </Button>
                  </div>

                  {mealLogs.length === 0 ? (
                    <p className="text-caption text-slate-600 text-center py-2">Nothing logged</p>
                  ) : (
                    <div className="space-y-2">
                      {mealLogs.map((log) => (
                        <FoodRow key={log.id} log={log} />
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <LogFoodModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        defaultMeal={activeMeal}
      />
    </Layout>
  )
}

function FoodRow({ log }) {
  const product = log.product ?? {}
  const factor  = (log.grams ?? 100) / 100
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-700/60 last:border-0">
      <div className="min-w-0">
        <p className="text-small font-medium text-slate-200 truncate">{product.name}</p>
        <p className="text-caption text-slate-500">{log.grams}g</p>
      </div>
      <div className="flex gap-3 text-caption flex-shrink-0 ml-3">
        <span className="text-slate-300 font-medium">{round1((product.calories ?? 0) * factor)}<span className="text-slate-600 ml-0.5">kcal</span></span>
        <span className="text-emerald-400 hidden sm:inline">{round1((product.protein ?? 0) * factor)}P</span>
        <span className="text-amber-400 hidden sm:inline">{round1((product.carbs ?? 0) * factor)}C</span>
        <span className="text-blue-400 hidden sm:inline">{round1((product.fats ?? 0) * factor)}F</span>
      </div>
    </div>
  )
}

function LogFoodModal({ isOpen, onClose, defaultMeal = 'lunch' }) {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [grams, setGrams] = useState('100')
  const [mealType, setMealType] = useState(defaultMeal)

  const { data: products = [], isLoading } = useFoodProducts(search)
  const logFood = useLogFood()

  const handleLog = async () => {
    if (!selectedProduct || !grams) return
    await logFood.mutateAsync({
      product_id: selectedProduct.id,
      grams: parseFloat(grams),
      meal_type: mealType,
    })
    setSelectedProduct(null)
    setGrams('100')
    setSearch('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Food" size="lg">
      <div className="space-y-4">
        {/* Meal selector */}
        <div className="flex gap-2">
          {MEAL_TYPES.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMealType(key)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl text-[10px] font-medium transition-all ${
                mealType === key
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'bg-surface-750 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-lg mb-0.5">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <Input
          label="Search food"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chicken breast, oats..."
          autoFocus
        />

        {/* Product list */}
        <div className="max-h-52 overflow-y-auto space-y-1 bg-surface-750 rounded-xl p-2">
          {isLoading ? (
            <SkeletonList count={3} />
          ) : products.length === 0 ? (
            <p className="text-caption text-slate-500 text-center py-6">No products found</p>
          ) : (
            products.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-small transition-colors ${
                  selectedProduct?.id === p.id
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-slate-300 hover:bg-surface-700'
                }`}
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-caption text-slate-500 ml-2">
                  {p.calories} kcal · P:{p.protein} C:{p.carbs} F:{p.fats} (per 100g)
                </span>
              </button>
            ))
          )}
        </div>

        {selectedProduct && (
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
            <p className="text-small font-semibold text-brand-400 mb-2">{selectedProduct.name}</p>
            <Input
              label="Grams"
              type="number"
              min="1"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="100"
            />
            {grams && (
              <p className="text-caption text-slate-400 mt-2">
                ≈ <strong className="text-slate-200">{round1(selectedProduct.calories * parseFloat(grams) / 100)}</strong> kcal ·{' '}
                <strong className="text-emerald-400">{round1(selectedProduct.protein * parseFloat(grams) / 100)}g</strong> protein
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
          <Button onClick={handleLog} loading={logFood.isPending} disabled={!selectedProduct} fullWidth>
            Log Food
          </Button>
        </div>
      </div>
    </Modal>
  )
}
