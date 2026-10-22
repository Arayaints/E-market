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

export interface TimeSlotItem {
  time: string
  capacityText: string
  capacityClass: string
  note: string
  isFull: boolean
  remainingQueues: number
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
  slots: TimeSlotItem[]
}

const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

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
        { id: 1, time: '09.30 - 10.30 น.', capacity: 3, enabled: true, note: 'มีผู้ลงทะเบียนเต็มโควตาแล้ว', remainingQueues: 0, isFull: true },
        { id: 2, time: '11.00 - 12.00 น.', capacity: 4, enabled: true, note: 'ช่วงสาย บรรยากาศเริ่มคึกคัก', remainingQueues: 3, isFull: false },
        { id: 3, time: '13.00 - 14.00 น.', capacity: 2, enabled: true, note: 'รอบยอดนิยม (เต็มแล้ว)', remainingQueues: 0, isFull: true },
        { id: 4, time: '15.30 - 16.30 น.', capacity: 3, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกคนเดินจริง', remainingQueues: 1, isFull: false }
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
        { id: 1, time: '09.30 - 10.30 น.', capacity: 2, enabled: true, note: 'ช่วงเช้า เจ้าหน้าที่ฝ่ายอาคารพาชม', remainingQueues: 2, isFull: false },
        { id: 2, time: '11.00 - 12.00 น.', capacity: 3, enabled: false, note: 'ติดตรวจพื้นที่ประจำสัปดาห์', remainingQueues: 0, isFull: true },
        { id: 3, time: '13.00 - 14.00 น.', capacity: 3, enabled: true, note: 'ช่วงบ่าย ตรวจระบบไฟฟ้า-ประปา', remainingQueues: 3, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', capacity: 2, enabled: false, note: 'ไม่มีรอบเจ้าหน้าที่ช่วงเย็น', remainingQueues: 0, isFull: true }
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
        { id: 1, time: '09.30 - 10.30 น.', capacity: 2, enabled: false, note: 'งดรอบเช้า เตรียมพื้นที่ตลาดกลางคืน', remainingQueues: 0, isFull: true },
        { id: 2, time: '11.00 - 12.00 น.', capacity: 3, enabled: true, note: 'ช่วงสาย เริ่มเตรียมพื้นที่', remainingQueues: 2, isFull: false },
        { id: 3, time: '13.00 - 14.00 น.', capacity: 4, enabled: true, note: 'ช่วงบ่าย มีเจ้าหน้าที่พาชม', remainingQueues: 4, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', capacity: 5, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกตลาดกลางคืน', remainingQueues: 5, isFull: false }
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
        { id: 1, time: '09.30 - 10.30 น.', capacity: 3, enabled: true, note: 'ช่วงเช้า อากาศสบาย เหมาะดูโครงสร้าง', remainingQueues: 3, isFull: false },
        { id: 2, time: '11.00 - 12.00 น.', capacity: 5, enabled: true, note: 'ช่วงสาย บรรยากาศเริ่มคึกคัก', remainingQueues: 5, isFull: false },
        { id: 3, time: '13.00 - 14.00 น.', capacity: 2, enabled: true, note: 'ช่วงบ่าย มีเจ้าหน้าที่เทคนิคพาชม', remainingQueues: 1, isFull: false },
        { id: 4, time: '15.30 - 16.30 น.', capacity: 4, enabled: true, note: 'ช่วงเย็น ชมทราฟฟิกคนเดินจริง', remainingQueues: 4, isFull: false }
      ]
    }
  }
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
    return JSON.parse(raw) as IWeeklyMasterMap
  } catch {
    return createDefaultWeeklyMaster()
  }
}

// Save Stored Weekly Master (บันทึกตารางหลักประจำสัปดาห์)
export const saveStoredWeeklyMaster = (marketId: string, weekly: IWeeklyMasterMap): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`visit-schedule-weekly:${marketId}`, JSON.stringify(weekly))
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

// Generate ready-to-use Booking Dates for Step 2
export const getBookingVisitDates = (marketId: string, daysAhead: number = 14): AvailableDateSlot[] => {
  const { days, schedule } = loadEffectiveMarketSchedule(marketId, daysAhead)
  const bookingDates: AvailableDateSlot[] = []

  days.forEach(day => {
    const dayConfig = schedule[day.date]
    if (!dayConfig) return

    const isEnabled = dayConfig.enabled
    const rawSlots = dayConfig.slots || []

    const mappedSlots: TimeSlotItem[] = rawSlots.map(s => {
      const isSlotActive = s.enabled !== false
      const cap = s.capacity || 2
      const rem = s.remainingQueues !== undefined ? s.remainingQueues : (isSlotActive ? cap : 0)
      const full = s.isFull || !isSlotActive || rem <= 0

      let capText = ''
      let capClass = 'cap-high'

      if (!isSlotActive) {
        capText = 'งดให้บริการรอบนี้'
        capClass = 'cap-full'
      } else if (full) {
        capText = 'เต็มแล้ว'
        capClass = 'cap-full'
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

      return {
        time: s.time,
        capacityText: capText,
        capacityClass: capClass,
        note: s.note || '',
        isFull: full,
        remainingQueues: rem
      }
    })

    const activeAvailableSlots = mappedSlots.filter(s => !s.isFull)
    const isAllFull = isEnabled && activeAvailableSlots.length === 0 && mappedSlots.length > 0
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
      slotsText = count <= 2 ? `เหลือ ${count} รอบ` : `ว่าง ${count} รอบ`
      statusClass = count <= 2 ? 'status-limited' : 'status-open'
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
      slots: mappedSlots
    })
  })

  return bookingDates
}
