const MARKET_OVERRIDES_KEY = 'emarket:market-overrides'

type MarketOverrideMap = Record<string, Record<string, any>>

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

  return { getMarketOverride, saveMarketOverride, applyMarketOverride }
}
