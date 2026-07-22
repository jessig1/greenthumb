import type { ReactNode } from 'react'
import { ImageIcon, Trash2 } from 'lucide-react'
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
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <ImageIcon className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">No photos yet</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Add a photo to build a visual garden journal.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} size="sm" className="group/photo relative">
          <img
            src={photo.url}
            alt={photo.caption ?? 'Plant photo'}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover/photo:scale-[1.02]"
          />
          <CardContent className="flex min-h-10 flex-col gap-2">
            {photo.caption && <p className="text-xs text-muted-foreground">{photo.caption}</p>}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">{actions?.(photo)}</div>
              <Button size="icon-sm" variant="ghost" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => onDelete(photo.id)}>
                <Trash2 />
                <span className="sr-only">Delete photo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
