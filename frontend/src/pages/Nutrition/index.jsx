import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Tabs from '@/components/ui/Tabs'
import RingProgress, { MiniRing } from '@/components/ui/RingProgress'
import { SkeletonStatRow, SkeletonList } from '@/components/ui/Skeleton'
import { useTodaySummary, useFoodProducts, useLogFood } from '@/hooks/useNutrition'
import { useProfileData } from '@/hooks/useAuth'
import { round1 } from '@/utils/helpers'
import { Coffee, Sun, Moon, Cookie, Plus } from '../../utils/icons'

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Сніданок', icon: Coffee },
  { key: 'lunch',     label: 'Обід',     icon: Sun    },
  { key: 'dinner',    label: 'Вечеря',   icon: Moon   },
  { key: 'snack',     label: 'Перекус',  icon: Cookie },
]

export default function Nutrition() {
  const [showLogModal, setShowLogModal] = useState(false)
  const [activeMeal, setActiveMeal] = useState('breakfast')

  const { data: profile } = useProfileData()
  const MACRO_GOALS = {
    calories: profile?.calorie_goal ?? 2000,
    protein:  profile?.protein_goal ?? 150,
    carbs:    profile?.carbs_goal   ?? 250,
    fats:     profile?.fat_goal     ?? 70,
  }

  const { data: todayData, isLoading: loadingToday } = useTodaySummary()
  const totals = todayData?.totals ?? {}
  const logs   = todayData?.logs   ?? []

  const byMeal = MEAL_TYPES.reduce((acc, { key }) => {
    acc[key] = logs.filter((l) => (l.meal_type ?? 'lunch') === key)
    return acc
  }, {})

  const handleAddFood = (mealKey) => {
    setActiveMeal(mealKey)
    setShowLogModal(true)
  }

  return (
    <Layout title="Харчування">
      {/* Calorie header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2">Сьогодні</h2>
          <Button onClick={() => setShowLogModal(true)} size="sm" icon={Plus}>Додати їжу</Button>
        </div>

        {loadingToday ? <SkeletonStatRow /> : (
          <Card className="mb-4">
            {/* RingProgress + Macro mini rings */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Calorie Ring */}
              <div className="flex-shrink-0">
                <RingProgress
                  value={totals.calories ?? 0}
                  max={MACRO_GOALS.calories}
                  size={150}
                  strokeWidth={12}
                  color="brand"
                  label={Math.round(totals.calories ?? 0)}
                  sublabel={`/ ${MACRO_GOALS.calories} ккал`}
                />
              </div>

              {/* Macro rings */}
              <div className="flex-1 w-full">
                <div className="flex justify-around">
                  <MiniRing
                    value={round1(totals.protein ?? 0)}
                    max={MACRO_GOALS.protein}
                    color="brand"
                    label="Білки"
                    unit="г"
                  />
                  <MiniRing
                    value={round1(totals.carbs ?? 0)}
                    max={MACRO_GOALS.carbs}
                    color="amber"
                    label="Вуглеводи"
                    unit="г"
                  />
                  <MiniRing
                    value={round1(totals.fats ?? 0)}
                    max={MACRO_GOALS.fats}
                    color="blue"
                    label="Жири"
                    unit="г"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Meal sections */}
      <div>
        <p className="section-title">Журнал харчування</p>
        {loadingToday ? (
          <SkeletonList count={2} />
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.map(({ key, label, icon: MealIcon }) => {
              const mealLogs = byMeal[key] ?? []
              const mealCals = mealLogs.reduce((sum, l) => {
                const factor = (l.grams ?? 100) / 100
                return sum + ((l.product?.calories ?? 0) * factor)
              }, 0)

              return (
                <Card key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="icon-container-sm">
                        <MealIcon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-small">{label}</p>
                        {mealLogs.length > 0 && (
                          <p className="text-caption text-slate-500">{round1(mealCals)} ккал</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" icon={Plus} onClick={() => handleAddFood(key)}>
                      Додати
                    </Button>
                  </div>

                  {mealLogs.length === 0 ? (
                    <p className="text-caption text-slate-600 text-center py-2">Нічого не внесено</p>
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
        <p className="text-caption text-slate-500">{log.grams}г</p>
      </div>
      <div className="flex gap-3 text-caption flex-shrink-0 ml-3">
        <span className="text-slate-300 font-medium">{round1((product.calories ?? 0) * factor)}<span className="text-slate-600 ml-0.5">ккал</span></span>
        <span className="text-emerald-400 hidden sm:inline">{round1((product.protein ?? 0) * factor)}Б</span>
        <span className="text-amber-400 hidden sm:inline">{round1((product.carbs ?? 0) * factor)}В</span>
        <span className="text-blue-400 hidden sm:inline">{round1((product.fats ?? 0) * factor)}Ж</span>
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

  const mealTabs = MEAL_TYPES.map(({ key, label, icon }) => ({ id: key, label, icon }))

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
    <Modal isOpen={isOpen} onClose={onClose} title="Додати їжу" size="lg">
      <div className="space-y-4">
        {/* Meal selector — Tabs */}
        <Tabs tabs={mealTabs} activeTab={mealType} onChange={setMealType} />

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Куряча грудка, вівсянка..."
          autoFocus
        />

        {/* Product list */}
        <div className="max-h-52 overflow-y-auto space-y-1 bg-surface-750 rounded-xl p-2">
          {isLoading ? (
            <SkeletonList count={3} />
          ) : products.length === 0 ? (
            <p className="text-caption text-slate-500 text-center py-6">Продуктів не знайдено</p>
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
                  {p.calories} ккал · Б:{p.protein} В:{p.carbs} Ж:{p.fats} (на 100г)
                </span>
              </button>
            ))
          )}
        </div>

        {selectedProduct && (
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
            <p className="text-small font-semibold text-brand-400 mb-2">{selectedProduct.name}</p>
            <Input
              label="Грами"
              type="number"
              min="1"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="100"
            />
            {grams && (
              <p className="text-caption text-slate-400 mt-2">
                ≈ <strong className="text-slate-200">{round1(selectedProduct.calories * parseFloat(grams) / 100)}</strong> ккал ·{' '}
                <strong className="text-emerald-400">{round1(selectedProduct.protein * parseFloat(grams) / 100)}г</strong> білків
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>Скасувати</Button>
          <Button onClick={handleLog} loading={logFood.isPending} disabled={!selectedProduct} fullWidth>
            Додати їжу
          </Button>
        </div>
      </div>
    </Modal>
  )
}
