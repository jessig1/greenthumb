import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { usePlants } from './api'
import type { PlantCategory } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCategoryLabel, plantCareDifficultyLabel } from '@/lib/labels'
import { Sprout, Search, Sun, ArrowRight, Filter } from 'lucide-react'

const CATEGORIES: PlantCategory[] = ['VEGETABLE', 'HERB', 'FLOWER', 'FRUIT', 'HOUSEPLANT', 'OTHER']

const CATEGORY_BADGE_COLOR: Record<PlantCategory, string> = {
  VEGETABLE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  HERB: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
  FLOWER: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  FRUIT: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  HOUSEPLANT: 'bg-emerald-600/10 text-emerald-800 dark:text-emerald-200 border-emerald-600/30',
  OTHER: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
}

export function PlantsListPage() {
  const [category, setCategory] = useState<PlantCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: plants, isLoading } = usePlants(category === 'ALL' ? undefined : category)

  const filteredPlants = useMemo(() => {
    if (!plants) return []
    if (!searchQuery.trim()) return plants

    const query = searchQuery.toLowerCase()
    return plants.filter(
      (p) =>
        p.commonName.toLowerCase().includes(query) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)),
    )
  }, [plants, searchQuery])

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sprout className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Plant Catalog & Care Guides</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Browse plant species, sunlight requirements, watering schedules, and harvest timelines
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plant species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background text-xs rounded-xl"
            />
          </div>

          <Select value={category} onValueChange={(value) => setCategory(value as PlantCategory | 'ALL')}>
            <SelectTrigger className="w-full sm:w-44 text-xs rounded-xl">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {plantCategoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Pills Bar for Quick Filtering */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategory('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            category === 'ALL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          All Plants
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === c
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {plantCategoryLabel(c)}
          </button>
        ))}
      </div>

      {/* Plant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filteredPlants.length === 0 ? (
        <Card className="border-dashed border-2 text-center p-8 bg-muted/20">
          <CardContent className="flex flex-col items-center gap-2 pt-4">
            <Sprout className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-semibold">No plants found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search filter or category selection.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredPlants.map((plant) => (
            <Link key={plant.id} to={`/plants/${plant.id}`}>
              <Card className="group h-full glass-card hover:-translate-y-1 transition-all rounded-2xl overflow-hidden hover:border-emerald-500/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {plant.commonName}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[11px] font-semibold ${CATEGORY_BADGE_COLOR[plant.category]}`}>
                      {plantCategoryLabel(plant.category)}
                    </Badge>
                  </div>
                  {plant.scientificName && (
                    <CardDescription className="italic text-xs font-serif">
                      {plant.scientificName}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Sun className="h-3.5 w-3.5 shrink-0" />
                      <span>{lightRequirementLabel(plant.lightRequirement)}</span>
                    </div>

                    {plant.careDifficulty && (
                      <span className="ml-auto text-[11px] font-medium bg-muted/60 px-2 py-0.5 rounded-md">
                        {plantCareDifficultyLabel(plant.careDifficulty)} care
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform gap-1">
                    <span>Care Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
