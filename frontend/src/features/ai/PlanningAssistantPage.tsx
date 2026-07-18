import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { useGarden } from '@/features/gardens/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { usePlanningAssistant } from './api'

interface Exchange {
  question: string
  answer: string
}

export function PlanningAssistantPage() {
  const { gardenId } = useParams<{ gardenId: string }>()
  const { data: garden, isLoading } = useGarden(gardenId!)
  const planningAssistant = usePlanningAssistant(gardenId!)
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<Exchange[]>([])

  const handleAsk = () => {
    if (!question.trim()) return
    const asked = question.trim()
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
    return <Skeleton className="h-32" />
  }

  if (!garden) {
    return <p className="text-muted-foreground">Garden not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/gardens/${gardenId}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {garden.name}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Planning assistant</h1>
        <p className="text-muted-foreground">
          Ask about what to plant, spacing, companion planting, and timing for {garden.name}.
        </p>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-4">
          {history.map((exchange, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="font-medium">{exchange.question}</p>
                <p className="whitespace-pre-wrap text-muted-foreground">{exchange.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="e.g. What should I plant alongside my tomatoes this spring?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={planningAssistant.isPending}
        />
        <Button
          type="button"
          onClick={handleAsk}
          disabled={!question.trim() || planningAssistant.isPending}
          className="self-end"
        >
          {planningAssistant.isPending ? 'Thinking…' : 'Ask'}
        </Button>
      </div>
    </div>
  )
}
