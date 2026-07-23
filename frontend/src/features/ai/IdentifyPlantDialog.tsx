import { useState, type ChangeEvent, type ComponentType } from 'react'
import {
  AlertTriangle,
  Bug,
  CircleCheck,
  Droplets,
  Info,
  Layers,
  Scissors,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  UploadCloud,
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import type { IdentifyPlantResponse } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGardens } from '@/features/gardens/api'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { plantCareDifficultyLabel, plantCategoryLabel, plantLifeCycleLabel } from '@/lib/labels'
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
    <div className="flex gap-2.5 rounded-xl border border-border/50 bg-muted/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className="text-xs leading-snug text-foreground/90 font-medium">{value}</p>
      </div>
    </div>
  )
}

export function IdentifyPlantDialog({ open, onOpenChange }: IdentifyPlantDialogProps) {
  const identifyPlant = useIdentifyPlant()
  const { data: gardens } = useGardens()
  const [result, setResult] = useState<IdentifyPlantResponse | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const recommendedGardens = (result?.recommendedGardenIds ?? [])
    .map((id) => gardens?.find((garden) => garden.id === id))
    .filter((garden) => garden != null)

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

  const handleAddToGarden = () => {
    handleOpenChange(false)
    setAddOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">AI Plant Identification</DialogTitle>
                <DialogDescription className="text-xs">
                  Upload a photo of any leaf or plant to identify species and get care guides
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {!result && (
              <div className="flex flex-col gap-3">
                <Label htmlFor="identify-file" className="sr-only">Upload Plant Photo</Label>
                <div className="relative border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500 rounded-2xl p-8 text-center bg-emerald-500/5 transition-all flex flex-col items-center justify-center gap-3 group">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Click to upload photo or take picture</p>
                    <p className="text-xs text-muted-foreground">Supports JPG, PNG, or WEBP (up to 8MB)</p>
                  </div>
                  <Input
                    id="identify-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={identifyPlant.isPending}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                {identifyPlant.isPending && (
                  <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Analyzing plant species & botanical features…</span>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
                <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xl font-bold text-foreground">
                      {result.suggestedCommonName ?? 'Unknown plant'}
                    </p>
                    {result.suggestedScientificName && (
                      <p className="text-xs text-muted-foreground italic font-serif">{result.suggestedScientificName}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    {result.suggestedCategory && (
                      <Badge variant="secondary" className="bg-emerald-600 text-white font-semibold text-xs">
                        {plantCategoryLabel(result.suggestedCategory)}
                      </Badge>
                    )}
                    {result.suggestedLifeCycle && (
                      <Badge variant="outline" className="text-xs">
                        {plantLifeCycleLabel(result.suggestedLifeCycle)}
                      </Badge>
                    )}
                    {result.suggestedCareDifficulty && (
                      <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-700 dark:text-amber-300">
                        {plantCareDifficultyLabel(result.suggestedCareDifficulty)} care
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                  {result.addedToCatalog ? (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Added to your plant catalog for next time</span>
                    </>
                  ) : result.matchedPlantId ? (
                    <>
                      <CircleCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Matches an entry in your plant catalog</span>
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4 shrink-0 text-amber-500" />
                      <span>No exact catalog match - pick closest match when adding</span>
                    </>
                  )}
                </div>

                {(result.light ||
                  result.temperature ||
                  result.soil ||
                  result.watering ||
                  result.fertilizer ||
                  result.pruning ||
                  result.pestManagement ||
                  result.toxicity ||
                  result.other) && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Botanical Care Guide</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <CareItem icon={Sun} label="Light" value={result.light} />
                      <CareItem icon={Thermometer} label="Temperature" value={result.temperature} />
                      <CareItem icon={Layers} label="Soil" value={result.soil} />
                      <CareItem icon={Droplets} label="Watering" value={result.watering} />
                      <CareItem icon={Sprout} label="Fertilizer" value={result.fertilizer} />
                      <CareItem icon={Scissors} label="Pruning" value={result.pruning} />
                      <CareItem icon={Bug} label="Pest management" value={result.pestManagement} />
                      <CareItem icon={AlertTriangle} label="Toxicity / warnings" value={result.toxicity} />
                      <CareItem icon={Info} label="Other" value={result.other} />
                    </div>
                  </div>
                )}

                {recommendedGardens.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended for your gardens</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedGardens.map((garden) => (
                        <Link key={garden.id} to={`/gardens/${garden.id}`} onClick={() => handleOpenChange(false)}>
                          <Badge variant="outline" className="hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                            🌱 {garden.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                    {result.gardenFitNotes && (
                      <p className="text-xs text-muted-foreground">{result.gardenFitNotes}</p>
                    )}
                  </div>
                )}

                {result.notes && (
                  <p className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border/40 leading-relaxed">
                    {result.notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {result && (
            <DialogFooter>
              <Button
                type="button"
                onClick={handleAddToGarden}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold gap-1.5"
              >
                <Sprout className="h-4 w-4" />
                <span>{result.matchedPlantId && !result.addedToCatalog ? 'Use this match' : 'Add to a garden'}</span>
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
