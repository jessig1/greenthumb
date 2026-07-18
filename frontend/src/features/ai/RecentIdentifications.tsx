import { CircleCheck, HelpCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { useRecentIdentifications } from './api'

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function RecentIdentifications() {
  const { data: identifications } = useRecentIdentifications()
  if (!identifications || identifications.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-medium">Recent activity</h2>
      <Card>
        <CardContent className="flex flex-col divide-y py-1">
          {identifications.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-1 last:pb-1">
              <div className="flex min-w-0 items-center gap-2.5">
                {item.addedToCatalog ? (
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                ) : item.matchedPlantId ? (
                  <CircleCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.matchedPlantId ? (
                      <Link to={`/plants/${item.matchedPlantId}`} className="hover:underline">
                        {item.suggestedCommonName ?? 'Unknown plant'}
                      </Link>
                    ) : (
                      (item.suggestedCommonName ?? 'Unknown plant')
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.addedToCatalog
                      ? 'Added to plant catalog'
                      : item.matchedPlantId
                        ? 'Matched existing catalog entry'
                        : 'Identified - no catalog match'}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
