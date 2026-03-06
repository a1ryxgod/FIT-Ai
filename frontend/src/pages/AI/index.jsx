import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useChatHistory, useSendMessage, useAnalyzeWorkouts } from '@/hooks/useAI'
import { formatDate } from '@/utils/helpers'

const QUICK_PROMPTS = [
  'How is my nutrition today?',
  'Am I eating enough protein?',
  'How can I improve my workouts?',
  'What should I eat for my goal?',
]

export default function AIChat() {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const { data: messages = [], isLoading: historyLoading } = useChatHistory()
  const sendMessage = useSendMessage()
  const analyzeWorkouts = useAnalyzeWorkouts()

  const isPending = sendMessage.isPending || analyzeWorkouts.isPending

  // Optimistic local messages for instant UI feedback
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
      const { data } = await sendMessage.mutateAsync(msg)
      setOptimistic([])
      // history is refetched automatically via invalidateQueries
    } catch {
      setOptimistic([])
    }
  }

  const handleAnalyze = async () => {
    if (isPending) return
    setOptimistic((prev) => [
      ...prev,
      { role: 'user', message: 'Analyze my workout training', id: Date.now() },
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
    <Layout title="AI Coach">
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

        {/* Analyze workouts shortcut */}
        {allMessages.length === 0 && !historyLoading && null}

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
                  // Auto-grow
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about your nutrition, workouts..."
                disabled={isPending}
                className="input resize-none w-full py-3 pr-4 overflow-hidden leading-snug"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isPending}
              loading={sendMessage.isPending}
              className="shrink-0"
            >
              Send
            </Button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isPending}
            className="mt-2 w-full text-center text-caption text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-40"
          >
            Analyze my workouts
          </button>
        </div>
      </div>
    </Layout>
  )
}

function EmptyChat({ onPrompt }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white mb-4"
        style={{ background: 'rgb(var(--brand-500))' }}>
        AI
      </div>
      <h3 className="text-small font-semibold text-slate-300 mb-1">Your AI Fitness Coach</h3>
      <p className="text-caption text-slate-600 mb-6 max-w-xs">
        Ask about your nutrition, workouts, or get personalized fitness advice.
      </p>
      <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="text-left px-4 py-3 rounded-xl text-small text-slate-300 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white mr-2 shrink-0 mt-0.5"
          style={{ background: 'rgb(var(--brand-500))' }}>
          AI
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
    </div>
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
