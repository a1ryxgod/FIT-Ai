import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useChatHistory, useSendMessage, useAnalyzeWorkouts } from '@/hooks/useAI'
import { Bot, Send, Sparkles, Apple, Dumbbell, Target, BrainCircuit } from '../../utils/icons'

const QUICK_PROMPTS = [
  'Як моє харчування сьогодні?',
  'Чи достатньо я їм білків?',
  'Як покращити мої тренування?',
  'Що мені їсти для досягнення цілі?',
]

export default function AIChat() {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const { data: messages = [], isLoading: historyLoading } = useChatHistory()
  const sendMessage = useSendMessage()
  const analyzeWorkouts = useAnalyzeWorkouts()

  const isPending = sendMessage.isPending || analyzeWorkouts.isPending

  const [optimistic, setOptimistic] = useState([])
  const allMessages = [...messages, ...optimistic]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  const handleSend = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || isPending) return

    setInput('')
    setOptimistic((prev) => [...prev, { role: 'user', message: msg, id: Date.now() }])

    try {
      await sendMessage.mutateAsync(msg)
      setOptimistic([])
    } catch {
      setOptimistic([])
    }
  }

  const handleAnalyze = async () => {
    if (isPending) return
    setOptimistic((prev) => [
      ...prev,
      { role: 'user', message: 'Проаналізуй моє тренування', id: Date.now() },
    ])
    try {
      const { data } = await analyzeWorkouts.mutateAsync()
      setOptimistic((prev) => [
        ...prev,
        { role: 'assistant', message: data.reply, id: Date.now() + 1 },
      ])
    } catch {
      setOptimistic([])
    }
  }

  return (
    <Layout title="AI Тренер">
      <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
          {historyLoading ? (
            <div className="flex justify-center pt-12"><Spinner /></div>
          ) : allMessages.length === 0 ? (
            <EmptyChat onPrompt={handleSend} />
          ) : (
            allMessages.map((msg, i) => (
              <MessageBubble key={msg.id ?? i} role={msg.role} text={msg.message} />
            ))
          )}

          {isPending && (
            <div className="flex items-center gap-2 px-3 py-2">
              <ThinkingDots />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="pt-3 border-t border-surface-700">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Запитайте про харчування, тренування..."
                disabled={isPending}
                className="input resize-none w-full py-3 pr-4 overflow-hidden leading-snug"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isPending}
              loading={sendMessage.isPending}
              icon={Send}
              className="shrink-0"
            >
              Надіслати
            </Button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isPending}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-caption text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Аналіз моїх тренувань
          </button>
        </div>
      </div>
    </Layout>
  )
}

const QUICK_PROMPT_ICONS = [Apple, Dumbbell, Target, BrainCircuit]

function EmptyChat({ onPrompt }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full py-8 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--brand-400)))' }}>
        <Bot className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-small font-semibold text-slate-300 mb-1">Ваш AI фітнес-тренер</h3>
      <p className="text-caption text-slate-600 mb-6 max-w-xs">
        Запитуйте про харчування, тренування або отримуйте персональні поради.
      </p>
      <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
        {QUICK_PROMPTS.map((prompt, i) => {
          const Icon = QUICK_PROMPT_ICONS[i % QUICK_PROMPT_ICONS.length]
          return (
            <button
              key={prompt}
              onClick={() => onPrompt(prompt)}
              className="flex items-center gap-3 text-left px-4 py-3 rounded-xl text-small text-slate-300 transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Icon className="h-4 w-4 text-brand-400 shrink-0" />
              {prompt}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function MessageBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, x: isUser ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 shrink-0 mt-0.5"
          style={{ background: 'rgb(var(--brand-500))' }}>
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-small leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'text-white rounded-br-sm'
            : 'text-slate-200 rounded-bl-sm'
        }`}
        style={isUser
          ? { background: 'rgb(var(--brand-500))' }
          : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }
        }
      >
        {text}
      </div>
    </motion.div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}
