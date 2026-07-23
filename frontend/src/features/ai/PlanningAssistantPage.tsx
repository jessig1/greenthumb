import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { useGarden } from '@/features/gardens/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { usePlanningAssistant } from './api'
import { ArrowLeft, Sparkles, Send, Bot, User } from 'lucide-react'

interface Exchange {
  question: string
  answer: string
}

const SAMPLE_PROMPTS = [
  'What companion plants grow best alongside tomatoes?',
  'Suggest a succession planting schedule for lettuce and spinach.',
  'How many herbs can I fit into a 4x4 raised bed?',
  'What are ideal crops for partial sun in spring?',
]

export function PlanningAssistantPage() {
  const { gardenId } = useParams<{ gardenId: string }>()
  const { data: garden, isLoading } = useGarden(gardenId!)
  const planningAssistant = usePlanningAssistant(gardenId!)
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<Exchange[]>([])

  const handleAsk = (promptToUse?: string) => {
    const asked = (promptToUse || question).trim()
    if (!asked) return

    planningAssistant.mutate(
      { question: asked },
      {
        onSuccess: (data) => {
          setHistory((prev) => [...prev, { question: asked, answer: data.answer }])
          setQuestion('')
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  if (!garden) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">Garden not found.</p>
        <Link to="/gardens" className="text-sm font-semibold text-emerald-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Link */}
      <Link
        to={`/gardens/${gardenId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to {garden.name}</span>
      </Link>

      {/* Hero Header */}
      <div className="flex items-start gap-3.5 p-6 rounded-2xl bg-gradient-to-tr from-emerald-900/90 to-teal-900/90 text-white shadow-lg">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-emerald-400/30">
          <Sparkles className="h-6 w-6 text-emerald-300" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Garden Planning Assistant</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            AI-powered advice tailored specifically for <span className="font-semibold text-white">{garden.name}</span>. Ask about spacing, companion planting, timing, or soil care.
          </p>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      {history.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(prompt)
                  handleAsk(prompt)
                }}
                disabled={planningAssistant.isPending}
                className="text-xs font-medium px-3 py-2 rounded-xl bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 border border-border/50 transition-all text-left"
              >
                🌱 "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      {history.length > 0 && (
        <div className="space-y-4">
          {history.map((exchange, index) => (
            <div key={index} className="space-y-3">
              {/* User Prompt */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs sm:text-sm max-w-lg shadow-sm">
                  {exchange.question}
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                  <User className="h-4 w-4" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="rounded-2xl rounded-tl-xs glass-card border-border/60 shadow-xs max-w-xl">
                  <CardContent className="p-4 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {exchange.answer}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading state indicator */}
      {planningAssistant.isPending && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 animate-pulse">
          <Sparkles className="h-5 w-5 text-emerald-500 animate-spin" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Consulting garden knowledge base…
          </span>
        </div>
      )}

      {/* Input Box */}
      <div className="space-y-2 pt-2">
        <div className="relative">
          <Textarea
            placeholder="Ask anything about your garden layout, plant combinations, or care schedules…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={planningAssistant.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAsk()
              }
            }}
            className="min-h-[100px] rounded-2xl bg-background/80 p-4 text-xs sm:text-sm shadow-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Press Enter to send (Shift+Enter for newline)</p>
          <Button
            type="button"
            onClick={() => handleAsk()}
            disabled={!question.trim() || planningAssistant.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 text-xs font-semibold shadow-sm"
          >
            <span>Ask Assistant</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
