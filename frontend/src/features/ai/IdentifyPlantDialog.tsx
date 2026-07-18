import { useState, type ChangeEvent, type ComponentType } from 'react'
import { CircleCheck, Droplets, Info, Layers, Scissors, Sparkles, Sprout, Sun, Bug } from 'lucide-react'
import { toast } from 'sonner'
import type { IdentifyPlantResponse } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { plantCategoryLabel } from '@/lib/labels'
import { useIdentifyPlant } from './api'

interface IdentifyPlantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CareItemProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string | null
}

function CareItem({ icon: Icon, label, value }: CareItemProps) {
  if (!value) return null
  return (
    <div className="flex gap-2.5 rounded-lg border bg-muted/30 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="text-sm leading-snug">{value}</p>
      </div>
    </div>
  )
}

export function IdentifyPlantDialog({ open, onOpenChange }: IdentifyPlantDialogProps) {
  const identifyPlant = useIdentifyPlant()
  const [result, setResult] = useState<IdentifyPlantResponse | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setResult(null)
      identifyPlant.reset()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    identifyPlant.mutate(file, {
      onSuccess: (data) => setResult(data),
      onError: (error) => toast.error(error.message),
    })
  }

  // Whether or not the AI matched an existing catalog plant, hand off to the normal add flow -
  // it composes the existing garden/container/inventory picker rather than duplicating it.
  const handleAddToGarden = () => {
    handleOpenChange(false)
    setAddOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Identify a plant</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {!result && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="identify-file">Photo</Label>
                <Input
                  id="identify-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={identifyPlant.isPending}
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP, up to 8MB.</p>
                {identifyPlant.isPending && (
                  <p className="text-sm text-muted-foreground">Identifying…</p>
                )}
              </div>
            )}

            {result && (
              <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight">
                      {result.suggestedCommonName ?? 'Unknown plant'}
                    </p>
                    {result.suggestedScientificName && (
                      <p className="text-sm text-muted-foreground italic">{result.suggestedScientificName}</p>
                    )}
                  </div>
                  {result.suggestedCategory && (
                    <Badge variant="secondary" className="shrink-0">
                      {plantCategoryLabel(result.suggestedCategory)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {result.addedToCatalog ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      Added to your plant catalog for next time
                    </>
                  ) : result.matchedPlantId ? (
                    <>
                      <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                      Matches an entry in your plant catalog
                    </>
                  ) : (
                    <>
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      No exact catalog match - pick the closest one when adding
                    </>
                  )}
                </div>

                {(result.light ||
                  result.soil ||
                  result.watering ||
                  result.fertilizer ||
                  result.pruning ||
                  result.pestManagement ||
                  result.other) && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Care guide</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <CareItem icon={Sun} label="Light" value={result.light} />
                      <CareItem icon={Layers} label="Soil" value={result.soil} />
                      <CareItem icon={Droplets} label="Watering" value={result.watering} />
                      <CareItem icon={Sprout} label="Fertilizer" value={result.fertilizer} />
                      <CareItem icon={Scissors} label="Pruning" value={result.pruning} />
                      <CareItem icon={Bug} label="Pest management" value={result.pestManagement} />
                      <CareItem icon={Info} label="Other" value={result.other} />
                    </div>
                  </div>
                )}

                {result.notes && (
                  <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{result.notes}</p>
                )}
              </div>
            )}
          </div>

          {result && (
            <DialogFooter>
              <Button type="button" onClick={handleAddToGarden}>
                {result.matchedPlantId && !result.addedToCatalog ? 'Use this match' : 'Add to a garden'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <QuickAddPlantDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialPlantId={result?.matchedPlantId ?? undefined}
      />
    </>
  )
}
