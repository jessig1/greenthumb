import { useMemo, useState, type ComponentType } from 'react'
import { ArrowUpRight, Flower2, House, Leaf, Search, Sprout, SunMedium, Trees } from 'lucide-react'
import { Link } from 'react-router'
import { usePlants } from './api'
import type { PlantCategory } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCategoryLabel } from '@/lib/labels'

const CATEGORIES: PlantCategory[] = ['VEGETABLE', 'HERB', 'FLOWER', 'FRUIT', 'HOUSEPLANT', 'OTHER']

const CATEGORY_ICONS: Record<PlantCategory, ComponentType<{ className?: string }>> = {
  VEGETABLE: Sprout,
  HERB: Leaf,
  FLOWER: Flower2,
  FRUIT: Trees,
  HOUSEPLANT: House,
  OTHER: Sprout,
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
    <div className="flex flex-col gap-7 sm:gap-9">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Know what you grow</p>
        <h1 className="page-title">Plant library</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Explore care, light, watering, and harvest guidance for every plant in your collection.
        </p>
      </header>

      <div className="surface-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search plants..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 border-0 bg-muted/60 pl-10 shadow-none focus-visible:bg-card"
            aria-label="Search plants"
          />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value as PlantCategory | 'ALL')}>
          <SelectTrigger className="h-11 w-full bg-card sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {plantCategoryLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filteredPlants?.length === 0 ? (
        <div className="surface-panel flex flex-col items-center px-5 py-12 text-center">
          <Search className="size-7 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No plants found</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try another name or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlants?.map((plant) => {
            const PlantIcon = CATEGORY_ICONS[plant.category]
            return (
              <Link key={plant.id} to={`/plants/${plant.id}`} className="group">
                <Card className="h-full min-h-52 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex h-full flex-col p-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary text-primary transition-transform group-hover:scale-105 group-hover:-rotate-2">
                        <PlantIcon className="size-6" />
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </div>
                    <div className="mt-5">
                      <Badge variant="secondary" className="mb-2">
                        {plantCategoryLabel(plant.category)}
                      </Badge>
                      <h2 className="text-lg font-semibold tracking-[-0.025em] group-hover:text-primary">
                        {plant.commonName}
                      </h2>
                      {plant.scientificName && (
                        <p className="mt-0.5 truncate text-sm italic text-muted-foreground">{plant.scientificName}</p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-medium text-muted-foreground">
                      <SunMedium className="size-4 text-amber-500" />
                      {lightRequirementLabel(plant.lightRequirement)}
                    </div>
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
