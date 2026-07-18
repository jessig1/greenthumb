import { useState } from 'react'
import { toast } from 'sonner'
import type { PhotoEntityType } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUploadPhoto } from './api'

interface PhotoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: PhotoEntityType
  entityId: string
}

export function PhotoUploadDialog({ open, onOpenChange, entityType, entityId }: PhotoUploadDialogProps) {
  const uploadPhoto = useUploadPhoto(entityType, entityId)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setFile(null)
      setCaption('')
    }
  }

  const handleSubmit = () => {
    if (!file) return
    uploadPhoto.mutate(
      { file, caption },
      {
        onSuccess: () => {
          toast.success('Photo uploaded')
          handleOpenChange(false)
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="photo-file">Photo</Label>
            <Input
              id="photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="photo-caption">Caption (optional)</Label>
            <Input id="photo-caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={!file || uploadPhoto.isPending}>
            {uploadPhoto.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
