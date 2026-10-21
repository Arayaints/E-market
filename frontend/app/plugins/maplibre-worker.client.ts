// MapLibre GL v6 สร้าง Web Worker จาก URL ที่อ้างอิงตำแหน่งไฟล์ของตัวเอง (import.meta.url)
// แต่เมื่อ Vite pre-bundle ไปไว้ใน .cache/vite/deps ไฟล์ worker จะหาไม่เจอ
// ("Worker failed to load") ทำให้ GeoJSON / Vector tiles (กรอบโครงการ, อาคาร 3D) ไม่ถูกวาดเลย
// จึงชี้ worker URL ไปที่ไฟล์จริงใน node_modules ผ่าน ?url ก่อนสร้างแผนที่ทุกตัว
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'

export default defineNuxtPlugin(async () => {
  const ml: any = await import('maplibre-gl')
  const lib = ml.setWorkerUrl ? ml : ml.default
  lib?.setWorkerUrl?.(maplibreWorkerUrl)
})
