// ============================================================================
// Market GIS Data Loader (แยก 1 ตลาด = 1 ไฟล์ JSON)
// ============================================================================
// Loads individual market GIS layout files on-demand from /data/markets/<slug>.json
// with instant caching and fallback to static registry.
// ============================================================================

import { getMarketGisConfig, type MarketGisConfig } from './markets_registry'

export const MARKET_SLUG_MAP: Record<string, string> = {
  '1': 'chatuchak',
  'chatuchak': 'chatuchak',
  '2': 'pracha-niwet-1',
  'pracha-niwet-1': 'pracha-niwet-1',
  '3': 'min-buri',
  'min-buri': 'min-buri',
  '4': 'singhanat',
  'singhanat': 'singhanat',
  '5': 'thewarat',
  'thewarat': 'thewarat',
  '6': 'rat-burana',
  'rat-burana': 'rat-burana',
  '7': 'bang-kapi',
  'bang-kapi': 'bang-kapi',
  '8': 'wongwian-lek',
  'wongwian-lek': 'wongwian-lek',
  '9': 'nong-chok',
  'nong-chok': 'nong-chok',
  '10': 'ratchadaphisek',
  'ratchadaphisek': 'ratchadaphisek',
  '11': 'thonburi-sanamluang-2',
  'thonburi-sanamluang-2': 'thonburi-sanamluang-2',
  '12': 'bang-khae-phirom',
  'bang-khae-phirom': 'bang-khae-phirom'
}

const marketCache = new Map<string, MarketGisConfig>()

/**
 * Resolve the slug filename for a market ID or slug
 */
export function getMarketSlug(marketIdOrSlug: string | number): string {
  const key = String(marketIdOrSlug).trim().toLowerCase()
  return MARKET_SLUG_MAP[key] || 'chatuchak'
}

/**
 * Fetch and load a single market GIS JSON file on-demand.
 * Loads from /data/markets/<slug>.json with immediate cache.
 */
export async function loadMarketGisJson(marketIdOrSlug?: string | number | null): Promise<MarketGisConfig> {
  const slug = getMarketSlug(marketIdOrSlug || '1')

  // ตลาดนัดจตุจักรใช้โมเดลเดิมและ Layout Engine ดั้งเดิม (ไม่โหลด JSON)
  if (slug === 'chatuchak') {
    return getMarketGisConfig('chatuchak')
  }

  if (marketCache.has(slug)) {
    return marketCache.get(slug)!
  }

  // If running in browser, fetch the dedicated JSON file
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const res = await fetch(`/data/markets/${slug}.json`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.projects && Array.isArray(data.projects)) {
          marketCache.set(slug, data)
          return data
        }
      }
    } catch (e) {
      console.warn(`[market_loader] Failed to fetch /data/markets/${slug}.json, using static fallback`, e)
    }
  }

  // Fallback to static registry
  const fallback = getMarketGisConfig(slug)
  marketCache.set(slug, fallback)
  return fallback
}
