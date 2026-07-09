import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useDeleteGarden, useGarden } from './api'
import { GardenFormDialog } from './GardenFormDialog'
import { useContainers } from '@/features/containers/api'
import { ContainerFormDialog } from '@/features/containers/ContainerFormDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { containerTypeLabel, gardenTypeLabel } from '@/lib/labels'

export function GardenDetailPage() {
  const { gardenId } = useParams<{ gardenId: string }>()
  const navigate = useNavigate()
  const { data: garden, isLoading: gardenLoading } = useGarden(gardenId!)
  const { data: containers, isLoading: containersLoading } = useContainers(gardenId!)
  const deleteGarden = useDeleteGarden()

  const [editOpen, setEditOpen] = useState(false)
  const [createContainerOpen, setCreateContainerOpen] = useState(false)

  const handleDelete = () => {
    if (!garden) return
    if (!window.confirm(`Delete "${garden.name}"? This also deletes its containers and plantings.`)) return
    deleteGarden.mutate(garden.id, {
      onSuccess: () => {
        toast.success('Garden deleted')
        navigate('/dashboard')
      },
      onError: (error) => toast.error(error.message),
    })
  }

  if (gardenLoading) {
    return <Skeleton className="h-32" />
  }

  if (!garden) {
    return <p className="text-muted-foreground">Garden not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/gardens" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to gardens
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{garden.name}</h1>
            <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
          </div>
          {garden.description && <p className="mt-1 text-muted-foreground">{garden.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Containers</h2>
          <Button onClick={() => setCreateContainerOpen(true)}>New container</Button>
        </div>

        {containersLoading ? (
          <Skeleton className="h-24" />
        ) : containers?.length === 0 ? (
          <p className="text-muted-foreground">No containers yet. Add a raised bed, pot, or plot.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {containers?.map((container) => (
              <Link key={container.id} to={`/gardens/${garden.id}/containers/${container.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span>{container.name}</span>
                      <Badge variant="secondary">{containerTypeLabel(container.containerType)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  {container.sizeDescription && (
                    <CardContent className="text-sm text-muted-foreground">{container.sizeDescription}</CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <GardenFormDialog open={editOpen} onOpenChange={setEditOpen} garden={garden} />
      <ContainerFormDialog open={createContainerOpen} onOpenChange={setCreateContainerOpen} gardenId={garden.id} />
    </div>
  )
}
