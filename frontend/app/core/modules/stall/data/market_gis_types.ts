export interface ProjectFloor {
  id: string
  name: string
  shortLabel: string
  level: number
  description?: string
  isFull?: boolean
}

export interface ProjectZone {
  id: string
  name: string
  sectionNumber: string
  category: string
  color: string
  stallsAvailable: number
  totalStalls: number
  realAreaSqm: number
  centroid: [number, number]
  coordinates: [number, number][]
  floors?: ProjectFloor[]
  stalls?: any[]
}
