// ================================================================
// Sub-Stall Layout Engine for Chatuchak Project Polygons
// - แปลง polygon (lng/lat) เป็นระบบพิกัดเมตรภายใน (local metric plane)
// - หมุนให้แนวขอบที่ยาวที่สุดเป็นแนวนอน แล้ววางแผงย่อยแบบ "แผงหันหลังชนกัน 2 แถว + ทางเดิน"
// - เก็บเฉพาะแผงที่อยู่ภายในกรอบโครงการทั้งหมด (มีระยะร่นจากขอบ)
// ================================================================

import type { ProjectZone } from './chatuchak_real_polygons'

export type StallStatus = 'available' | 'reserved' | 'occupied'

export interface MapStall {
  code: string
  projectId: string
  zone: string
  status: StallStatus
  areaType: string
  size: number
  widthM: number
  depthM: number
  entryFee: number
  monthlyRent: number
  commonFee: number
  depositFee: number
  photo: string
  coordinates: [number, number][]
  center: [number, number]
}

export interface ProjectStallLayout {
  stalls: MapStall[]
  labelPoint: [number, number]
  total: number
  available: number
  reserved: number
  occupied: number
}

// Stall module dimensions (meters)
const STALL_W = 2.5 // ความกว้างหน้าแผง
const STALL_D = 2.0 // ความลึกแผง
const AISLE = 2.0 // ทางเดินระหว่างแถว
const CROSS_AISLE = 2.0 // ทางเดินตัดขวาง
const STALLS_PER_BLOCK = 10 // แผงต่อบล็อกก่อนมีทางเดินตัดขวาง
const EDGE_SETBACK = 0.8 // ระยะร่นจากแนวกรอบโครงการ

type Pt = [number, number]

const M_PER_DEG_LAT = 110540

const makeProjector = (origin: Pt) => {
  const mPerDegLng = 111320 * Math.cos((origin[1] * Math.PI) / 180)
  return {
    toLocal: ([lng, lat]: Pt): Pt => [(lng - origin[0]) * mPerDegLng, (lat - origin[1]) * M_PER_DEG_LAT],
    toLngLat: ([x, y]: Pt): Pt => [origin[0] + x / mPerDegLng, origin[1] + y / M_PER_DEG_LAT]
  }
}

const rotate = ([x, y]: Pt, a: number): Pt => {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x * c - y * s, x * s + y * c]
}

const pointInPolygon = ([x, y]: Pt, poly: Pt[]): boolean => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const distToSegment = ([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt): number => {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

const distToBoundary = (p: Pt, poly: Pt[]): number => {
  let d = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    d = Math.min(d, distToSegment(p, poly[j], poly[i]))
  }
  return d
}

const rowLabel = (i: number): string => {
  let s = ''
  let n = i
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

// Deterministic pseudo-random [0,1) from a string (stable stall status across reloads)
const hash01 = (str: string): number => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

// Interior label point (approximate pole of inaccessibility) so badges sit INSIDE the frame
const findLabelPoint = (poly: Pt[]): Pt => {
  const xs = poly.map(p => p[0])
  const ys = poly.map(p => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  let best: Pt = [(minX + maxX) / 2, (minY + maxY) / 2]
  let bestD = -1
  const steps = 40
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p: Pt = [minX + ((maxX - minX) * i) / steps, minY + ((maxY - minY) * j) / steps]
      if (!pointInPolygon(p, poly)) continue
      const d = distToBoundary(p, poly)
      if (d > bestD) {
        bestD = d
        best = p
      }
    }
  }
  return best
}

export const buildProjectStallLayout = (project: ProjectZone): ProjectStallLayout => {
  // Remove duplicated closing vertex
  const ring = project.coordinates.slice(0, -1) as Pt[]
  const origin = ring[0]
  const proj = makeProjector(origin)
  const local = ring.map(proj.toLocal)

  // Orientation: align rows with the longest polygon edge (matches real aisle direction)
  let longest = 0
  let angle = 0
  for (let i = 0; i < local.length; i++) {
    const a = local[i]
    const b = local[(i + 1) % local.length]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (len > longest) {
      longest = len
      angle = Math.atan2(b[1] - a[1], b[0] - a[0])
    }
  }

  const rotated = local.map(p => rotate(p, -angle))
  const xs = rotated.map(p => p[0])
  const ys = rotated.map(p => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const cellFits = (x0: number, y0: number, x1: number, y1: number) => {
    const corners: Pt[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [(x0 + x1) / 2, (y0 + y1) / 2]]
    return corners.every(c => pointInPolygon(c, rotated) && distToBoundary(c, rotated) >= EDGE_SETBACK * 0.5)
  }

  const original = project.totalStalls > 0 ? project.stallsAvailable / project.totalStalls : 0
  const availRatio = project.stallsAvailable === 0 ? 0 : Math.max(0.12, Math.min(0.45, original))
  const reservedRatio = project.stallsAvailable === 0 ? 0 : 0.06

  const stalls: MapStall[] = []
  const bandH = STALL_D * 2 + AISLE
  let rowIdx = 0

  for (let bandY = minY + EDGE_SETBACK; bandY + STALL_D <= maxY - EDGE_SETBACK; bandY += bandH) {
    for (let r = 0; r < 2; r++) {
      const y0 = bandY + r * STALL_D
      const y1 = y0 + STALL_D
      if (y1 > maxY - EDGE_SETBACK) break

      const rowCells: { x0: number; x1: number }[] = []
      let col = 0
      let x = minX + EDGE_SETBACK
      while (x + STALL_W <= maxX - EDGE_SETBACK) {
        if (col > 0 && col % STALLS_PER_BLOCK === 0) {
          x += CROSS_AISLE
          col = 0
          if (x + STALL_W > maxX - EDGE_SETBACK) break
        }
        const x0 = x
        const x1 = x + STALL_W
        if (cellFits(x0, y0, x1, y1)) rowCells.push({ x0, x1 })
        x += STALL_W
        col++
      }

      if (rowCells.length === 0) continue
      const letter = rowLabel(rowIdx)
      rowCells.forEach((cell, idx) => {
        const code = `${project.sectionNumber}-${letter}${String(idx + 1).padStart(2, '0')}`
        const isCorner = idx === 0 || idx === rowCells.length - 1
        const u = hash01(`${project.id}:${code}`)
        let status: StallStatus = 'occupied'
        if (u < availRatio) status = 'available'
        else if (u < availRatio + reservedRatio) status = 'reserved'

        // แผงเรียงชิดติดกันเป็นบล็อกสถาปัตยกรรม (Seamless Architectural Island)
        // มีเส้นแบ่งล็อคสีขาวคมชัดระดับมิลลิเมตร ไร้เส้นซ้ำซ้อนหนาเทอะทะ
        const ringLocal: Pt[] = [
          [cell.x0, y0],
          [cell.x1, y0],
          [cell.x1, y1],
          [cell.x0, y1],
          [cell.x0, y0]
        ]
        const coords = ringLocal.map(p => proj.toLngLat(rotate(p, angle)))
        const center = proj.toLngLat(rotate([(cell.x0 + cell.x1) / 2, (y0 + y1) / 2], angle))

        stalls.push({
          code,
          projectId: project.id,
          zone: project.name,
          status,
          areaType: isCorner ? 'หัวมุม' : 'ทั่วไป',
          size: STALL_W * STALL_D,
          widthM: STALL_W,
          depthM: STALL_D,
          entryFee: isCorner ? 90000 : 75000,
          monthlyRent: isCorner ? 2200 : 1800,
          commonFee: 500,
          depositFee: isCorner ? 2200 : 1800,
          photo: '/images/stall_3d_perspective.jpg',
          coordinates: coords,
          center
        })
      })
      rowIdx++
    }
  }

  const labelPoint = proj.toLngLat(findLabelPoint(local))
  const available = stalls.filter(s => s.status === 'available').length
  const reserved = stalls.filter(s => s.status === 'reserved').length

  return {
    stalls,
    labelPoint,
    total: stalls.length,
    available,
    reserved,
    occupied: stalls.length - available - reserved
  }
}

// Pre-compute layouts for all projects once (deterministic)
const layoutCache = new Map<string, ProjectStallLayout>()

export const getProjectStallLayout = (project: ProjectZone): ProjectStallLayout => {
  let layout = layoutCache.get(project.id)
  if (!layout) {
    layout = buildProjectStallLayout(project)
    layoutCache.set(project.id, layout)
  }
  return layout
}
