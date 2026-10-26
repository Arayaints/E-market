const MARKET_OVERRIDES_KEY = 'emarket:market-overrides'
const MARKET_EDIT_HISTORY_KEY = 'emarket:market-edit-history'
const HISTORY_LIMIT_PER_MARKET = 20

type MarketOverrideMap = Record<string, Record<string, any>>
export type MarketEditHistoryEntry = {
  id: string
  marketId: string
  changedAt: string
  changedFields: string[]
  actorName: string
  actorRole: string
}

export const useMarketOverrides = () => {
  const readAll = (): MarketOverrideMap => {
    if (!import.meta.client) return {}
    try {
      return JSON.parse(localStorage.getItem(MARKET_OVERRIDES_KEY) || '{}')
    } catch {
      return {}
    }
  }

  const getMarketOverride = (idOrSlug: string | number | null | undefined) => {
    if (idOrSlug === null || idOrSlug === undefined) return null
    return readAll()[String(idOrSlug)] || null
  }

  const saveMarketOverride = (market: Record<string, any>) => {
    if (!import.meta.client) return
    const records = readAll()
    const value = { ...market, updated_at: new Date().toISOString() }
    records[String(market.id)] = value
    if (market.slug) records[String(market.slug)] = value
    localStorage.setItem(MARKET_OVERRIDES_KEY, JSON.stringify(records))
  }

  const getMarketEditHistory = (idOrSlug: string | number | null | undefined): MarketEditHistoryEntry[] => {
    if (!import.meta.client || idOrSlug === null || idOrSlug === undefined) return []
    try {
      const records = JSON.parse(localStorage.getItem(MARKET_EDIT_HISTORY_KEY) || '{}')
      return Array.isArray(records[String(idOrSlug)]) ? records[String(idOrSlug)] : []
    } catch {
      return []
    }
  }

  const saveMarketEditHistory = (market: Record<string, any>, previous: Record<string, any>, actor?: { name?: string, role?: string }) => {
    if (!import.meta.client || !market.id) return
    const labels: Record<string, string> = {
      name: 'ชื่อตลาด', district: 'เขต', operating_hours: 'วันและเวลาเปิดทำการ', address: 'ที่อยู่',
      description: 'รายละเอียดตลาด', tags: 'จุดเด่นของตลาด', product_categories: 'หมวดสินค้าของตลาด', travel_options: 'การเดินทาง', lat: 'ละติจูด', lng: 'ลองจิจูด',
      starting_price_monthly: 'ค่าเช่าเริ่มต้น', max_price_monthly: 'ค่าเช่าสูงสุด', min_area_sqm: 'พื้นที่ต่ำสุด', max_area_sqm: 'พื้นที่สูงสุด',
      total_stalls: 'จำนวนแผงทั้งหมด', parking_spaces: 'จำนวนที่จอดรถ', image_url: 'รูปภาพตลาด', floorplan_image_url: 'รูปภาพแผนผัง', video_url: 'วิดีโอแนะนำตลาด'
    }
    const changedFields = Object.keys(labels).filter(key => JSON.stringify(previous[key] ?? null) !== JSON.stringify(market[key] ?? null)).map(key => labels[key])
    if (!changedFields.length) return
    let records: Record<string, MarketEditHistoryEntry[]> = {}
    try { records = JSON.parse(localStorage.getItem(MARKET_EDIT_HISTORY_KEY) || '{}') } catch { /* start fresh */ }
    const entry: MarketEditHistoryEntry = {
      id: `${market.id}-${Date.now()}`,
      marketId: String(market.id),
      changedAt: new Date().toISOString(),
      changedFields,
      actorName: actor?.name || 'ไม่ระบุผู้แก้ไข',
      actorRole: actor?.role || 'เจ้าหน้าที่'
    }
    const history = [entry, ...(records[String(market.id)] || [])].slice(0, HISTORY_LIMIT_PER_MARKET)
    records[String(market.id)] = history
    if (market.slug) records[String(market.slug)] = history
    localStorage.setItem(MARKET_EDIT_HISTORY_KEY, JSON.stringify(records))
  }

  const applyMarketOverride = (market: Record<string, any>) => {
    const saved = getMarketOverride(market.id) || getMarketOverride(market.slug)
    if (!saved) return market
    const {
      available_stalls: _avail,
      total_stalls: _total,
      reserved_stalls: _res,
      occupied_stalls: _occ,
      ...restSaved
    } = saved
    return { ...market, ...restSaved }
  }

  return { getMarketOverride, saveMarketOverride, applyMarketOverride, getMarketEditHistory, saveMarketEditHistory }
}
