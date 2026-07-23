import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Apple, Carrot, Flower2, House, Leaf, Search, SearchX, Sprout, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePlants } from './api'
import type { PlantCategory } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCategoryLabel } from '@/lib/labels'

const CATEGORIES: PlantCategory[] = ['VEGETABLE', 'HERB', 'FLOWER', 'FRUIT', 'HOUSEPLANT', 'OTHER']

const CATEGORY_META: Record<PlantCategory, { icon: LucideIcon; className: string }> = {
  VEGETABLE: { icon: Carrot, className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  HERB: { icon: Leaf, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  FLOWER: { icon: Flower2, className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  FRUIT: { icon: Apple, className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  HOUSEPLANT: { icon: House, className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  OTHER: { icon: Sprout, className: 'bg-lime-500/10 text-lime-600 dark:text-lime-500' },
}

export function PlantsListPage() {
  const [category, setCategory] = useState<PlantCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const { data: plants, isLoading } = usePlants(category === 'ALL' ? undefined : category)

  const filteredPlants = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return plants
    return plants?.filter(
      (plant) =>
        plant.commonName.toLowerCase().includes(query) ||
        plant.scientificName?.toLowerCase().includes(query),
    )
  }, [plants, search])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Plant catalog</h1>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search plants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value as PlantCategory | 'ALL')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {plantCategoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredPlants?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              No plants match your search. Try a different name or category.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlants?.map((plant) => {
            const meta = CATEGORY_META[plant.category] ?? CATEGORY_META.OTHER
            const CategoryIcon = meta.icon
            return (
              <Link key={plant.id} to={`/plants/${plant.id}`}>
                <Card className="h-full transition-all hover:border-primary/40 hover:shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2.5">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                      >
                        <CategoryIcon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1 pt-1.5 leading-snug">{plant.commonName}</span>
                      <Badge variant="secondary" className="mt-1.5">
                        {plantCategoryLabel(plant.category)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {plant.scientificName && <p className="italic">{plant.scientificName}</p>}
                    <p className="flex items-center gap-1">
                      <Sun className="size-3.5" />
                      {lightRequirementLabel(plant.lightRequirement)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
