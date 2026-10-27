// ============================================================================
// Market GIS Data Loader (แยก 1 ตลาด = 1 ไฟล์ JSON)
// ============================================================================
// Loads individual market GIS layout files on-demand from /data/markets/<slug>.json
// with instant caching and fallback to static registry.
// ============================================================================

import { getMarketGisConfig, type MarketGisConfig } from './markets_registry'
import type { ProjectZone } from './market_gis_types'

export function cloneProjects<T>(items: T): T {
  if (!items) return items
  return JSON.parse(JSON.stringify(items))
}

/**
 * Merges base market projects (from /data/markets/<slug>.json) with saved GIS projects from API.
 * Prevents custom-drawn zones (zone-*) from wiping out the original market projects when
 * the initial draft was created before base JSON projects were loaded.
 */
function normalizeProjectNames(list: ProjectZone[] = []): ProjectZone[] {
  return list.map(p => ({
    ...p,
    name: String(p.name || '').replace(/\s*\(โซนแผงค้าตลาดสิงหา\)/g, '').trim()
  }))
}

export function mergeMarketProjects(baseProjects: ProjectZone[] = [], savedProjects: ProjectZone[] = []): ProjectZone[] {
  if (!Array.isArray(savedProjects) || savedProjects.length === 0) {
    return normalizeProjectNames(cloneProjects(baseProjects))
  }
  if (!Array.isArray(baseProjects) || baseProjects.length === 0) {
    return normalizeProjectNames(cloneProjects(savedProjects))
  }

  const coreBaseProjects = baseProjects.filter(p => !String(p.id).startsWith('zone-'))
  const baseIds = new Set(coreBaseProjects.map(p => p.id))
  const savedHasAnyBaseProject = savedProjects.some(p => baseIds.has(p.id))

  // If savedProjects only contains newly drawn custom zones (none of the base projects),
  // combine all coreBaseProjects with the custom zones so original market zones never disappear.
  if (!savedHasAnyBaseProject && coreBaseProjects.length > 0) {
    return normalizeProjectNames([...cloneProjects(coreBaseProjects), ...cloneProjects(savedProjects)])
  }

  return normalizeProjectNames(cloneProjects(savedProjects))
}

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

export function clearMarketGisCache(marketIdOrSlug?: string | number | null): void {
  if (!marketIdOrSlug) {
    marketCache.clear()
    return
  }
  marketCache.delete(getMarketSlug(marketIdOrSlug))
}

/**
 * Resolve the slug filename for a market ID or slug
 */
export function getMarketSlug(marketIdOrSlug: string | number): string {
  const key = String(marketIdOrSlug).trim().toLowerCase()
  return MARKET_SLUG_MAP[key] || 'chatuchak'
}

function resolveBackendApiBase(): string {
  try {
    const config = useRuntimeConfig()
    const base = String(config?.public?.apiBase || config?.public?.apiUrl || '').trim()
    if (base) return base.replace(/\/+$/, '')
  } catch {}
  const envBase = String(
    (import.meta as any)?.env?.NUXT_PUBLIC_API_BASE ||
    (import.meta as any)?.env?.NUXT_PUBLIC_API_URL ||
    'http://localhost:8080/api/v1'
  ).trim()
  return envBase.replace(/\/+$/, '')
}

/**
 * Fetch and load a single market GIS layout on-demand from the Backend API
 * (`GET /api/v1/markets/<slug>/gis-config`) with immediate cache and fallback to static registry.
 */
export async function loadMarketGisJson(marketIdOrSlug?: string | number | null, forceReload = false): Promise<MarketGisConfig> {
  const slug = getMarketSlug(marketIdOrSlug || '1')

  if (!forceReload && marketCache.has(slug)) {
    return marketCache.get(slug)!
  }

  const baseConfig = getMarketGisConfig(slug)

  // Fetch authoritative GIS projects & facilities from Backend API
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const apiBase = resolveBackendApiBase()
      const res = await fetch(`${apiBase}/markets/${encodeURIComponent(slug)}/gis-config`, { cache: 'no-store' })
      if (res.ok) {
        const payload = await res.json()
        const gisData = payload?.data ?? payload
        const apiProjects = Array.isArray(gisData?.projects) ? gisData.projects : []
        if (apiProjects.length > 0) {
          const mergedConfig: MarketGisConfig = {
            ...baseConfig,
            projects: mergeMarketProjects(baseConfig.projects, apiProjects)
          }
          marketCache.set(slug, mergedConfig)
          return mergedConfig
        }
      }
    } catch (e) {
      console.warn(`[market_loader] Failed to fetch GIS config from backend for ${slug}, using static fallback`, e)
    }
  }

  // Fallback to static registry
  marketCache.set(slug, baseConfig)
  return baseConfig
}
