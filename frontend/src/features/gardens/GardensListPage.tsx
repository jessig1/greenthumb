import { useState } from 'react'
import { Link } from 'react-router'
import { useGardens } from './api'
import { GardenFormDialog } from './GardenFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { gardenTypeLabel } from '@/lib/labels'

export function GardensListPage() {
  const { data: gardens, isLoading } = useGardens()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your gardens</h1>
        <Button onClick={() => setCreateOpen(true)}>New garden</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : gardens?.length === 0 ? (
        <p className="text-muted-foreground">
          No gardens yet. Create one to start planning what to plant where.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {gardens?.map((garden) => (
            <Link key={garden.id} to={`/gardens/${garden.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{garden.name}</span>
                    <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
                  </CardTitle>
                </CardHeader>
                {garden.description && (
                  <CardContent className="text-sm text-muted-foreground">{garden.description}</CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <GardenFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
