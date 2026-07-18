import type { ReactNode } from 'react'
import { XIcon } from 'lucide-react'
import type { PhotoResponse } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PhotoGalleryProps {
  photos: PhotoResponse[]
  onDelete: (photoId: string) => void
  // Optional per-photo action slot (e.g. a "Diagnose" button in the planting context).
  actions?: (photo: PhotoResponse) => ReactNode
}

export function PhotoGallery({ photos, onDelete, actions }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground">No photos yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {photos.map((photo) => (
        <Card key={photo.id} size="sm">
          <img src={photo.url} alt={photo.caption ?? 'Plant photo'} className="aspect-square w-full object-cover" />
          <CardContent className="flex flex-col gap-2">
            {photo.caption && <p className="text-xs text-muted-foreground">{photo.caption}</p>}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">{actions?.(photo)}</div>
              <Button size="icon-sm" variant="ghost" onClick={() => onDelete(photo.id)}>
                <XIcon />
                <span className="sr-only">Delete photo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
