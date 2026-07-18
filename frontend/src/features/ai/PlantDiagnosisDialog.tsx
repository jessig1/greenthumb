import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePhotos, useDeletePhoto } from '@/features/photos/api'
import { PhotoGallery } from '@/features/photos/PhotoGallery'
import { PhotoUploadDialog } from '@/features/photos/PhotoUploadDialog'
import { useCareSuggestions, useDiagnosePhoto, useDiagnoses } from './api'

interface PlantDiagnosisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plantingId: string
  plantingLabel: string
}

export function PlantDiagnosisDialog({ open, onOpenChange, plantingId, plantingLabel }: PlantDiagnosisDialogProps) {
  const { data: photos } = usePhotos('PLANTED_PLANT', plantingId)
  const { data: diagnoses } = useDiagnoses(plantingId)
  const deletePhoto = useDeletePhoto('PLANTED_PLANT', plantingId)
  const diagnosePhoto = useDiagnosePhoto(plantingId)
  const careSuggestions = useCareSuggestions(plantingId)
  const [uploadOpen, setUploadOpen] = useState(false)

  const handleDiagnose = (photoId: string) => {
    diagnosePhoto.mutate(photoId, {
      onSuccess: () => toast.success('Diagnosis ready - see below'),
      onError: (error) => toast.error(error.message),
    })
  }

  const handleCareSuggestions = () => {
    careSuggestions.mutate(undefined, {
      onSuccess: () => toast.success('Care suggestions ready - see below'),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{plantingLabel} · Photos &amp; AI</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">Photos</h3>
              <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
                Add photo
              </Button>
            </div>
            <PhotoGallery
              photos={photos ?? []}
              onDelete={(photoId) => deletePhoto.mutate(photoId)}
              actions={(photo) => (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={diagnosePhoto.isPending}
                  onClick={() => handleDiagnose(photo.id)}
                >
                  Diagnose
                </Button>
              )}
            />

            <div className="flex items-center justify-between border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Care &amp; diagnosis history</h3>
              <Button
                variant="outline"
                size="sm"
                disabled={careSuggestions.isPending}
                onClick={handleCareSuggestions}
              >
                {careSuggestions.isPending ? 'Thinking…' : 'Get care suggestions'}
              </Button>
            </div>
            {!diagnoses || diagnoses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No diagnoses or care suggestions yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="rounded-lg border p-3 text-sm">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {diagnosis.photoId ? 'Photo diagnosis' : 'Care suggestion'} ·{' '}
                      {new Date(diagnosis.createdAt).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap">{diagnosis.resultText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <PhotoUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        entityType="PLANTED_PLANT"
        entityId={plantingId}
      />
    </>
  )
}
