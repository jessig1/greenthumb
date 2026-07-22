import { useState } from 'react'
import { ArrowLeft, ArrowUp, Bot, Leaf, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { useGarden } from '@/features/gardens/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { usePlanningAssistant } from './api'

interface Exchange {
  question: string
  answer: string
}

const SUGGESTED_QUESTIONS = [
  'What should I plant next?',
  'Which plants grow well together?',
  'Help me plan for the next frost date',
]

export function PlanningAssistantPage() {
  const { gardenId } = useParams<{ gardenId: string }>()
  const { data: garden, isLoading } = useGarden(gardenId!)
  const planningAssistant = usePlanningAssistant(gardenId!)
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<Exchange[]>([])

  const handleAsk = (suggestion?: string) => {
    const asked = (suggestion ?? question).trim()
    if (!asked) return
    planningAssistant.mutate(
      { question: asked },
      {
        onSuccess: (data) => {
          setHistory((previous) => [...previous, { question: asked, answer: data.answer }])
          setQuestion('')
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  if (isLoading) return <Skeleton className="h-80 rounded-3xl" />
  if (!garden) return <p className="text-muted-foreground">Garden not found.</p>

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link
        to={`/gardens/${gardenId}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to {garden.name}
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-primary px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -top-16 -right-14 size-56 rounded-full border border-white/10 bg-white/5" />
        <div className="relative">
          <span className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-white/12 text-lime-200 backdrop-blur">
            <Sparkles className="size-5" />
          </span>
          <p className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">Garden-aware guidance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Planning assistant</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Ask about planting, spacing, companions, or timing. Answers are tailored to {garden.name} and its growing conditions.
          </p>
        </div>
      </header>

      {history.length === 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Try asking</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {SUGGESTED_QUESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="surface-panel flex min-h-20 items-start gap-3 p-4 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
                onClick={() => handleAsk(suggestion)}
                disabled={planningAssistant.isPending}
              >
                <Leaf className="mt-0.5 size-4 shrink-0 text-primary" />
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <div className="flex flex-col gap-5" aria-live="polite">
          {history.map((exchange, index) => (
            <div key={index} className="flex flex-col gap-3">
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
                {exchange.question}
              </div>
              <div className="flex max-w-[95%] items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Bot className="size-4" />
                </span>
                <div className="surface-panel rounded-tl-md px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  <p className="whitespace-pre-wrap">{exchange.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="surface-panel sticky bottom-24 z-20 p-2 lg:bottom-4">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Ask about your garden..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleAsk()
              }
            }}
            disabled={planningAssistant.isPending}
            className="min-h-12 resize-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => handleAsk()}
            disabled={!question.trim() || planningAssistant.isPending}
            aria-label="Ask question"
          >
            {planningAssistant.isPending ? <Sparkles className="animate-pulse" /> : <ArrowUp />}
          </Button>
        </div>
        <p className="px-3 pb-1 text-[11px] text-muted-foreground">AI guidance may be imperfect. Check plant-specific advice when in doubt.</p>
      </div>
    </div>
  )
}
