// Composable for Market Visit Scheduling: Master Weekly Pattern (Set once, recurring indefinitely) + Specific Date Overrides

export interface IVisitSlot {
  id: number | string
  time: string
  startTime?: string
  endTime?: string
  capacity: number
  enabled: boolean
  note: string
  remainingQueues?: number
  isFull?: boolean
}

export interface IVisitDayConfig {
  enabled: boolean
  badge?: string
  badgeType?: string
  description?: string
  slots: IVisitSlot[]
}

// Master Weekly Day Schedule (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
export interface IWeeklyDayMaster {
  dayOfWeek: number
  dayName: string
  enabled: boolean
  badge?: string
  badgeType?: string
  description?: string
  slots: IVisitSlot[]
}

export type IWeeklyMasterMap = Record<number, IWeeklyDayMaster>
export type IDateOverrideMap = Record<string, Partial<IVisitDayConfig>>
export type IMarketScheduleMap = Record<string, IVisitDayConfig>

export interface DayMetaItem {
  date: string             // YYYY-MM-DD
  dayOfWeek: number        // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string          // 'วันเสาร์'
  dayNumber: number        // 24
  month: string            // 'ต.ค. 69'
  monthShort: string       // 'ต.ค. 69'
  isWeekend: boolean
}

export interface TenantSlotConflictInfo {
  bookingNumber: string
  marketName: string
  projectName: string
  stallNumbers: string[]
}

export interface TimeSlotItem {
  time: string
  capacityText: string
  capacityClass: string
  note: string
  isFull: boolean
  enabled?: boolean
  capacity?: number
  bookedCount?: number
  bookedStalls?: string[]
  remainingQueues: number
  hasTenantConflict?: boolean
  tenantConflictInfo?: TenantSlotConflictInfo | null
}

export interface AvailableDateSlot {
  date: string
  dayName: string
  dayNum: string
  monthShort: string
  badge?: string
  badgeType?: string
  slotsText: string
  statusClass: string
  isPopular?: boolean
  description?: string
  isAllFull?: boolean
  isClosed?: boolean
  totalCapacity?: number
  totalBooked?: number
  totalRemainingQueues?: number
  slots: TimeSlotItem[]
}

const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const thaiMonthsFull = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const MARKET_LOOKUP_META: Array<{ id: string; slug: string; name: string; prefix: string }> = [
  { id: '1', slug: 'chatuchak', name: 'ตลาดนัดจตุจักร', prefix: 'JJ-' },
  { id: '2', slug: 'pracha-niwet-1', name: 'ตลาดประชานิเวศน์ 1', prefix: 'PRA-' },
  { id: '3', slug: 'min-buri', name: 'ตลาดมีนบุรี', prefix: 'MIN-' },
  { id: '4', slug: 'singhanat', name: 'ตลาดสิงหา', prefix: 'SIN-' },
  { id: '5', slug: 'thewarat', name: 'ตลาดเทวราช', prefix: 'THE-' },
  { id: '6', slug: 'rat-burana', name: 'ตลาดราษฎร์บูรณะ', prefix: 'RAT-' },
  { id: '7', slug: 'bang-kapi', name: 'ตลาดบางกะปิ', prefix: 'BKP-' },
  { id: '8', slug: 'wongwian-lek', name: 'ตลาดพระเครื่องวงเวียนเล็ก', prefix: 'WON-' },
  { id: '9', slug: 'nong-chok', name: 'ตลาดหนองจอก', prefix: 'NON-' },
  { id: '10', slug: 'ratchadaphisek', name: 'ตลาดรัชดาภิเษก', prefix: 'RCH-' },
  { id: '11', slug: 'thonburi-sanamluang-2', name: 'ตลาดธนบุรี (สนามหลวง 2)', prefix: 'THO-' },
  { id: '12', slug: 'bang-khae-phirom', name: 'ตลาดบางแคภิรมย์', prefix: 'BKH-' }
]

let cachedScheduleBookings: any[] = []

export const setCachedScheduleBookings = (bookings: any[]) => {
  cachedScheduleBookings = Array.isArray(bookings) ? bookings : []
}

export const getCachedScheduleBookings = (): any[] => cachedScheduleBookings

export const normalizeVisitDateToIso = (dateStr?: string): string => {
  if (!dateStr) return ''
  const raw = String(dateStr).trim()
  if (!raw || raw === 'รอยืนยันวันนัดหมาย') return ''

  // 1. ISO YYYY-MM-DD (or YYYY-MM-DDTHH:mm:ss)
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    let year = parseInt(isoMatch[1], 10)
    if (year > 2400) year -= 543
    return `${year}-${isoMatch[2]}-${isoMatch[3]}`
  }

  // 2. DD/MM/YYYY
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0')
    const month = slashMatch[2].padStart(2, '0')
    let year = parseInt(slashMatch[3], 10)
    if (year > 2400) year -= 543
    return `${year}-${month}-${day}`
  }

  // 3. Thai Date String (e.g. 'อาทิตย์ 25 ตุลาคม 2569' or '25 ต.ค. 69')
  for (let mIdx = 0; mIdx < 12; mIdx++) {
    const fullM = thaiMonthsFull[mIdx]
    const shortM = thaiMonths[mIdx]
    if (raw.includes(fullM) || raw.includes(shortM)) {
      const mToken = raw.includes(fullM) ? fullM : shortM
      const escapedToken = mToken.replace(/\./g, '\\.')
      const regex = new RegExp(`(\\d{1,2})\\s*${escapedToken}\\s*(\\d{2,4})`)
      const m = raw.match(regex)
      if (m) {
        const day = m[1].padStart(2, '0')
        const month = String(mIdx + 1).padStart(2, '0')
        let year = parseInt(m[2], 10)
        if (year < 100) year = 2500 + year - 543
        else if (year > 2400) year -= 543
        return `${year}-${month}-${day}`
      }
    }
  }

  return ''
}

export const doesBookingMatchMarket = (booking: any, marketId: string, marketName?: string): boolean => {
  if (!booking) return false
  const targetStr = String(marketId || '').trim().toLowerCase()
  const targetName = String(marketName || '').trim()
  const meta = MARKET_LOOKUP_META.find(
    m => m.id === targetStr || m.slug === targetStr || (targetName && (m.name === targetName || targetName.includes(m.name)))
  )

  const bMarketId = String(booking.market_id || '').trim()
  const bMarketSlug = String(booking.market_slug || '').trim().toLowerCase()
  const bMarketName = String(booking.market_name || '').trim()
  const bStallNum = String(booking.stall_number || booking.stall_ident || '').trim().toUpperCase()

  if (meta) {
    if (bMarketId && bMarketId === meta.id) return true
    if (bMarketSlug && bMarketSlug === meta.slug) return true
    if (bMarketName && (bMarketName === meta.name || bMarketName.includes(meta.name) || meta.name.includes(bMarketName))) return true
    if (bStallNum && bStallNum.startsWith(meta.prefix)) return true
    return false
  }

  if (targetName && bMarketName) {
    return bMarketName === targetName || bMarketName.includes(targetName)
  }
  return true
}

export const isBookingOccupyingVisitSlot = (booking: any): boolean => {
  if (!booking) return false
  const status = String(booking.status || '').trim()
  if (['cancelled', 'rejected', 'not_interested', 'no_show', 'terminated'].includes(status)) return false
  const dateIso = normalizeVisitDateToIso(booking.visit_date)
  const slotStr = String(booking.visit_time_slot || booking.visit_time || '').trim()
  if (!dateIso || !slotStr || slotStr === 'รอยืนยันเวลา') return false
  return true
}

export const getAppointmentRoundKey = (booking: any): string => {
  if (!booking) return ''
  // 1 การจอง = 1 แผง = 1 การ์ด (ไม่รวมหลายแผงเข้าด้วยกัน)
  return String(booking.id || booking.booking_number || booking.booking_no || '')
}

export const parseSlotTimeRange = (timeStr: string) => {
  if (!timeStr) return { startTime: '09:00', endTime: '10:00' }
  const match = timeStr.match(/(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/)
  if (match) {
    const startH = match[1].padStart(2, '0')
    const startM = match[2]
    const endH = match[3].padStart(2, '0')
    const endM = match[4]
    return {
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`
    }
  }
  return { startTime: '09:00', endTime: '10:00' }
}

export const formatSlotTime = (startTime?: string, endTime?: string) => {
  const start = startTime ? startTime.replace(':', '.') : '09.00'
  const end = endTime ? endTime.replace(':', '.') : '10.00'
  return `${start} - ${end} น.`
}

export const createDefaultSlotList = (): IVisitSlot[] => [
  { id: 1, time: '09.30 - 10.30 น.', startTime: '09:30', endTime: '10:30', capacity: 3, enabled: true, note: 'ช่วงเช้า อากาศสบาย เหมาะดูโครงสร้าง', remainingQueues: 3, isFull: false },
  { id: 2, time: '11.00 - 12.00 น.', startTime: '11:00', endTime: '12:00', capacity: 5, enabled: true, note: 'ช่วงสาย บรรยากาศเริ่มคึกคัก', remainingQueues: 5, isFull: false },
  { id: 3, time: '13.00 - 14.00 น.', startTime: '13:00', endTime: '14:00', capacity: 2, enabled: true, note: 'ช่วงบ่าย มีเจ้าหน้าที่พาชม', remainingQueues: 2, isFull: false },
  { id: 4, time: '15.30 - 16.30 น.', startTime: '15:30', endTime: '16:30', capacity: 4, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกจริง', remainingQueues: 4, isFull: false }
]

// Default 7-day Weekly Pattern (เซ็ตครั้งเดียว หมุนเวียนใช้ได้ตลอดไป)
export const createDefaultWeeklyMaster = (): IWeeklyMasterMap => {
  return {
    // 0 = วันอาทิตย์
    0: {
      dayOfWeek: 0,
      dayName: 'วันอาทิตย์',
      enabled: true,
      badge: 'เปิดเต็มวัน',
      badgeType: 'badge-success',
      description: 'เปิดเต็มวัน เหมาะดูทำเลและทราฟฟิกครอบครัว',
      slots: [
        { id: 1, time: '09.30 - 10.30 น.', startTime: '09:30', endTime: '10:30', capacity: 3, enabled: true, note: 'ช่วงเช้า อากาศสบาย เหมาะดูโครงสร้าง', remainingQueues: 3, isFull: false },
        { id: 2, time: '11.00 - 12.00 น.', startTime: '11:00', endTime: '12:00', capacity: 4, enabled: true, note: 'ช่วงสาย บรรยากาศเริ่มคึกคัก', remainingQueues: 4, isFull: false },
        { id: 3, time: '13.00 - 14.00 น.', startTime: '13:00', endTime: '14:00', capacity: 2, enabled: true, note: 'ช่วงบ่าย มีเจ้าหน้าที่พาชม', remainingQueues: 2, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', startTime: '15:30', endTime: '16:30', capacity: 3, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกคนเดินจริง', remainingQueues: 3, isFull: false }
      ]
    },
    // 1 = วันจันทร์
    1: {
      dayOfWeek: 1,
      dayName: 'วันจันทร์',
      enabled: false,
      badge: 'ปิดรับนัด',
      badgeType: 'badge-neutral',
      description: 'วันปิดปรับปรุงและบำรุงรักษาพื้นที่ตลาด',
      slots: createDefaultSlotList().map(s => ({ ...s, enabled: false, remainingQueues: 0, isFull: true }))
    },
    // 2 = วันอังคาร
    2: {
      dayOfWeek: 2,
      dayName: 'วันอังคาร',
      enabled: false,
      badge: 'ปิดรับนัด',
      badgeType: 'badge-neutral',
      description: 'วันปิดปรับปรุงและบำรุงรักษาพื้นที่ตลาด',
      slots: createDefaultSlotList().map(s => ({ ...s, enabled: false, remainingQueues: 0, isFull: true }))
    },
    // 3 = วันพุธ
    3: {
      dayOfWeek: 3,
      dayName: 'วันพุธ',
      enabled: true,
      badge: 'วันทำการ',
      badgeType: 'badge-neutral',
      description: 'วันทำการราชการ ตรวจดูโครงสร้างระบบอาคาร',
      slots: [
        { id: 1, time: '09.30 - 10.30 น.', startTime: '09:30', endTime: '10:30', capacity: 2, enabled: true, note: 'ช่วงเช้า เจ้าหน้าที่ฝ่ายอาคารพาชม', remainingQueues: 2, isFull: false },
        { id: 2, time: '11.00 - 12.00 น.', startTime: '11:00', endTime: '12:00', capacity: 3, enabled: false, note: 'ติดตรวจพื้นที่ประจำสัปดาห์', remainingQueues: 0, isFull: true },
        { id: 3, time: '13.00 - 14.00 น.', startTime: '13:00', endTime: '14:00', capacity: 3, enabled: true, note: 'ช่วงบ่าย ตรวจระบบไฟฟ้า-ประปา', remainingQueues: 3, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', startTime: '15:30', endTime: '16:30', capacity: 2, enabled: false, note: 'ไม่มีรอบเจ้าหน้าที่ช่วงเย็น', remainingQueues: 0, isFull: true }
      ]
    },
    // 4 = วันพฤหัสบดี
    4: {
      dayOfWeek: 4,
      dayName: 'วันพฤหัสบดี',
      enabled: false,
      badge: 'ปิดรับนัด',
      badgeType: 'badge-neutral',
      description: 'วันปิดปรับปรุงและบำรุงรักษาพื้นที่ตลาด',
      slots: createDefaultSlotList().map(s => ({ ...s, enabled: false, remainingQueues: 0, isFull: true }))
    },
    // 5 = วันศุกร์
    5: {
      dayOfWeek: 5,
      dayName: 'วันศุกร์',
      enabled: true,
      badge: 'ตลาดกลางคืน',
      badgeType: 'badge-purple',
      description: 'รอบบ่าย-ค่ำ เตรียมพื้นที่ตลาดกลางคืน',
      slots: [
        { id: 1, time: '09.30 - 10.30 น.', startTime: '09:30', endTime: '10:30', capacity: 2, enabled: false, note: 'งดรอบเช้า เตรียมพื้นที่ตลาดกลางคืน', remainingQueues: 0, isFull: true },
        { id: 2, time: '11.00 - 12.00 น.', startTime: '11:00', endTime: '12:00', capacity: 3, enabled: true, note: 'ช่วงสาย เริ่มเตรียมพื้นที่', remainingQueues: 3, isFull: false },
        { id: 3, time: '13.00 - 14.00 น.', startTime: '13:00', endTime: '14:00', capacity: 4, enabled: true, note: 'ช่วงบ่าย มีเจ้าหน้าที่พาชม', remainingQueues: 4, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', startTime: '15:30', endTime: '16:30', capacity: 5, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกตลาดกลางคืน', remainingQueues: 5, isFull: false }
      ]
    },
    // 6 = วันเสาร์
    6: {
      dayOfWeek: 6,
      dayName: 'วันเสาร์',
      enabled: true,
      badge: 'แนะนำ',
      badgeType: 'badge-primary',
      description: 'เปิดเต็มวัน คนเดินหนาแน่น เหมาะดูทำเลและการค้าขายจริง',
      slots: [
        { id: 1, time: '09.30 - 10.30 น.', startTime: '09:30', endTime: '10:30', capacity: 3, enabled: true, note: 'ช่วงเช้า อากาศสบาย เหมาะดูโครงสร้าง', remainingQueues: 3, isFull: false },
        { id: 2, time: '11.00 - 12.00 น.', startTime: '11:00', endTime: '12:00', capacity: 5, enabled: true, note: 'ช่วงสาย บรรยากาศเริ่มคึกคัก', remainingQueues: 5, isFull: false },
        { id: 3, time: '13.00 - 14.00 น.', startTime: '13:00', endTime: '14:00', capacity: 2, enabled: true, note: 'ช่วงบ่าย มีเจ้าหน้าที่เทคนิคพาชม', remainingQueues: 2, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', startTime: '15:30', endTime: '16:30', capacity: 4, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกคนเดินจริง', remainingQueues: 4, isFull: false }
      ]
    }
  }
}

const sanitizeWeeklyMaster = (weekly: IWeeklyMasterMap): IWeeklyMasterMap => {
  Object.values(weekly || {}).forEach(day => {
    if (!day || !Array.isArray(day.slots)) return
    day.slots.forEach(slot => {
      const cap = Math.max(1, Number(slot.capacity) || 2)
      slot.capacity = cap
      if (slot.enabled !== false) {
        slot.enabled = true
        slot.isFull = false
        slot.remainingQueues = cap
        if (slot.note === 'มีผู้ลงทะเบียนเต็มโควตาแล้ว') {
          slot.note = 'ช่วงเช้า อากาศสบาย เหมาะดูโครงสร้าง'
        } else if (slot.note === 'รอบยอดนิยม (เต็มแล้ว)') {
          slot.note = 'ช่วงบ่าย มีเจ้าหน้าที่พาชม'
        }
      } else {
        slot.isFull = true
        slot.remainingQueues = 0
      }
    })
  })
  return weekly
}

export const doesBookingMatchSlotTime = (bookingSlotStr: string, slot: IVisitSlot): boolean => {
  if (!bookingSlotStr || !slot) return false
  const bRange = parseSlotTimeRange(bookingSlotStr)
  const sRange = parseSlotTimeRange(slot.time || `${slot.startTime || '09:00'} - ${slot.endTime || '10:00'}`)
  return bRange.startTime === sRange.startTime
}

// Generate future calendar days rolling dynamically
export const generateDayMetaList = (daysAhead: number = 14, startOffset: number = 1): DayMetaItem[] => {
  const list: DayMetaItem[] = []
  const now = new Date()

  for (let i = startOffset; i < startOffset + daysAhead; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const dayOfWeek = d.getDay()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const monthStr = `${thaiMonths[d.getMonth()]} ${String(year + 543).slice(-2)}`

    list.push({
      date: dateStr,
      dayOfWeek,
      dayName: `วัน${thaiDays[dayOfWeek]}`,
      dayNumber: d.getDate(),
      month: monthStr,
      monthShort: monthStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    })
  }

  return list
}

// Load Stored Weekly Master (ตารางหลักประจำสัปดาห์)
export const getStoredWeeklyMaster = (marketId: string): IWeeklyMasterMap => {
  if (typeof window === 'undefined') return createDefaultWeeklyMaster()
  try {
    const raw = localStorage.getItem(`visit-schedule-weekly:${marketId}`)
    if (!raw) return createDefaultWeeklyMaster()
    const parsed = JSON.parse(raw) as IWeeklyMasterMap
    return sanitizeWeeklyMaster(parsed)
  } catch {
    return createDefaultWeeklyMaster()
  }
}

// Save Stored Weekly Master (บันทึกตารางหลักประจำสัปดาห์)
export const saveStoredWeeklyMaster = (marketId: string, weekly: IWeeklyMasterMap): void => {
  if (typeof window === 'undefined') return
  try {
    const sanitized = sanitizeWeeklyMaster(weekly)
    localStorage.setItem(`visit-schedule-weekly:${marketId}`, JSON.stringify(sanitized))
    window.dispatchEvent(new CustomEvent('market-visit-schedule-updated', { detail: { marketId } }))
  } catch (e) {
    console.error('Failed to save weekly master visit schedule:', e)
  }
}

// Load Specific Date Overrides (วันหยุดพิเศษ หรือการปรับเฉพาะวัน)
export const getStoredDateOverrides = (marketId: string): IDateOverrideMap => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(`visit-schedule-overrides:${marketId}`)
    if (!raw) return {}
    return JSON.parse(raw) as IDateOverrideMap
  } catch {
    return {}
  }
}

// Save Specific Date Overrides
export const saveStoredDateOverrides = (marketId: string, overrides: IDateOverrideMap): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`visit-schedule-overrides:${marketId}`, JSON.stringify(overrides))
    window.dispatchEvent(new CustomEvent('market-visit-schedule-updated', { detail: { marketId } }))
  } catch (e) {
    console.error('Failed to save date overrides:', e)
  }
}

// Load Effective Schedule for a date horizon by projecting the Weekly Master onto future calendar dates
export const loadEffectiveMarketSchedule = (marketId: string, daysAhead: number = 14) => {
  const days = generateDayMetaList(daysAhead)
  const weeklyMaster = getStoredWeeklyMaster(marketId)
  const overrides = getStoredDateOverrides(marketId)

  const schedule: IMarketScheduleMap = {}

  days.forEach((day) => {
    const master = weeklyMaster[day.dayOfWeek] || {
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayName,
      enabled: false,
      badge: 'ปิดรับนัด',
      badgeType: 'badge-neutral',
      description: 'วันปิดปรับปรุงตลาด',
      slots: createDefaultSlotList().map(s => ({ ...s, enabled: false }))
    }

    // Clone slots from master
    const clonedSlots: IVisitSlot[] = JSON.parse(JSON.stringify(master.slots || []))

    let dayConfig: IVisitDayConfig = {
      enabled: master.enabled,
      badge: master.badge || '',
      badgeType: master.badgeType || 'badge-neutral',
      description: master.description || '',
      slots: clonedSlots
    }

    // Apply specific date override if exists
    if (overrides[day.date]) {
      const ov = overrides[day.date]
      dayConfig = {
        enabled: ov.enabled !== undefined ? ov.enabled : dayConfig.enabled,
        badge: ov.badge !== undefined ? ov.badge : dayConfig.badge,
        badgeType: ov.badgeType !== undefined ? ov.badgeType : dayConfig.badgeType,
        description: ov.description !== undefined ? ov.description : dayConfig.description,
        slots: ov.slots ? JSON.parse(JSON.stringify(ov.slots)) : dayConfig.slots
      }
    }

    schedule[day.date] = dayConfig
  })

  return { days, schedule, weeklyMaster, overrides }
}

// Generate ready-to-use Booking Dates for Step 2 (Relates 100% with active bookings & officer weekly master)
export const getBookingVisitDates = (
  marketId: string,
  daysAhead: number = 14,
  bookingsInput?: any[],
  marketName?: string,
  tenantMatcher?: (booking: any) => boolean
): AvailableDateSlot[] => {
  const { days, schedule } = loadEffectiveMarketSchedule(marketId, daysAhead)
  const bookingDates: AvailableDateSlot[] = []

  const sourceBookings = Array.isArray(bookingsInput) ? bookingsInput : cachedScheduleBookings
  const allActiveVisitBookings = sourceBookings.filter(b => isBookingOccupyingVisitSlot(b))
  const marketActiveBookings = allActiveVisitBookings.filter(
    b => doesBookingMatchMarket(b, marketId, marketName)
  )
  // Tenant-facing booking lists intentionally contain only that tenant's records.
  // When the API also supplies privacy-safe capacity records, use those records
  // exclusively for availability so an owner's appointment is never counted twice.
  const capacityBookings = marketActiveBookings.some(b => b.__visit_capacity_record)
    ? marketActiveBookings.filter(b => b.__visit_capacity_record)
    : marketActiveBookings

  days.forEach(day => {
    const dayConfig = schedule[day.date]
    if (!dayConfig) return

    const isEnabled = dayConfig.enabled
    const rawSlots = dayConfig.slots || []

    let dayTotalCapacity = 0
    let dayTotalBooked = 0
    let dayTotalRemaining = 0

    const mappedSlots: TimeSlotItem[] = rawSlots.map(s => {
      const isSlotActive = s.enabled !== false
      const cap = Math.max(1, Number(s.capacity) || 2)

      const matchingBookings = isSlotActive
        ? capacityBookings.filter(
            b =>
              normalizeVisitDateToIso(b.visit_date) === day.date &&
              doesBookingMatchSlotTime(String(b.visit_time_slot || b.visit_time || ''), s)
          )
        : []

      // 1 การจอง = 1 แผง = 1 คิวเวลา
      const bookedCount = matchingBookings.length
      const bookedStalls = Array.from(
        new Set(
          matchingBookings
            .flatMap(b => String(b.stall_number || b.stall_ident || '').split(','))
            .map(code => code.trim())
            .filter(Boolean)
        )
      )

      // Check if the current tenant already has an active appointment in this exact date & time slot (across any project/market)
      const tenantConflictBookings = (isSlotActive && tenantMatcher)
        ? allActiveVisitBookings.filter(
            b =>
              ['pending', 'pending_approval', 'approved'].includes(String(b.status || '').trim()) &&
              tenantMatcher(b) &&
              normalizeVisitDateToIso(b.visit_date) === day.date &&
              doesBookingMatchSlotTime(String(b.visit_time_slot || b.visit_time || ''), s)
          )
        : []
      const hasTenantConflict = tenantConflictBookings.length > 0
      const tenantConflictInfo: TenantSlotConflictInfo | null = hasTenantConflict
        ? {
            bookingNumber: String(tenantConflictBookings[0]?.booking_number || ''),
            marketName: String(tenantConflictBookings[0]?.market_name || marketName || ''),
            projectName: String(tenantConflictBookings[0]?.project_name || tenantConflictBookings[0]?.stall_zone_name || 'โครงการอื่น'),
            stallNumbers: Array.from(
              new Set(
                tenantConflictBookings
                  .flatMap(b => String(b.stall_number || b.stall_ident || '').split(','))
                  .map(c => c.trim())
                  .filter(Boolean)
              )
            )
          }
        : null

      const rem = isSlotActive ? Math.max(0, cap - bookedCount) : 0
      const full = !isSlotActive || rem <= 0

      if (isSlotActive && isEnabled) {
        dayTotalCapacity += cap
        dayTotalBooked += Math.min(cap, bookedCount)
        dayTotalRemaining += rem
      }

      let capText = ''
      let capClass = 'cap-high'

      if (!isSlotActive) {
        capText = 'งดให้บริการรอบนี้'
        capClass = 'cap-full'
      } else if (hasTenantConflict) {
        capText = 'คุณมีนัดหมายอื่นในเวลานี้แล้ว'
        capClass = 'cap-low'
      } else if (full) {
        capText = `เต็มแล้ว (${bookedCount}/${cap} คิว)`
        capClass = 'cap-full'
      } else if (bookedCount > 0) {
        capText = rem === 1
          ? `เหลือ 1 คิวสุดท้าย (จองแล้ว ${bookedCount}/${cap})`
          : `ว่าง ${rem} คิว (จองแล้ว ${bookedCount}/${cap})`
        capClass = rem === 1 ? 'cap-low' : (rem === 2 ? 'cap-med' : 'cap-high')
      } else if (rem === 1) {
        capText = 'เหลือ 1 คิวสุดท้าย'
        capClass = 'cap-low'
      } else if (rem === 2) {
        capText = 'เหลือ 2 คิว'
        capClass = 'cap-med'
      } else {
        capText = `ว่าง ${rem} คิว`
        capClass = 'cap-high'
      }

      let slotNote = s.note || ''
      if (slotNote === 'มีผู้ลงทะเบียนเต็มโควตาแล้ว' || slotNote === 'รอบยอดนิยม (เต็มแล้ว)') {
        slotNote = 'มีเจ้าหน้าที่พาชมพื้นที่'
      }

      if (!isSlotActive) {
        slotNote = s.note || 'งดให้บริการรอบเวลานี้'
      } else if (hasTenantConflict && tenantConflictInfo) {
        const stallListText = tenantConflictInfo.stallNumbers.length > 0
          ? `แผง ${tenantConflictInfo.stallNumbers.join(', ')}`
          : ''
        slotNote = `ชนกับนัดหมายของคุณที่ ${tenantConflictInfo.projectName} (${tenantConflictInfo.marketName}${stallListText ? ' • ' + stallListText : ''})`
      } else if (full) {
        slotNote = bookedStalls.length > 0
          ? `มีผู้จองเต็มโควตาแล้ว (${bookedCount} คิว • แผง ${bookedStalls.join(', ')})`
          : 'มีผู้ลงทะเบียนเต็มโควตาแล้ว'
      } else if (bookedStalls.length > 0) {
        slotNote = `จองแล้ว ${bookedCount} คิว (แผง ${bookedStalls.join(', ')}) • ${slotNote}`
      }

      return {
        time: s.time,
        capacityText: capText,
        capacityClass: capClass,
        note: slotNote,
        isFull: full,
        enabled: isSlotActive,
        capacity: cap,
        bookedCount,
        bookedStalls,
        remainingQueues: rem,
        hasTenantConflict,
        tenantConflictInfo
      }
    })

    const enabledSlots = mappedSlots.filter(s => s.enabled !== false)
    const activeAvailableSlots = enabledSlots.filter(s => !s.isFull)
    const isAllFull = isEnabled && activeAvailableSlots.length === 0 && enabledSlots.length > 0
    const isClosed = !isEnabled

    let slotsText = 'ปิดรับนัดหมาย'
    let statusClass = 'status-closed'

    if (isClosed) {
      slotsText = 'ปิดรับนัดหมาย'
      statusClass = 'status-closed'
    } else if (isAllFull) {
      slotsText = 'เต็มทุกรอบ'
      statusClass = 'status-limited'
    } else {
      const count = activeAvailableSlots.length
      const hasFullSlot = count < enabledSlots.length
      slotsText = (hasFullSlot || count <= 2) ? `เหลือ ${count} รอบ` : `ว่าง ${count} รอบ`
      statusClass = (hasFullSlot || count <= 2) ? 'status-limited' : 'status-open'
    }

    bookingDates.push({
      date: day.date,
      dayName: day.dayName,
      dayNum: String(day.dayNumber),
      monthShort: day.monthShort,
      badge: dayConfig.badge || (isClosed ? 'ปิดรับนัด' : ''),
      badgeType: dayConfig.badgeType || (isClosed ? 'badge-neutral' : 'badge-primary'),
      slotsText,
      statusClass,
      isPopular: day.dayOfWeek === 6 && isEnabled,
      description: dayConfig.description || '',
      isAllFull,
      isClosed,
      totalCapacity: dayTotalCapacity,
      totalBooked: dayTotalBooked,
      totalRemainingQueues: dayTotalRemaining,
      slots: mappedSlots
    })
  })

  return bookingDates
}
