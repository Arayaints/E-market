// ============================================================================
// BMA Markets GIS Registry & Real Footprint Definitions (12 ตลาด กทม.)
// ============================================================================
// Provides exact GPS geographic centers, camera settings, and localized
// architectural building/zone polygons for all 12 BMA markets across Bangkok.
// ============================================================================

import type { ProjectZone } from './market_gis_types'

export interface MarketGisConfig {
  id: number
  slug: string
  name: string
  district: string
  center: [number, number] // [lng, lat]
  overviewZoom: number
  bearing?: number
  pitch?: number
  description: string
  projects: ProjectZone[]
}

const M_PER_DEG_LAT = 110540

/**
 * Creates an authentic rectangular building polygon in real-world [lng, lat] degrees
 * from dimensions (meters) and local metric offset from the market's geographic center.
 */
export function createBuildingPolygon(
  centerLng: number,
  centerLat: number,
  centerOffsetMeters: [number, number],
  widthMeters: number,
  depthMeters: number,
  angleDeg: number = 0
): { coordinates: [number, number][]; centroid: [number, number]; realAreaSqm: number } {
  const mPerDegLng = 111320 * Math.cos((centerLat * Math.PI) / 180)
  const [offX, offY] = centerOffsetMeters
  const rad = (angleDeg * Math.PI) / 180
  const cosA = Math.cos(rad)
  const sinA = Math.sin(rad)

  const hw = widthMeters / 2
  const hd = depthMeters / 2

  // 4 corners relative to building center
  const cornersLocal: [number, number][] = [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd]
  ]

  // Rotate and translate to metric offset from market origin
  const cornersMeters = cornersLocal.map(([x, y]) => {
    const rx = x * cosA - y * sinA
    const ry = x * sinA + y * cosA
    return [offX + rx, offY + ry] as [number, number]
  })

  // Convert to GPS [lng, lat]
  const coordinates: [number, number][] = cornersMeters.map(([mx, my]) => [
    Number((centerLng + mx / mPerDegLng).toFixed(7)),
    Number((centerLat + my / M_PER_DEG_LAT).toFixed(7))
  ])
  // Close loop
  if (coordinates.length > 0 && coordinates[0]) {
    coordinates.push([coordinates[0][0], coordinates[0][1]])
  }

  const centroid: [number, number] = [
    Number((centerLng + offX / mPerDegLng).toFixed(7)),
    Number((centerLat + offY / M_PER_DEG_LAT).toFixed(7))
  ]

  const realAreaSqm = Math.round(widthMeters * depthMeters)

  return { coordinates, centroid, realAreaSqm }
}

// ----------------------------------------------------------------------------
// Market 2: ตลาดประชานิเวศน์ 1 (เขตจตุจักร)
// ----------------------------------------------------------------------------
const PN1_LNG = 100.5489
const PN1_LAT = 13.8441

const bPNA = createBuildingPolygon(PN1_LNG, PN1_LAT, [-26, 18], 44, 24)
const bPNB = createBuildingPolygon(PN1_LNG, PN1_LAT, [28, 18], 46, 26)
const bPNC = createBuildingPolygon(PN1_LNG, PN1_LAT, [-26, -18], 40, 22)
const bPND = createBuildingPolygon(PN1_LNG, PN1_LAT, [26, -18], 42, 22)

const PRACHA_NIWET_PROJECTS: ProjectZone[] = [
  {
    id: 'pn1-a',
    name: 'อาคาร A (ศูนย์อาหารปรุงสำเร็จและของฝาก)',
    sectionNumber: 'A',
    category: 'อาหารปรุงสำเร็จ สตรีทฟู้ด และของหวาน',
    color: '#e06456',
    stallsAvailable: 48,
    totalStalls: 48,
    realAreaSqm: bPNA.realAreaSqm,
    centroid: bPNA.centroid,
    coordinates: bPNA.coordinates,
    floors: [
      { id: '1', name: 'ชั้น 1 (สตรีทฟู้ดและอาหารปรุงสำเร็จ)', shortLabel: '1F', level: 1 },
      { id: '2', name: 'ชั้น 2 (โซนที่นั่งรับประทานอาหารและของหวาน)', shortLabel: '2F', level: 2 }
    ]
  },
  {
    id: 'pn1-b',
    name: 'อาคาร B (ตลาดสด ผักผลไม้ และเนื้อสัตว์)',
    sectionNumber: 'B',
    category: 'อาหารสด ผักผลไม้ และเนื้อสัตว์ปลอดสาร',
    color: '#4eb5b7',
    stallsAvailable: 56,
    totalStalls: 56,
    realAreaSqm: bPNB.realAreaSqm,
    centroid: bPNB.centroid,
    coordinates: bPNB.coordinates,
    floors: [
      { id: '1', name: 'ชั้น 1 (ตลาดสด ผักผลไม้สด)', shortLabel: '1F', level: 1 }
    ]
  },
  {
    id: 'pn1-c',
    name: 'อาคาร C (เสื้อผ้าแฟชั่นและของใช้ในบ้าน)',
    sectionNumber: 'C',
    category: 'เสื้อผ้าแฟชั่นและของใช้เบ็ดเตล็ดในบ้าน',
    color: '#7e8ee8',
    stallsAvailable: 40,
    totalStalls: 40,
    realAreaSqm: bPNC.realAreaSqm,
    centroid: bPNC.centroid,
    coordinates: bPNC.coordinates,
    floors: [
      { id: '1', name: 'ชั้น 1 (เสื้อผ้าและของใช้ทั่วไป)', shortLabel: '1F', level: 1 }
    ]
  },
  {
    id: 'pn1-d',
    name: 'โซน D (ลานนัดสินค้าเกษตรชุมชน)',
    sectionNumber: 'D',
    category: 'สินค้าเกษตรอินทรีย์และต้นไม้',
    color: '#10b981',
    stallsAvailable: 36,
    totalStalls: 36,
    realAreaSqm: bPND.realAreaSqm,
    centroid: bPND.centroid,
    coordinates: bPND.coordinates,
    floors: [
      { id: '1', name: 'ลานกลางแจ้ง (ลานนัดสินค้าชุมชน)', shortLabel: 'G', level: 1 }
    ]
  }
]

// ----------------------------------------------------------------------------
// Market 3: ตลาดมีนบุรี (เขตมีนบุรี)
// ----------------------------------------------------------------------------
const MB_LNG = 100.7188
const MB_LAT = 13.8139

const bMB1 = createBuildingPolygon(MB_LNG, MB_LAT, [-42, 32], 56, 28)
const bMB2 = createBuildingPolygon(MB_LNG, MB_LAT, [38, 32], 56, 28)
const bMB3 = createBuildingPolygon(MB_LNG, MB_LAT, [-42, -26], 50, 26)
const bMB4 = createBuildingPolygon(MB_LNG, MB_LAT, [38, -26], 50, 26)
const bMB5 = createBuildingPolygon(MB_LNG, MB_LAT, [0, -68], 60, 24)

const MIN_BURI_PROJECTS: ProjectZone[] = [
  {
    id: 'mb-01',
    name: 'อาคาร 1 (ศูนย์ค้าส่งผักผลไม้สดเกษตรกร)',
    sectionNumber: '01',
    category: 'ผักผลไม้สดค้าส่งและค้าปลีก',
    color: '#10b981',
    stallsAvailable: 80,
    totalStalls: 80,
    realAreaSqm: bMB1.realAreaSqm,
    centroid: bMB1.centroid,
    coordinates: bMB1.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ลานค้าส่งผักผลไม้)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'mb-02',
    name: 'อาคาร 2 (ตลาดสดเนื้อสัตว์และอาหารทะเล)',
    sectionNumber: '02',
    category: 'อาหารสด เนื้อสัตว์ อาหารทะเลสด',
    color: '#3b82f6',
    stallsAvailable: 80,
    totalStalls: 80,
    realAreaSqm: bMB2.realAreaSqm,
    centroid: bMB2.centroid,
    coordinates: bMB2.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (แผงขายอาหารสด)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'mb-03',
    name: 'อาคาร 3 (ศูนย์รวมแฟชั่นและเบ็ดเตล็ด)',
    sectionNumber: '03',
    category: 'เสื้อผ้า เครื่องหนัง เครื่องประดับแฟชั่น',
    color: '#ab77c8',
    stallsAvailable: 65,
    totalStalls: 65,
    realAreaSqm: bMB3.realAreaSqm,
    centroid: bMB3.centroid,
    coordinates: bMB3.coordinates,
    floors: [
      { id: '1', name: 'ชั้น 1 (แฟชั่นและเสื้อผ้าสำเร็จรูป)', shortLabel: '1F', level: 1 },
      { id: '2', name: 'ชั้น 2 (รองเท้า กระเป๋า และของตกแต่ง)', shortLabel: '2F', level: 2 }
    ]
  },
  {
    id: 'mb-04',
    name: 'อาคาร 4 (ศูนย์อาหารมีนบุรีบาร์ซาร์)',
    sectionNumber: '04',
    category: 'ศูนย์อาหาร เครื่องดื่ม และเบเกอรี่',
    color: '#e06456',
    stallsAvailable: 65,
    totalStalls: 65,
    realAreaSqm: bMB4.realAreaSqm,
    centroid: bMB4.centroid,
    coordinates: bMB4.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ฟู้ดคอร์ทและสตรีทฟู้ด)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'mb-05',
    name: 'โซน 5 (ลานนัดสินค้าชุมชนและเกษตร)',
    sectionNumber: '05',
    category: 'สินค้าโอทอปและต้นไม้ตกแต่ง',
    color: '#e87a4d',
    stallsAvailable: 50,
    totalStalls: 50,
    realAreaSqm: bMB5.realAreaSqm,
    centroid: bMB5.centroid,
    coordinates: bMB5.coordinates,
    floors: [{ id: '1', name: 'ลานกลางแจ้ง (สินค้าชุมชน)', shortLabel: 'G', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 4: ตลาดสิงหา (เขตคลองเตย)
// ----------------------------------------------------------------------------
const SN_LNG = 100.5642
const SN_LAT = 13.7285

const bSNA = createBuildingPolygon(SN_LNG, SN_LAT, [-20, 12], 38, 20)
const bSNB = createBuildingPolygon(SN_LNG, SN_LAT, [22, 12], 36, 18)
const bSNC = createBuildingPolygon(SN_LNG, SN_LAT, [0, -18], 42, 20)

const SINGHANAT_PROJECTS: ProjectZone[] = [
  {
    id: 'sn-a',
    name: 'โซน A (ศูนย์อาหารกลางวันพนักงานออฟฟิศ)',
    sectionNumber: 'A',
    category: 'อาหารตามสั่ง ก๋วยเตี๋ยว ข้าวแกง สตรีทฟู้ด',
    color: '#e06456',
    stallsAvailable: 36,
    totalStalls: 36,
    realAreaSqm: bSNA.realAreaSqm,
    centroid: bSNA.centroid,
    coordinates: bSNA.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (อาหารกลางวันออฟฟิศ)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'sn-b',
    name: 'โซน B (คาเฟ่ เบเกอรี่ และ Grab & Go)',
    sectionNumber: 'B',
    category: 'เครื่องดื่ม กาแฟสด เบเกอรี่ และขนมทานเล่น',
    color: '#f59e0b',
    stallsAvailable: 28,
    totalStalls: 28,
    realAreaSqm: bSNB.realAreaSqm,
    centroid: bSNB.centroid,
    coordinates: bSNB.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (คาเฟ่และเครื่องดื่ม)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'sn-c',
    name: 'โซน C (สินค้าแฟชั่น เสื้อผ้าทำงาน และเบ็ดเตล็ด)',
    sectionNumber: 'C',
    category: 'เสื้อผ้าแฟชั่นทำงานและของใช้ประจำวัน',
    color: '#4eb5b7',
    stallsAvailable: 34,
    totalStalls: 34,
    realAreaSqm: bSNC.realAreaSqm,
    centroid: bSNC.centroid,
    coordinates: bSNC.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (แฟชั่นและของใช้)', shortLabel: '1F', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 5: ตลาดเทวราช (เขตดุสิต)
// ----------------------------------------------------------------------------
// Real surveyed GIS polygons from BMA Cadastral Survey (4 zones, 475 genuine stalls)
const TWR_LNG = 100.50275
const TWR_LAT = 13.77128

const THEWARAT_PROJECTS: ProjectZone[] = [
  {
    "id": "twr-01",
    "name": "โซน 1 (อาคารตลาดสดด้านใน)",
    "sectionNumber": "01",
    "category": "เนื้อสัตว์ ผักสด อาหารทะเล และของสด",
    "color": "#0284c7",
    "stallsAvailable": 306,
    "totalStalls": 306,
    "realAreaSqm": 1213,
    "centroid": [
      100.5026509,
      13.7711788
    ],
    "coordinates": [
      [
        100.5022992,
        13.7712709
      ],
      [
        100.5023283,
        13.7712494
      ],
      [
        100.5028167,
        13.7708901
      ],
      [
        100.502846,
        13.7708686
      ],
      [
        100.5028571,
        13.770883
      ],
      [
        100.5030128,
        13.7710852
      ],
      [
        100.502998,
        13.7710961
      ],
      [
        100.5029836,
        13.7711067
      ],
      [
        100.5024804,
        13.771477
      ],
      [
        100.502466,
        13.7714875
      ],
      [
        100.5024549,
        13.7714731
      ],
      [
        100.5022992,
        13.7712709
      ]
    ],
    "floors": [
      {
        "id": "1",
        "name": "ชั้น 1",
        "shortLabel": "1F",
        "level": 1
      }
    ]
  },
  {
    "id": "twr-02",
    "name": "โซน 2 (อาคารตลาดสดรอบนอก)",
    "sectionNumber": "02",
    "category": "ของแห้ง วัตถุดิบ เครื่องเทศ และเบ็ดเตล็ด",
    "color": "#0d9488",
    "stallsAvailable": 92,
    "totalStalls": 92,
    "realAreaSqm": 333,
    "centroid": [
      100.5027045,
      13.7712466
    ],
    "coordinates": [
      [
        100.5022919,
        13.7713215
      ],
      [
        100.5023214,
        13.7712997
      ],
      [
        100.5028978,
        13.7708757
      ],
      [
        100.5030497,
        13.7710129
      ],
      [
        100.5030719,
        13.7710417
      ],
      [
        100.503083,
        13.7710562
      ],
      [
        100.5030683,
        13.7710671
      ],
      [
        100.5030092,
        13.7711106
      ],
      [
        100.5024772,
        13.771502
      ],
      [
        100.5024328,
        13.7715346
      ],
      [
        100.5024106,
        13.7715057
      ],
      [
        100.5022919,
        13.7713215
      ]
    ],
    "floors": [
      {
        "id": "1",
        "name": "ชั้น 1",
        "shortLabel": "1F",
        "level": 1
      }
    ]
  },
  {
    "id": "twr-03",
    "name": "โซน 3 (ศูนย์อาหารเทเวศร์)",
    "sectionNumber": "03",
    "category": "อาหารปรุงสำเร็จ ข้าวแกง เครื่องดื่ม ขนมไทย",
    "color": "#ea580c",
    "stallsAvailable": 44,
    "totalStalls": 44,
    "realAreaSqm": 248,
    "centroid": [
      100.502962,
      13.7716199
    ],
    "coordinates": [
      [
        100.5028519,
        13.771452
      ],
      [
        100.5028992,
        13.7714355
      ],
      [
        100.5029297,
        13.7714249
      ],
      [
        100.5030072,
        13.7716282
      ],
      [
        100.5030116,
        13.7716401
      ],
      [
        100.5030166,
        13.7716537
      ],
      [
        100.5030371,
        13.7717099
      ],
      [
        100.5030492,
        13.7717431
      ],
      [
        100.5030613,
        13.7717763
      ],
      [
        100.5030662,
        13.77179
      ],
      [
        100.5029855,
        13.7718181
      ],
      [
        100.5029808,
        13.7718053
      ],
      [
        100.502973,
        13.771784
      ],
      [
        100.5029435,
        13.7717032
      ],
      [
        100.5029109,
        13.7716138
      ],
      [
        100.5028519,
        13.771452
      ]
    ],
    "floors": [
      {
        "id": "1",
        "name": "ชั้น 1",
        "shortLabel": "1F",
        "level": 1
      }
    ]
  },
  {
    "id": "twr-04",
    "name": "โซน 4 (ลานต้นโพธิ์)",
    "sectionNumber": "04",
    "category": "ไม้ดอกไม้ประดับ แคคตัส กระถาง และสินค้าทั่วไป",
    "color": "#16a34a",
    "stallsAvailable": 33,
    "totalStalls": 33,
    "realAreaSqm": 131,
    "centroid": [
      100.5030219,
      13.7708711
    ],
    "coordinates": [
      [
        100.5029021,
        13.7707996
      ],
      [
        100.5029169,
        13.7707886
      ],
      [
        100.5029316,
        13.7707777
      ],
      [
        100.5029723,
        13.7707509
      ],
      [
        100.5029835,
        13.7707653
      ],
      [
        100.5030617,
        13.7708661
      ],
      [
        100.5032048,
        13.7710513
      ],
      [
        100.50319,
        13.7710622
      ],
      [
        100.5029804,
        13.7709004
      ],
      [
        100.5029692,
        13.770886
      ],
      [
        100.5029468,
        13.7708572
      ],
      [
        100.5029021,
        13.7707996
      ]
    ],
    "floors": [
      {
        "id": "1",
        "name": "ชั้น 1",
        "shortLabel": "1F",
        "level": 1
      }
    ]
  }
]

// ----------------------------------------------------------------------------
// Market 6: ตลาดราษฎร์บูรณะ (เขตราษฎร์บูรณะ)
// ----------------------------------------------------------------------------
const RB_LNG = 100.5034
const RB_LAT = 13.6823

const bRB1 = createBuildingPolygon(RB_LNG, RB_LAT, [-26, 20], 46, 24)
const bRB2 = createBuildingPolygon(RB_LNG, RB_LAT, [28, 20], 46, 24)
const bRB3 = createBuildingPolygon(RB_LNG, RB_LAT, [-26, -20], 40, 22)
const bRB4 = createBuildingPolygon(RB_LNG, RB_LAT, [28, -20], 40, 22)

const RAT_BURANA_PROJECTS: ProjectZone[] = [
  {
    id: 'rb-01',
    name: 'อาคาร 1 (ศูนย์รวมอาหารทะเลสดมหาชัย-แม่กลอง)',
    sectionNumber: '01',
    category: 'อาหารทะเลสด กุ้ง หอย ปู ปลา',
    color: '#0284c7',
    stallsAvailable: 48,
    totalStalls: 48,
    realAreaSqm: bRB1.realAreaSqm,
    centroid: bRB1.centroid,
    coordinates: bRB1.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (โซนอาหารทะเลสด)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'rb-02',
    name: 'อาคาร 2 (ตลาดสดเนื้อสัตว์และผักสดพื้นบ้าน)',
    sectionNumber: '02',
    category: 'เนื้อสัตว์ ผักสด และเครื่องปรุง',
    color: '#10b981',
    stallsAvailable: 48,
    totalStalls: 48,
    realAreaSqm: bRB2.realAreaSqm,
    centroid: bRB2.centroid,
    coordinates: bRB2.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ผักสดและเนื้อสัตว์)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'rb-03',
    name: 'โซน 3 (ศูนย์อาหารปรุงสุกและอาหารพื้นถิ่นฝั่งธน)',
    sectionNumber: '03',
    category: 'อาหารปรุงสุก ข้าวแกง อาหารตามสั่ง',
    color: '#e06456',
    stallsAvailable: 40,
    totalStalls: 40,
    realAreaSqm: bRB3.realAreaSqm,
    centroid: bRB3.centroid,
    coordinates: bRB3.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (อาหารปรุงสำเร็จ)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'rb-04',
    name: 'โซน 4 (ร้านค้าเสื้อผ้าและสินค้าอุปโภคบริโภค)',
    sectionNumber: '04',
    category: 'เสื้อผ้า เครื่องแต่งกาย และของใช้ในครัวเรือน',
    color: '#7e8ee8',
    stallsAvailable: 38,
    totalStalls: 38,
    realAreaSqm: bRB4.realAreaSqm,
    centroid: bRB4.centroid,
    coordinates: bRB4.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ของใช้และเสื้อผ้า)', shortLabel: '1F', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 7: ตลาดบางกะปิ (เขตบางกะปิ)
// ----------------------------------------------------------------------------
const BKP_LNG = 100.6444
const BKP_LAT = 13.7661

const bBKP1 = createBuildingPolygon(BKP_LNG, BKP_LAT, [-32, 24], 52, 26)
const bBKP2 = createBuildingPolygon(BKP_LNG, BKP_LAT, [35, 24], 52, 26)
const bBKP3 = createBuildingPolygon(BKP_LNG, BKP_LAT, [-32, -22], 46, 24)
const bBKP4 = createBuildingPolygon(BKP_LNG, BKP_LAT, [35, -22], 46, 24)

const BANG_KAPI_PROJECTS: ProjectZone[] = [
  {
    id: 'bkp-01',
    name: 'อาคาร 1 (แฟชั่นมอลล์ เสื้อผ้าและเครื่องประดับ)',
    sectionNumber: '01',
    category: 'เสื้อผ้าแฟชั่น เครื่องประดับ รองเท้า กระเป๋า',
    color: '#ab77c8',
    stallsAvailable: 72,
    totalStalls: 72,
    realAreaSqm: bBKP1.realAreaSqm,
    centroid: bBKP1.centroid,
    coordinates: bBKP1.coordinates,
    floors: [
      { id: '1', name: 'ชั้น 1 (แฟชั่นวัยรุ่นและสตรีทแวร์)', shortLabel: '1F', level: 1 },
      { id: '2', name: 'ชั้น 2 (รองเท้า กระเป๋า และกิฟต์ช็อป)', shortLabel: '2F', level: 2 }
    ]
  },
  {
    id: 'bkp-02',
    name: 'อาคาร 2 (ตลาดสดค้าส่ง-ปลีกอาหารสดและวัตถุดิบ)',
    sectionNumber: '02',
    category: 'อาหารสด ผักผลไม้ และเนื้อสัตว์ค้าส่ง',
    color: '#10b981',
    stallsAvailable: 72,
    totalStalls: 72,
    realAreaSqm: bBKP2.realAreaSqm,
    centroid: bBKP2.centroid,
    coordinates: bBKP2.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (อาหารสดค้าส่ง)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'bkp-03',
    name: 'อาคาร 3 (ศูนย์อาหารสตรีทฟู้ดบางกะปิและเครื่องดื่ม)',
    sectionNumber: '03',
    category: 'สตรีทฟู้ด ข้าวขาหมู ก๋วยเตี๋ยวเรือ และเครื่องดื่ม',
    color: '#e06456',
    stallsAvailable: 56,
    totalStalls: 56,
    realAreaSqm: bBKP3.realAreaSqm,
    centroid: bBKP3.centroid,
    coordinates: bBKP3.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ฟู้ดคอร์ทสตรีทฟู้ด)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'bkp-04',
    name: 'โซน 4 (ไนท์มาร์เก็ต สินค้าทั่วไปและของใช้ชุมชน)',
    sectionNumber: '04',
    category: 'ตลาดนัดยามเย็น สินค้าไอที และของใช้ชุมชน',
    color: '#e87a4d',
    stallsAvailable: 55,
    totalStalls: 55,
    realAreaSqm: bBKP4.realAreaSqm,
    centroid: bBKP4.centroid,
    coordinates: bBKP4.coordinates,
    floors: [{ id: '1', name: 'ลานกลางแจ้ง (ไนท์มาร์เก็ต)', shortLabel: 'G', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 8: ตลาดพระเครื่องวงเวียนเล็ก (เขตคลองสาน) - ศูนย์รวมพระเครื่อง
// ----------------------------------------------------------------------------
const WWL_LNG = 100.4965
const WWL_LAT = 13.7335

const bWWL1 = createBuildingPolygon(WWL_LNG, WWL_LAT, [-20, 16], 38, 18)
const bWWL2 = createBuildingPolygon(WWL_LNG, WWL_LAT, [22, 16], 38, 18)
const bWWL3 = createBuildingPolygon(WWL_LNG, WWL_LAT, [-20, -16], 34, 18)
const bWWL4 = createBuildingPolygon(WWL_LNG, WWL_LAT, [22, -16], 34, 18)

const WONGWIAN_LEK_PROJECTS: ProjectZone[] = [
  {
    id: 'wwl-01',
    name: 'หอพระ 1 (พระเครื่องยอดนิยม เบญจภาคี และเหรียญ)',
    sectionNumber: '01',
    category: 'พระเครื่องเบญจภาคี เหรียญเกจิคณาจารย์ยอดนิยม',
    color: '#d97706',
    stallsAvailable: 36,
    totalStalls: 36,
    realAreaSqm: bWWL1.realAreaSqm,
    centroid: bWWL1.centroid,
    coordinates: bWWL1.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (พระเครื่องเบญจภาคี)', shortLabel: '1F', level: 1, isFull: false }]
  },
  {
    id: 'wwl-02',
    name: 'หอพระ 2 (เครื่องรางของขลัง พระบูชาโบราณ)',
    sectionNumber: '02',
    category: 'เครื่องรางของขลัง ตะกรุด มีดหมอ และพระบูชา',
    color: '#b45309',
    stallsAvailable: 36,
    totalStalls: 36,
    realAreaSqm: bWWL2.realAreaSqm,
    centroid: bWWL2.centroid,
    coordinates: bWWL2.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (เครื่องรางและพระบูชา)', shortLabel: '1F', level: 1, isFull: false }]
  },
  {
    id: 'wwl-03',
    name: 'อาคาร 3 (แกลเลอรีของสะสมโบราณ และกล้องส่องพระ)',
    sectionNumber: '03',
    category: 'งานศิลปะโบราณ พระพุทธรูป กล้องส่องพระ และตลับพระ',
    color: '#78350f',
    stallsAvailable: 30,
    totalStalls: 30,
    realAreaSqm: bWWL3.realAreaSqm,
    centroid: bWWL3.centroid,
    coordinates: bWWL3.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (อุปกรณ์และของสะสม)', shortLabel: '1F', level: 1, isFull: false }]
  },
  {
    id: 'wwl-04',
    name: 'โซน 4 (บริการเลี่ยมพระ กรอบทองไมครอน และเช็คแท้)',
    sectionNumber: '04',
    category: 'เลี่ยมกรอบพระกันน้ำ ชุบทองไมครอน ตรวจสอบพระแท้',
    color: '#e87a4d',
    stallsAvailable: 30,
    totalStalls: 30,
    realAreaSqm: bWWL4.realAreaSqm,
    centroid: bWWL4.centroid,
    coordinates: bWWL4.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (บริการเลี่ยมและตรวจสอบ)', shortLabel: '1F', level: 1, isFull: false }]
  }
]

// ----------------------------------------------------------------------------
// Market 9: ตลาดหนองจอก (เขตหนองจอก)
// ----------------------------------------------------------------------------
const NJ_LNG = 100.8641
const NJ_LAT = 13.8564

const bNJ1 = createBuildingPolygon(NJ_LNG, NJ_LAT, [-28, 20], 48, 24)
const bNJ2 = createBuildingPolygon(NJ_LNG, NJ_LAT, [30, 20], 48, 24)
const bNJ3 = createBuildingPolygon(NJ_LNG, NJ_LAT, [-28, -20], 42, 22)
const bNJ4 = createBuildingPolygon(NJ_LNG, NJ_LAT, [30, -20], 42, 22)

const NONG_CHOK_PROJECTS: ProjectZone[] = [
  {
    id: 'nj-01',
    name: 'อาคาร 1 (ศูนย์อาหารฮาลาลต้นตำรับ ข้าวหมก โรตีชาชัก)',
    sectionNumber: '01',
    category: 'อาหารฮาลาล ข้าวหมกไก่ ซุปหางวัว โรตี มะตะบะ',
    color: '#10b981',
    stallsAvailable: 58,
    totalStalls: 58,
    realAreaSqm: bNJ1.realAreaSqm,
    centroid: bNJ1.centroid,
    coordinates: bNJ1.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ศูนย์อาหารฮาลาล)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'nj-02',
    name: 'อาคาร 2 (ตลาดสดเนื้อวัวพรีเมียม สัตว์ปีก และปลาสด)',
    sectionNumber: '02',
    category: 'เนื้อวัวฮาลาล เนื้อไก่สด และปลาแม่น้ำสด',
    color: '#059669',
    stallsAvailable: 58,
    totalStalls: 58,
    realAreaSqm: bNJ2.realAreaSqm,
    centroid: bNJ2.centroid,
    coordinates: bNJ2.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (เนื้อสัตว์ฮาลาลและปลาสด)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'nj-03',
    name: 'โซน 3 (ผลผลิตเกษตรอินทรีย์ ผักสดหนองจอก และผลไม้สวน)',
    sectionNumber: '03',
    category: 'ผักปลอดสารพิษ ผลไม้สดจากสวนชุมชนหนองจอก',
    color: '#84cc16',
    stallsAvailable: 45,
    totalStalls: 45,
    realAreaSqm: bNJ3.realAreaSqm,
    centroid: bNJ3.centroid,
    coordinates: bNJ3.coordinates,
    floors: [{ id: '1', name: 'ลานผักเกษตรอินทรีย์', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'nj-04',
    name: 'โซน 4 (เสื้อผ้าเครื่องแต่งกายมุสลิมและสินค้าชุมชน)',
    sectionNumber: '04',
    category: 'ฮิญาบ เสื้อผ้ามุสลิม เครื่องหอม และของใช้ในบ้าน',
    color: '#0284c7',
    stallsAvailable: 44,
    totalStalls: 44,
    realAreaSqm: bNJ4.realAreaSqm,
    centroid: bNJ4.centroid,
    coordinates: bNJ4.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (เสื้อผ้ามุสลิมและสินค้าชุมชน)', shortLabel: '1F', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 10: ตลาดรัชดาภิเษก (เขตธนบุรี)
// ----------------------------------------------------------------------------
const RCD_LNG = 100.4823
const RCD_LAT = 13.7088

const bRCD1 = createBuildingPolygon(RCD_LNG, RCD_LAT, [-26, 18], 44, 22)
const bRCD2 = createBuildingPolygon(RCD_LNG, RCD_LAT, [28, 18], 44, 22)
const bRCD3 = createBuildingPolygon(RCD_LNG, RCD_LAT, [-26, -20], 40, 22)
const bRCD4 = createBuildingPolygon(RCD_LNG, RCD_LAT, [28, -20], 40, 22)

const RATCHADA_PROJECTS: ProjectZone[] = [
  {
    id: 'rcd-01',
    name: 'โซน 1 (สตรีทฟู้ดในตำนานตลาดพลู กุยช่าย บะหมี่เกี๊ยว)',
    sectionNumber: '01',
    category: 'สตรีทฟู้ดตลาดพลู กุยช่ายโบราณ บะหมี่เกี๊ยว',
    color: '#e06456',
    stallsAvailable: 45,
    totalStalls: 45,
    realAreaSqm: bRCD1.realAreaSqm,
    centroid: bRCD1.centroid,
    coordinates: bRCD1.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (สตรีทฟู้ดตลาดพลู)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'rcd-02',
    name: 'โซน 2 (ขนมไทยโบราณ หม้อแกง ขนมเบื้อง และของหวาน)',
    sectionNumber: '02',
    category: 'ขนมไทยโบราณ ทองหยิบ ฝอยทอง หม้อแกง ขนมเบื้อง',
    color: '#f59e0b',
    stallsAvailable: 45,
    totalStalls: 45,
    realAreaSqm: bRCD2.realAreaSqm,
    centroid: bRCD2.centroid,
    coordinates: bRCD2.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ขนมไทยโบราณ)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'rcd-03',
    name: 'อาคาร 3 (ตลาดสดเช้า-เย็น ผักผลไม้ และเนื้อสัตว์)',
    sectionNumber: '03',
    category: 'ผักผลไม้สด ดอกไม้ไหว้พระ และของแห้ง',
    color: '#10b981',
    stallsAvailable: 40,
    totalStalls: 40,
    realAreaSqm: bRCD3.realAreaSqm,
    centroid: bRCD3.centroid,
    coordinates: bRCD3.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (ตลาดสด)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'rcd-04',
    name: 'โซน 4 (เสื้อผ้าแฟชั่นและของใช้ชุมชนดาวคะนอง)',
    sectionNumber: '04',
    category: 'เสื้อผ้าสำเร็จรูป รองเท้า และของใช้ชุมชน',
    color: '#7e8ee8',
    stallsAvailable: 38,
    totalStalls: 38,
    realAreaSqm: bRCD4.realAreaSqm,
    centroid: bRCD4.centroid,
    coordinates: bRCD4.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (เสื้อผ้าและของใช้)', shortLabel: '1F', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 11: ตลาดธนบุรี - สนามหลวง 2 (เขตทวีวัฒนา) - ขนาดใหญ่ 800 แผง
// ----------------------------------------------------------------------------
const TB_LNG = 100.3542
const TB_LAT = 13.7479

const bTB1 = createBuildingPolygon(TB_LNG, TB_LAT, [-55, 42], 64, 32)
const bTB2 = createBuildingPolygon(TB_LNG, TB_LAT, [55, 42], 64, 32)
const bTB3 = createBuildingPolygon(TB_LNG, TB_LAT, [-55, -24], 58, 30)
const bTB4 = createBuildingPolygon(TB_LNG, TB_LAT, [55, -24], 58, 30)
const bTB5 = createBuildingPolygon(TB_LNG, TB_LAT, [-55, -85], 54, 28)
const bTB6 = createBuildingPolygon(TB_LNG, TB_LAT, [55, -85], 54, 28)

const THONBURI_PROJECTS: ProjectZone[] = [
  {
    id: 'tb-01',
    name: 'โซน 1 (ตลาดต้นไม้ ไม้ดอก ไม้ประดับ ไม้ดัด และกระถาง)',
    sectionNumber: '01',
    category: 'ไม้ดอก ไม้ประดับ ไม้ผล ไม้ดัด และอุปกรณ์จัดสวน',
    color: '#10b981',
    stallsAvailable: 140,
    totalStalls: 140,
    realAreaSqm: bTB1.realAreaSqm,
    centroid: bTB1.centroid,
    coordinates: bTB1.coordinates,
    floors: [{ id: '1', name: 'ลานสวนและไม้ประดับ', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'tb-02',
    name: 'โซน 2 (ศูนย์รวมสัตว์เลี้ยง ปลาสวยงาม นก และอุปกรณ์)',
    sectionNumber: '02',
    category: 'สัตว์เลี้ยง ปลาสวยงาม นก สุนัข แมว และตู้ปลา',
    color: '#3b82f6',
    stallsAvailable: 140,
    totalStalls: 140,
    realAreaSqm: bTB2.realAreaSqm,
    centroid: bTB2.centroid,
    coordinates: bTB2.coordinates,
    floors: [{ id: '1', name: 'ศูนย์สัตว์เลี้ยงและปลาสวยงาม', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'tb-03',
    name: 'โซน 3 (พระเครื่อง วัตถุโบราณ งานไม้สัก และของสะสม)',
    sectionNumber: '03',
    category: 'พระเครื่อง วัตถุโบราณ งานไม้สัก เฟอร์นิเจอร์วินเทจ',
    color: '#d97706',
    stallsAvailable: 125,
    totalStalls: 125,
    realAreaSqm: bTB3.realAreaSqm,
    centroid: bTB3.centroid,
    coordinates: bTB3.coordinates,
    floors: [{ id: '1', name: 'อาคารพระเครื่องและของสะสม', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'tb-04',
    name: 'โซน 4 (ตลาดอาหารพื้นบ้าน ขนมไทย สตรีทฟู้ดริมน้ำ)',
    sectionNumber: '04',
    category: 'อาหารพื้นบ้าน สตรีทฟู้ด ขนมไทย อาหารตามสั่งริมน้ำ',
    color: '#e06456',
    stallsAvailable: 125,
    totalStalls: 125,
    realAreaSqm: bTB4.realAreaSqm,
    centroid: bTB4.centroid,
    coordinates: bTB4.coordinates,
    floors: [{ id: '1', name: 'ศูนย์อาหารสตรีทฟู้ดริมน้ำ', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'tb-05',
    name: 'โซน 5 (เสื้อผ้าแฟชั่น สินค้า OTOP และหัตถกรรมพื้นบ้าน)',
    sectionNumber: '05',
    category: 'เสื้อผ้าแฟชั่น ผ้าทอมือ สินค้าหัตถกรรม OTOP',
    color: '#ab77c8',
    stallsAvailable: 110,
    totalStalls: 110,
    realAreaSqm: bTB5.realAreaSqm,
    centroid: bTB5.centroid,
    coordinates: bTB5.coordinates,
    floors: [{ id: '1', name: 'อาคารแฟชั่นและสินค้า OTOP', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'tb-06',
    name: 'โซน 6 (อุปกรณ์ตกแต่งบ้าน เซรามิก ดินเผา และเครื่องใช้)',
    sectionNumber: '06',
    category: 'เซรามิก เครื่องปั้นดินเผา และของแต่งบ้านวินเทจ',
    color: '#6366f1',
    stallsAvailable: 110,
    totalStalls: 110,
    realAreaSqm: bTB6.realAreaSqm,
    centroid: bTB6.centroid,
    coordinates: bTB6.coordinates,
    floors: [{ id: '1', name: 'อาคารเซรามิกและของแต่งบ้าน', shortLabel: '1F', level: 1 }]
  }
]

// ----------------------------------------------------------------------------
// Market 12: ตลาดบางแคภิรมย์ (เขตบางแค)
// ----------------------------------------------------------------------------
const BKP69_LNG = 100.3807
const BKP69_LAT = 13.6896

const bBKPA = createBuildingPolygon(BKP69_LNG, BKP69_LAT, [-26, 18], 44, 22)
const bBKPB = createBuildingPolygon(BKP69_LNG, BKP69_LAT, [28, 18], 44, 22)
const bBKPC = createBuildingPolygon(BKP69_LNG, BKP69_LAT, [-26, -18], 40, 20)
const bBKPD = createBuildingPolygon(BKP69_LNG, BKP69_LAT, [28, -18], 40, 20)

const BANG_KHAE_PROJECTS: ProjectZone[] = [
  {
    id: 'bkp-a',
    name: 'โซน A (กรีนมาร์เก็ต สินค้าออร์แกนิกและผักสลัด)',
    sectionNumber: 'A',
    category: 'สินค้าออร์แกนิก ผักสลัดไฮโดรโปนิกส์ ผลไม้ปลอดสาร',
    color: '#10b981',
    stallsAvailable: 45,
    totalStalls: 45,
    realAreaSqm: bBKPA.realAreaSqm,
    centroid: bBKPA.centroid,
    coordinates: bBKPA.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (กรีนมาร์เก็ตออร์แกนิก)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'bkp-b',
    name: 'โซน B (สลัดบาร์ น้ำผักผลไม้สกัดเย็น และอาหารคลีน)',
    sectionNumber: 'B',
    category: 'อาหารเพื่อสุขภาพ สลัดบาร์ น้ำผลไม้สกัดเย็น อาหารคลีน',
    color: '#84cc16',
    stallsAvailable: 45,
    totalStalls: 45,
    realAreaSqm: bBKPB.realAreaSqm,
    centroid: bBKPB.centroid,
    coordinates: bBKPB.coordinates,
    floors: [{ id: '1', name: 'ชั้น 1 (อาหารสุขภาพและเครื่องดื่ม)', shortLabel: '1F', level: 1 }]
  },
  {
    id: 'bkp-c',
    name: 'โซน C (ลานกิจกรรมริมสวน งานคราฟต์ และสินค้า DIY)',
    sectionNumber: 'C',
    category: 'งานฝีมือ สินค้าแฮนด์เมด DIY สินค้าชุมชน',
    color: '#f59e0b',
    stallsAvailable: 40,
    totalStalls: 40,
    realAreaSqm: bBKPC.realAreaSqm,
    centroid: bBKPC.centroid,
    coordinates: bBKPC.coordinates,
    floors: [{ id: '1', name: 'ลานกลางแจ้งริมสวน', shortLabel: 'G', level: 1 }]
  },
  {
    id: 'bkp-d',
    name: 'โซน D (ต้นไม้ฟอกอากาศ แคคตัส และของแต่งสวน)',
    sectionNumber: 'D',
    category: 'ต้นไม้ฟอกอากาศ ไม้มงคล แคคตัส และกระถางเซรามิก',
    color: '#059669',
    stallsAvailable: 40,
    totalStalls: 40,
    realAreaSqm: bBKPD.realAreaSqm,
    centroid: bBKPD.centroid,
    coordinates: bBKPD.coordinates,
    floors: [{ id: '1', name: 'ลานต้นไม้ฟอกอากาศ', shortLabel: 'G', level: 1 }]
  }
]

// ============================================================================
// ALL 12 BMA MARKETS MASTER REGISTRY
// ============================================================================
export const BMA_MARKETS_MASTER: Record<string, MarketGisConfig> = {
  '1': {
    id: 1,
    slug: 'chatuchak',
    name: 'ตลาดนัดจตุจักร',
    district: 'เขตจตุจักร',
    center: [100.55048, 13.7998023],
    overviewZoom: 16.6,
    bearing: 22,
    pitch: 35,
    description: 'ตลาดนัดระดับโลก แหล่งรวมสินค้าหัตถกรรม แฟชั่น ของแต่งบ้าน และต้นไม้ มี 30 โครงการ',
    // Loaded on demand from /data/markets/chatuchak.json.
    projects: []
  },
  '2': {
    id: 2,
    slug: 'pracha-niwet-1',
    name: 'ตลาดประชานิเวศน์ 1',
    district: 'เขตจตุจักร',
    center: [100.5454943, 13.8409024],
    overviewZoom: 18.2,
    bearing: 0,
    pitch: 35,
    description: 'ตลาดชุมชนคุณภาพ ศูนย์อาหารปรุงสำเร็จและของฝากเลื่องชื่อย่านประชาชื่น',
    projects: [
      {
            "id": "pra-01",
            "name": "โครงการ 01 (D)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 134,
            "totalStalls": 134,
            "realAreaSqm": 549,
            "centroid": [
                  100.5450735,
                  13.8405399
            ],
            "coordinates": [
                  [
                        100.5448662,
                        13.8406387
                  ],
                  [
                        100.5449755,
                        13.8403849
                  ],
                  [
                        100.5450865,
                        13.8403842
                  ],
                  [
                        100.545105,
                        13.8403841
                  ],
                  [
                        100.5451605,
                        13.8403838
                  ],
                  [
                        100.545179,
                        13.8403837
                  ],
                  [
                        100.5451792,
                        13.8404017
                  ],
                  [
                        100.5451804,
                        13.8405825
                  ],
                  [
                        100.545181,
                        13.8406729
                  ],
                  [
                        100.5451811,
                        13.840691
                  ],
                  [
                        100.5448993,
                        13.840747
                  ],
                  [
                        100.5448716,
                        13.8407472
                  ],
                  [
                        100.5448666,
                        13.840693
                  ],
                  [
                        100.5448664,
                        13.8406749
                  ],
                  [
                        100.5448663,
                        13.8406568
                  ],
                  [
                        100.5448662,
                        13.8406387
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-02",
            "name": "โครงการ 02 (F)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 70,
            "totalStalls": 70,
            "realAreaSqm": 280,
            "centroid": [
                  100.545129,
                  13.8405125
            ],
            "coordinates": [
                  [
                        100.5448457,
                        13.8403315
                  ],
                  [
                        100.5448827,
                        13.8403313
                  ],
                  [
                        100.5453101,
                        13.8403304
                  ],
                  [
                        100.5453119,
                        13.8406378
                  ],
                  [
                        100.5453121,
                        13.8406739
                  ],
                  [
                        100.5453122,
                        13.840692
                  ],
                  [
                        100.5453109,
                        13.8407444
                  ],
                  [
                        100.5452739,
                        13.8407446
                  ],
                  [
                        100.5448615,
                        13.8406207
                  ],
                  [
                        100.5448516,
                        13.8405304
                  ],
                  [
                        100.5448459,
                        13.8403677
                  ],
                  [
                        100.5448457,
                        13.8403315
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-03",
            "name": "โครงการ 03 (C)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 60,
            "totalStalls": 60,
            "realAreaSqm": 240,
            "centroid": [
                  100.5450879,
                  13.8405379
            ],
            "coordinates": [
                  [
                        100.5448827,
                        13.8403313
                  ],
                  [
                        100.5449382,
                        13.8403309
                  ],
                  [
                        100.5451139,
                        13.8403298
                  ],
                  [
                        100.5451972,
                        13.8403293
                  ],
                  [
                        100.5452157,
                        13.8403292
                  ],
                  [
                        100.5452342,
                        13.8403291
                  ],
                  [
                        100.5452737,
                        13.8407085
                  ],
                  [
                        100.5452739,
                        13.8407446
                  ],
                  [
                        100.5452184,
                        13.840745
                  ],
                  [
                        100.5450982,
                        13.8407458
                  ],
                  [
                        100.5449598,
                        13.8407466
                  ],
                  [
                        100.5449413,
                        13.8407467
                  ],
                  [
                        100.5449228,
                        13.8407468
                  ],
                  [
                        100.5448829,
                        13.8403675
                  ],
                  [
                        100.5448828,
                        13.8403494
                  ],
                  [
                        100.5448827,
                        13.8403313
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-04",
            "name": "โครงการ 04 (A)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 52,
            "totalStalls": 52,
            "realAreaSqm": 208,
            "centroid": [
                  100.5450749,
                  13.8405379
            ],
            "coordinates": [
                  [
                        100.5449383,
                        13.840349
                  ],
                  [
                        100.5449846,
                        13.8403487
                  ],
                  [
                        100.5450475,
                        13.8403483
                  ],
                  [
                        100.5451585,
                        13.8403476
                  ],
                  [
                        100.5452158,
                        13.8403473
                  ],
                  [
                        100.5452161,
                        13.8403834
                  ],
                  [
                        100.5452162,
                        13.8403985
                  ],
                  [
                        100.5452182,
                        13.8407089
                  ],
                  [
                        100.5452183,
                        13.8407269
                  ],
                  [
                        100.545161,
                        13.8407273
                  ],
                  [
                        100.5450981,
                        13.8407277
                  ],
                  [
                        100.5449871,
                        13.8407284
                  ],
                  [
                        100.5449412,
                        13.8407286
                  ],
                  [
                        100.5449406,
                        13.8406925
                  ],
                  [
                        100.5449404,
                        13.8406726
                  ],
                  [
                        100.5449397,
                        13.8405678
                  ],
                  [
                        100.5449386,
                        13.8404015
                  ],
                  [
                        100.5449385,
                        13.8403852
                  ],
                  [
                        100.5449383,
                        13.8403508
                  ],
                  [
                        100.5449383,
                        13.840349
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-05",
            "name": "โครงการ 05 (8)",
            "sectionNumber": "05",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#8b5cf6",
            "stallsAvailable": 22,
            "totalStalls": 22,
            "realAreaSqm": 91,
            "centroid": [
                  100.5454966,
                  13.8409443
            ],
            "coordinates": [
                  [
                        100.5453772,
                        13.8409407
                  ],
                  [
                        100.5453892,
                        13.840926
                  ],
                  [
                        100.5454275,
                        13.8409257
                  ],
                  [
                        100.5456039,
                        13.8409247
                  ],
                  [
                        100.5456175,
                        13.8409264
                  ],
                  [
                        100.5456175,
                        13.840935
                  ],
                  [
                        100.5456042,
                        13.8409636
                  ],
                  [
                        100.545547,
                        13.840964
                  ],
                  [
                        100.5455285,
                        13.8409641
                  ],
                  [
                        100.5455087,
                        13.8409642
                  ],
                  [
                        100.5454093,
                        13.8409647
                  ],
                  [
                        100.5453894,
                        13.8409648
                  ],
                  [
                        100.5453772,
                        13.8409493
                  ],
                  [
                        100.5453772,
                        13.8409407
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-06",
            "name": "โครงการ 06 (6)",
            "sectionNumber": "06",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#06b6d4",
            "stallsAvailable": 22,
            "totalStalls": 22,
            "realAreaSqm": 91,
            "centroid": [
                  100.5454984,
                  13.8410622
            ],
            "coordinates": [
                  [
                        100.5453782,
                        13.8410585
                  ],
                  [
                        100.5453902,
                        13.8410439
                  ],
                  [
                        100.545531,
                        13.841043
                  ],
                  [
                        100.5455495,
                        13.8410429
                  ],
                  [
                        100.5455865,
                        13.8410427
                  ],
                  [
                        100.5456067,
                        13.8410426
                  ],
                  [
                        100.5456193,
                        13.8410446
                  ],
                  [
                        100.5456193,
                        13.8410532
                  ],
                  [
                        100.5456069,
                        13.8410814
                  ],
                  [
                        100.5455683,
                        13.8410817
                  ],
                  [
                        100.5454103,
                        13.8410827
                  ],
                  [
                        100.5453904,
                        13.8410828
                  ],
                  [
                        100.5453783,
                        13.8410671
                  ],
                  [
                        100.5453782,
                        13.8410593
                  ],
                  [
                        100.5453782,
                        13.8410585
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-07",
            "name": "โครงการ 07 (4)",
            "sectionNumber": "07",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#e11d48",
            "stallsAvailable": 22,
            "totalStalls": 22,
            "realAreaSqm": 91,
            "centroid": [
                  100.5454986,
                  13.8411876
            ],
            "coordinates": [
                  [
                        100.5453788,
                        13.8411846
                  ],
                  [
                        100.5453905,
                        13.8411693
                  ],
                  [
                        100.5455496,
                        13.8411683
                  ],
                  [
                        100.5455866,
                        13.8411681
                  ],
                  [
                        100.5456068,
                        13.841168
                  ],
                  [
                        100.5456183,
                        13.8411692
                  ],
                  [
                        100.5456184,
                        13.8411778
                  ],
                  [
                        100.545607,
                        13.8412068
                  ],
                  [
                        100.5455869,
                        13.841207
                  ],
                  [
                        100.5454107,
                        13.8412081
                  ],
                  [
                        100.5453908,
                        13.8412082
                  ],
                  [
                        100.5453789,
                        13.8411932
                  ],
                  [
                        100.5453788,
                        13.8411855
                  ],
                  [
                        100.5453788,
                        13.8411846
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-08",
            "name": "โครงการ 08 (2)",
            "sectionNumber": "08",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#84cc16",
            "stallsAvailable": 22,
            "totalStalls": 22,
            "realAreaSqm": 91,
            "centroid": [
                  100.5455007,
                  13.8413149
            ],
            "coordinates": [
                  [
                        100.5453819,
                        13.8413119
                  ],
                  [
                        100.5453936,
                        13.8412964
                  ],
                  [
                        100.5454689,
                        13.8412959
                  ],
                  [
                        100.5454891,
                        13.8412958
                  ],
                  [
                        100.5456079,
                        13.8412953
                  ],
                  [
                        100.5456204,
                        13.8412968
                  ],
                  [
                        100.5456205,
                        13.8413054
                  ],
                  [
                        100.5456081,
                        13.8413342
                  ],
                  [
                        100.5455126,
                        13.8413348
                  ],
                  [
                        100.5453938,
                        13.8413353
                  ],
                  [
                        100.545382,
                        13.8413205
                  ],
                  [
                        100.5453819,
                        13.8413128
                  ],
                  [
                        100.5453819,
                        13.8413119
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-09",
            "name": "โครงการ 09 (E)",
            "sectionNumber": "09",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#d97706",
            "stallsAvailable": 20,
            "totalStalls": 20,
            "realAreaSqm": 140,
            "centroid": [
                  100.5450818,
                  13.840783
            ],
            "coordinates": [
                  [
                        100.5448855,
                        13.8407652
                  ],
                  [
                        100.5449595,
                        13.8407647
                  ],
                  [
                        100.5451816,
                        13.8407633
                  ],
                  [
                        100.5452001,
                        13.8407632
                  ],
                  [
                        100.5452556,
                        13.8407629
                  ],
                  [
                        100.5452741,
                        13.8407628
                  ],
                  [
                        100.5452743,
                        13.8407944
                  ],
                  [
                        100.5452003,
                        13.8407949
                  ],
                  [
                        100.5449783,
                        13.8407963
                  ],
                  [
                        100.5449598,
                        13.8407964
                  ],
                  [
                        100.5449043,
                        13.8407967
                  ],
                  [
                        100.5448858,
                        13.8407968
                  ],
                  [
                        100.5448855,
                        13.8407652
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-10",
            "name": "โครงการ 10 (9)",
            "sectionNumber": "10",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#6366f1",
            "stallsAvailable": 20,
            "totalStalls": 20,
            "realAreaSqm": 89,
            "centroid": [
                  100.5454963,
                  13.8408924
            ],
            "coordinates": [
                  [
                        100.5453891,
                        13.8408733
                  ],
                  [
                        100.5454089,
                        13.8408731
                  ],
                  [
                        100.5456036,
                        13.840872
                  ],
                  [
                        100.5456037,
                        13.8408914
                  ],
                  [
                        100.5456038,
                        13.8409109
                  ],
                  [
                        100.5455282,
                        13.8409114
                  ],
                  [
                        100.5454092,
                        13.840912
                  ],
                  [
                        100.5453893,
                        13.8409121
                  ],
                  [
                        100.5453891,
                        13.8408733
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-11",
            "name": "โครงการ 11 (7)",
            "sectionNumber": "11",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#14b8a6",
            "stallsAvailable": 20,
            "totalStalls": 20,
            "realAreaSqm": 89,
            "centroid": [
                  100.545498,
                  13.8409995
            ],
            "coordinates": [
                  [
                        100.5453898,
                        13.8409804
                  ],
                  [
                        100.5454281,
                        13.8409801
                  ],
                  [
                        100.5456063,
                        13.8409791
                  ],
                  [
                        100.5456064,
                        13.8409985
                  ],
                  [
                        100.5456065,
                        13.841018
                  ],
                  [
                        100.5455308,
                        13.8410185
                  ],
                  [
                        100.545511,
                        13.8410186
                  ],
                  [
                        100.54539,
                        13.8410192
                  ],
                  [
                        100.5453898,
                        13.8409804
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-12",
            "name": "โครงการ 12 (5)",
            "sectionNumber": "12",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f97316",
            "stallsAvailable": 20,
            "totalStalls": 20,
            "realAreaSqm": 89,
            "centroid": [
                  100.5454987,
                  13.8411255
            ],
            "coordinates": [
                  [
                        100.5453904,
                        13.8411068
                  ],
                  [
                        100.5455116,
                        13.8411053
                  ],
                  [
                        100.5455314,
                        13.8411051
                  ],
                  [
                        100.5455684,
                        13.8411049
                  ],
                  [
                        100.5455869,
                        13.8411048
                  ],
                  [
                        100.5456071,
                        13.8411047
                  ],
                  [
                        100.5456072,
                        13.841124
                  ],
                  [
                        100.5456073,
                        13.8411435
                  ],
                  [
                        100.5454862,
                        13.841145
                  ],
                  [
                        100.545429,
                        13.8411454
                  ],
                  [
                        100.5454105,
                        13.8411455
                  ],
                  [
                        100.5453906,
                        13.8411456
                  ],
                  [
                        100.5453904,
                        13.8411068
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-13",
            "name": "โครงการ 13 (3)",
            "sectionNumber": "13",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#a855f7",
            "stallsAvailable": 20,
            "totalStalls": 20,
            "realAreaSqm": 89,
            "centroid": [
                  100.5454994,
                  13.8412522
            ],
            "coordinates": [
                  [
                        100.5453919,
                        13.8412331
                  ],
                  [
                        100.5454673,
                        13.8412326
                  ],
                  [
                        100.5455313,
                        13.8412322
                  ],
                  [
                        100.5455498,
                        13.8412321
                  ],
                  [
                        100.5455868,
                        13.8412319
                  ],
                  [
                        100.5456069,
                        13.8412318
                  ],
                  [
                        100.5456071,
                        13.8412511
                  ],
                  [
                        100.5456072,
                        13.8412706
                  ],
                  [
                        100.5455685,
                        13.8412709
                  ],
                  [
                        100.5453922,
                        13.841272
                  ],
                  [
                        100.5453919,
                        13.8412331
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-14",
            "name": "โครงการ 14 (1)",
            "sectionNumber": "14",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#0284c7",
            "stallsAvailable": 20,
            "totalStalls": 20,
            "realAreaSqm": 89,
            "centroid": [
                  100.5455003,
                  13.8413791
            ],
            "coordinates": [
                  [
                        100.5453935,
                        13.84136
                  ],
                  [
                        100.5454134,
                        13.8413598
                  ],
                  [
                        100.545587,
                        13.8413587
                  ],
                  [
                        100.5456071,
                        13.8413586
                  ],
                  [
                        100.5456073,
                        13.8413779
                  ],
                  [
                        100.5456074,
                        13.8413975
                  ],
                  [
                        100.5454506,
                        13.8413985
                  ],
                  [
                        100.5454136,
                        13.8413987
                  ],
                  [
                        100.5453938,
                        13.8413988
                  ],
                  [
                        100.5453936,
                        13.8413793
                  ],
                  [
                        100.5453935,
                        13.84136
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-15",
            "name": "โครงการ 15 (โซนหลัก)",
            "sectionNumber": "15",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#059669",
            "stallsAvailable": 11,
            "totalStalls": 11,
            "realAreaSqm": 12736,
            "centroid": [
                  100.5452553,
                  13.8409151
            ],
            "coordinates": [
                  [
                        100.5445014,
                        13.8403419
                  ],
                  [
                        100.5447896,
                        13.8403401
                  ],
                  [
                        100.5456669,
                        13.8403452
                  ],
                  [
                        100.5460672,
                        13.8403496
                  ],
                  [
                        100.5464432,
                        13.8403642
                  ],
                  [
                        100.5464735,
                        13.8404135
                  ],
                  [
                        100.5464838,
                        13.8409196
                  ],
                  [
                        100.5464873,
                        13.841455
                  ],
                  [
                        100.5464636,
                        13.8414757
                  ],
                  [
                        100.5448493,
                        13.8413786
                  ],
                  [
                        100.544662,
                        13.8413633
                  ],
                  [
                        100.5445485,
                        13.841354
                  ],
                  [
                        100.5445098,
                        13.8408605
                  ],
                  [
                        100.5445014,
                        13.8403419
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "pra-16",
            "name": "โครงการ 16 (G)",
            "sectionNumber": "16",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#4f46e5",
            "stallsAvailable": 4,
            "totalStalls": 4,
            "realAreaSqm": 4,
            "centroid": [
                  100.5450767,
                  13.8403402
            ],
            "coordinates": [
                  [
                        100.5450584,
                        13.8403302
                  ],
                  [
                        100.5450672,
                        13.8403301
                  ],
                  [
                        100.5450866,
                        13.84033
                  ],
                  [
                        100.5450954,
                        13.84033
                  ],
                  [
                        100.5450956,
                        13.8403471
                  ],
                  [
                        100.5450956,
                        13.8403472
                  ],
                  [
                        100.5450586,
                        13.8403474
                  ],
                  [
                        100.5450585,
                        13.8403388
                  ],
                  [
                        100.5450584,
                        13.8403302
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '3': {
    id: 3,
    slug: 'min-buri',
    name: 'ตลาดมีนบุรี',
    district: 'เขตมีนบุรี',
    center: [100.7254896, 13.8150875],
    overviewZoom: 17.8,
    bearing: 15,
    pitch: 38,
    description: 'ศูนย์กลางการค้าและตลาดนัดใหญ่ที่สุดของกรุงเทพฯ ฝั่งตะวันออก มี 2 ชั้น (ชั้นล่างและชั้นบน)',
    projects: [
      {
            "id": "min-01",
            "name": "โครงการ 01 (โซนหลัก (ชั้นล่าง))",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 945,
            "totalStalls": 945,
            "realAreaSqm": 13065413,
            "centroid": [
                  100.7257118,
                  13.8140221
            ],
            "coordinates": [
                  [
                        100.7245521,
                        13.8173777
                  ],
                  [
                        100.725015,
                        13.8151383
                  ],
                  [
                        100.7250408,
                        13.8150507
                  ],
                  [
                        100.7256349,
                        13.8131567
                  ],
                  [
                        100.7257814,
                        13.8127027
                  ],
                  [
                        100.7258667,
                        13.812702
                  ],
                  [
                        100.7262449,
                        13.8126991
                  ],
                  [
                        100.7262481,
                        13.8126991
                  ],
                  [
                        100.7262513,
                        13.8126994
                  ],
                  [
                        100.7262545,
                        13.8127
                  ],
                  [
                        100.7264442,
                        13.8127474
                  ],
                  [
                        100.7257118,
                        13.8152938
                  ],
                  [
                        100.7248001,
                        13.8174758
                  ],
                  [
                        100.7245521,
                        13.8173777
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-02",
            "name": "โครงการ 02 (แผงค้าเบ็ดเตล็ด (ชั้นบน))",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 538,
            "totalStalls": 538,
            "realAreaSqm": 2672,
            "centroid": [
                  100.7255979,
                  13.8143934
            ],
            "coordinates": [
                  [
                        100.7252638,
                        13.8148245
                  ],
                  [
                        100.7252641,
                        13.8148234
                  ],
                  [
                        100.7255062,
                        13.8139922
                  ],
                  [
                        100.7255372,
                        13.8138859
                  ],
                  [
                        100.7256294,
                        13.8139115
                  ],
                  [
                        100.7259242,
                        13.8139935
                  ],
                  [
                        100.7259464,
                        13.8139997
                  ],
                  [
                        100.7259461,
                        13.8140008
                  ],
                  [
                        100.7259313,
                        13.8140517
                  ],
                  [
                        100.725906,
                        13.8141386
                  ],
                  [
                        100.7258708,
                        13.8142595
                  ],
                  [
                        100.7257085,
                        13.8148167
                  ],
                  [
                        100.7256781,
                        13.814921
                  ],
                  [
                        100.725673,
                        13.8149384
                  ],
                  [
                        100.7256679,
                        13.8149557
                  ],
                  [
                        100.7256457,
                        13.8149496
                  ],
                  [
                        100.7255729,
                        13.8149293
                  ],
                  [
                        100.7252638,
                        13.8148245
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-03",
            "name": "โครงการ 03 (โครงการที่ 3 (ชั้นล่าง))",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 188,
            "totalStalls": 188,
            "realAreaSqm": 1122,
            "centroid": [
                  100.7248552,
                  13.8164909
            ],
            "coordinates": [
                  [
                        100.7246515,
                        13.8166772
                  ],
                  [
                        100.7247749,
                        13.8163031
                  ],
                  [
                        100.7248033,
                        13.8162171
                  ],
                  [
                        100.7248676,
                        13.8162351
                  ],
                  [
                        100.7249831,
                        13.8162676
                  ],
                  [
                        100.7250275,
                        13.8162801
                  ],
                  [
                        100.7250173,
                        13.8163149
                  ],
                  [
                        100.7250122,
                        13.8163323
                  ],
                  [
                        100.725002,
                        13.816367
                  ],
                  [
                        100.7249163,
                        13.816658
                  ],
                  [
                        100.7248907,
                        13.8167448
                  ],
                  [
                        100.7248685,
                        13.8167386
                  ],
                  [
                        100.7248329,
                        13.8167286
                  ],
                  [
                        100.7247529,
                        13.8167061
                  ],
                  [
                        100.7247174,
                        13.8166961
                  ],
                  [
                        100.7246515,
                        13.8166772
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-04",
            "name": "โครงการ 04 (โครงการที่ 2 (ชั้นล่าง))",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 182,
            "totalStalls": 182,
            "realAreaSqm": 1031,
            "centroid": [
                  100.7250023,
                  13.8160086
            ],
            "coordinates": [
                  [
                        100.7248076,
                        13.8162042
                  ],
                  [
                        100.7248189,
                        13.8161697
                  ],
                  [
                        100.7249425,
                        13.8157951
                  ],
                  [
                        100.7249596,
                        13.8157435
                  ],
                  [
                        100.7251682,
                        13.8158024
                  ],
                  [
                        100.7251631,
                        13.8158198
                  ],
                  [
                        100.725158,
                        13.8158372
                  ],
                  [
                        100.7251427,
                        13.8158893
                  ],
                  [
                        100.725057,
                        13.8161803
                  ],
                  [
                        100.7250314,
                        13.8162671
                  ],
                  [
                        100.7250092,
                        13.8162609
                  ],
                  [
                        100.7249736,
                        13.8162509
                  ],
                  [
                        100.7248936,
                        13.8162284
                  ],
                  [
                        100.7248076,
                        13.8162042
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-05",
            "name": "โครงการ 05 (โครงการที่ 4 (ชั้นล่าง))",
            "sectionNumber": "05",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#8b5cf6",
            "stallsAvailable": 177,
            "totalStalls": 177,
            "realAreaSqm": 926,
            "centroid": [
                  100.7247292,
                  13.8169062
            ],
            "coordinates": [
                  [
                        100.724535,
                        13.8170304
                  ],
                  [
                        100.724552,
                        13.8169788
                  ],
                  [
                        100.7245577,
                        13.8169615
                  ],
                  [
                        100.7246017,
                        13.8168281
                  ],
                  [
                        100.7246301,
                        13.8167421
                  ],
                  [
                        100.7246472,
                        13.8166904
                  ],
                  [
                        100.7248824,
                        13.8167566
                  ],
                  [
                        100.7249046,
                        13.8167629
                  ],
                  [
                        100.7248893,
                        13.816815
                  ],
                  [
                        100.7248343,
                        13.8170017
                  ],
                  [
                        100.7248087,
                        13.8170886
                  ],
                  [
                        100.7248036,
                        13.8171059
                  ],
                  [
                        100.7247933,
                        13.8171407
                  ],
                  [
                        100.7247489,
                        13.8171282
                  ],
                  [
                        100.724535,
                        13.8170304
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-06",
            "name": "โครงการ 06 (โครงการที่ 1 (ชั้นล่าง))",
            "sectionNumber": "06",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#06b6d4",
            "stallsAvailable": 176,
            "totalStalls": 176,
            "realAreaSqm": 912,
            "centroid": [
                  100.7251412,
                  13.8155666
            ],
            "coordinates": [
                  [
                        100.7249638,
                        13.8157308
                  ],
                  [
                        100.7249695,
                        13.8157134
                  ],
                  [
                        100.7249865,
                        13.8156617
                  ],
                  [
                        100.7250929,
                        13.8153392
                  ],
                  [
                        100.7251374,
                        13.8153517
                  ],
                  [
                        100.7252885,
                        13.8153942
                  ],
                  [
                        100.7253107,
                        13.8154005
                  ],
                  [
                        100.7252954,
                        13.8154526
                  ],
                  [
                        100.7252148,
                        13.8157262
                  ],
                  [
                        100.7252097,
                        13.8157435
                  ],
                  [
                        100.7251943,
                        13.8157957
                  ],
                  [
                        100.7250343,
                        13.8157507
                  ],
                  [
                        100.7249988,
                        13.8157407
                  ],
                  [
                        100.7249638,
                        13.8157308
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-07",
            "name": "โครงการ 07 (โครงการที่ 7 (ชั้นล่าง))",
            "sectionNumber": "07",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#e11d48",
            "stallsAvailable": 156,
            "totalStalls": 156,
            "realAreaSqm": 780,
            "centroid": [
                  100.7251096,
                  13.8165565
            ],
            "coordinates": [
                  [
                        100.7249618,
                        13.8167648
                  ],
                  [
                        100.7249822,
                        13.8166953
                  ],
                  [
                        100.7250986,
                        13.8163001
                  ],
                  [
                        100.7251431,
                        13.8163126
                  ],
                  [
                        100.7252142,
                        13.8163326
                  ],
                  [
                        100.7252586,
                        13.8163451
                  ],
                  [
                        100.7252433,
                        13.8163973
                  ],
                  [
                        100.7252075,
                        13.8165189
                  ],
                  [
                        100.7251832,
                        13.8166014
                  ],
                  [
                        100.7251269,
                        13.8167925
                  ],
                  [
                        100.7251218,
                        13.8168098
                  ],
                  [
                        100.7250995,
                        13.8168036
                  ],
                  [
                        100.7250195,
                        13.8167811
                  ],
                  [
                        100.724984,
                        13.8167711
                  ],
                  [
                        100.7249618,
                        13.8167648
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-08",
            "name": "โครงการ 08 (โครงการที่ 6 (ชั้นล่าง))",
            "sectionNumber": "08",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#84cc16",
            "stallsAvailable": 156,
            "totalStalls": 156,
            "realAreaSqm": 780,
            "centroid": [
                  100.7252487,
                  13.8160773
            ],
            "coordinates": [
                  [
                        100.7251025,
                        13.8162871
                  ],
                  [
                        100.7251076,
                        13.8162697
                  ],
                  [
                        100.7251229,
                        13.8162176
                  ],
                  [
                        100.7252393,
                        13.8158224
                  ],
                  [
                        100.7252838,
                        13.8158349
                  ],
                  [
                        100.7253549,
                        13.8158549
                  ],
                  [
                        100.7253993,
                        13.8158674
                  ],
                  [
                        100.7253891,
                        13.8159022
                  ],
                  [
                        100.7253789,
                        13.8159369
                  ],
                  [
                        100.7253239,
                        13.8161237
                  ],
                  [
                        100.7252625,
                        13.8163321
                  ],
                  [
                        100.7252402,
                        13.8163259
                  ],
                  [
                        100.7251247,
                        13.8162934
                  ],
                  [
                        100.7251025,
                        13.8162871
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-09",
            "name": "โครงการ 09 (โครงการที่ 8 (ชั้นล่าง))",
            "sectionNumber": "09",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#d97706",
            "stallsAvailable": 155,
            "totalStalls": 155,
            "realAreaSqm": 775,
            "centroid": [
                  100.7249554,
                  13.8169943
            ],
            "coordinates": [
                  [
                        100.7248067,
                        13.8171444
                  ],
                  [
                        100.7248271,
                        13.8170749
                  ],
                  [
                        100.7248629,
                        13.8169533
                  ],
                  [
                        100.7248872,
                        13.8168708
                  ],
                  [
                        100.7249179,
                        13.8167666
                  ],
                  [
                        100.7249624,
                        13.8167791
                  ],
                  [
                        100.7250335,
                        13.8167991
                  ],
                  [
                        100.7250957,
                        13.8168166
                  ],
                  [
                        100.7251179,
                        13.8168229
                  ],
                  [
                        100.7251026,
                        13.816875
                  ],
                  [
                        100.7250668,
                        13.8169966
                  ],
                  [
                        100.7250425,
                        13.8170791
                  ],
                  [
                        100.7250118,
                        13.8171833
                  ],
                  [
                        100.7249964,
                        13.8172354
                  ],
                  [
                        100.7249119,
                        13.817212
                  ],
                  [
                        100.7248067,
                        13.8171444
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-10",
            "name": "โครงการ 10 (โครงการที่ 5 (ชั้นล่าง))",
            "sectionNumber": "10",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#6366f1",
            "stallsAvailable": 154,
            "totalStalls": 154,
            "realAreaSqm": 770,
            "centroid": [
                  100.7253587,
                  13.815628
            ],
            "coordinates": [
                  [
                        100.7252076,
                        13.8157994
                  ],
                  [
                        100.7252127,
                        13.815782
                  ],
                  [
                        100.7252933,
                        13.8155084
                  ],
                  [
                        100.725324,
                        13.8154042
                  ],
                  [
                        100.7253685,
                        13.8154167
                  ],
                  [
                        100.7255196,
                        13.8154592
                  ],
                  [
                        100.7255145,
                        13.8154766
                  ],
                  [
                        100.7254339,
                        13.8157502
                  ],
                  [
                        100.7254032,
                        13.8158544
                  ],
                  [
                        100.7253809,
                        13.8158482
                  ],
                  [
                        100.7253098,
                        13.8158282
                  ],
                  [
                        100.7252654,
                        13.8158157
                  ],
                  [
                        100.7252299,
                        13.8158057
                  ],
                  [
                        100.7252076,
                        13.8157994
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-11",
            "name": "โครงการ 11 (แผงค้าต้นไม้ (ชั้นบน))",
            "sectionNumber": "11",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#14b8a6",
            "stallsAvailable": 139,
            "totalStalls": 139,
            "realAreaSqm": 696,
            "centroid": [
                  100.7260903,
                  13.8130817
            ],
            "coordinates": [
                  [
                        100.7259379,
                        13.8132816
                  ],
                  [
                        100.7259429,
                        13.8132642
                  ],
                  [
                        100.725953,
                        13.8132293
                  ],
                  [
                        100.7260441,
                        13.8129164
                  ],
                  [
                        100.7260593,
                        13.8128642
                  ],
                  [
                        100.7261139,
                        13.8128418
                  ],
                  [
                        100.7261685,
                        13.8128194
                  ],
                  [
                        100.7261972,
                        13.8128086
                  ],
                  [
                        100.7262194,
                        13.8128148
                  ],
                  [
                        100.7262187,
                        13.8129835
                  ],
                  [
                        100.7262137,
                        13.8130009
                  ],
                  [
                        100.7261222,
                        13.8133141
                  ],
                  [
                        100.7261171,
                        13.8133314
                  ],
                  [
                        100.7260949,
                        13.8133253
                  ],
                  [
                        100.7260726,
                        13.8133191
                  ],
                  [
                        100.7259601,
                        13.8132878
                  ],
                  [
                        100.7259379,
                        13.8132816
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      },
      {
            "id": "min-12",
            "name": "โครงการ 12 (โซนหลัก (ชั้นบน))",
            "sectionNumber": "12",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f97316",
            "stallsAvailable": 8,
            "totalStalls": 8,
            "realAreaSqm": 834,
            "centroid": [
                  100.7258613,
                  13.8136896
            ],
            "coordinates": [
                  [
                        100.7255486,
                        13.8138393
                  ],
                  [
                        100.7256115,
                        13.8135685
                  ],
                  [
                        100.7257181,
                        13.8132025
                  ],
                  [
                        100.7258277,
                        13.8132189
                  ],
                  [
                        100.7258582,
                        13.8132274
                  ],
                  [
                        100.7260643,
                        13.8135244
                  ],
                  [
                        100.7259926,
                        13.8138427
                  ],
                  [
                        100.7259921,
                        13.8138445
                  ],
                  [
                        100.7259777,
                        13.813894
                  ],
                  [
                        100.7259603,
                        13.8139536
                  ],
                  [
                        100.7259161,
                        13.8141038
                  ],
                  [
                        100.7259159,
                        13.8141044
                  ],
                  [
                        100.7255486,
                        13.8138393
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้นล่าง",
                        "shortLabel": "1F",
                        "level": 1
                  },
                  {
                        "id": "2",
                        "name": "ชั้นบน",
                        "shortLabel": "2F",
                        "level": 2
                  }
            ]
      }
]
  },
  '4': {
    id: 4,
    slug: 'singhanat',
    name: 'ตลาดสิงหา',
    district: 'เขตคลองเตย',
    center: [100.5967214, 13.7113411],
    overviewZoom: 18.8,
    bearing: 10,
    pitch: 35,
    description: 'ตลาดชุมชนใจกลางสุขุมวิท 22 รองรับกลุ่มคนทำงานออฟฟิศ นักท่องเที่ยว และผู้อยู่อาศัยในพื้นที่',
    projects: [
      {
            "id": "sin-01",
            "name": "โครงการ 01",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 91,
            "totalStalls": 91,
            "realAreaSqm": 753,
            "centroid": [
                  100.5967131,
                  13.7113668
            ],
            "coordinates": [
                  [
                        100.596373,
                        13.7114606
                  ],
                  [
                        100.5968791,
                        13.7110937
                  ],
                  [
                        100.596909,
                        13.7110724
                  ],
                  [
                        100.5969937,
                        13.7111218
                  ],
                  [
                        100.5970254,
                        13.7111644
                  ],
                  [
                        100.5970698,
                        13.7112241
                  ],
                  [
                        100.5970548,
                        13.7112348
                  ],
                  [
                        100.5970226,
                        13.711256
                  ],
                  [
                        100.5965174,
                        13.711588
                  ],
                  [
                        100.596484,
                        13.7116099
                  ],
                  [
                        100.5964632,
                        13.711582
                  ],
                  [
                        100.596411,
                        13.7115118
                  ],
                  [
                        100.5963908,
                        13.7114846
                  ],
                  [
                        100.596373,
                        13.7114606
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '5': {
    id: 5,
    slug: 'thewarat',
    name: 'ตลาดเทวราช',
    district: 'เขตดุสิต',
    center: [100.5027484, 13.7712845],
    overviewZoom: 18.4,
    bearing: 22,
    pitch: 38,
    description: 'ตลาดเทวราช (ตลาดเทเวศร์) ริมคลองผดุงกรุงเกษม แหล่งจำหน่ายไม้ดอกไม้ประดับ อาหารสด และอาหารปรุงสำเร็จเก่าแก่ของดุสิต มี 4 โซนหลักรวม 475 แผงค้า',
    projects: [
      {
            "id": "twr-01",
            "name": "โซน 1 (อาคารตลาดสดด้านใน)",
            "sectionNumber": "01",
            "category": "เนื้อสัตว์ ผักสด อาหารทะเล และของสด",
            "color": "#0284c7",
            "stallsAvailable": 306,
            "totalStalls": 306,
            "realAreaSqm": 1213,
            "centroid": [
                  100.5026509,
                  13.7711788
            ],
            "coordinates": [
                  [
                        100.5022992,
                        13.7712709
                  ],
                  [
                        100.5023283,
                        13.7712494
                  ],
                  [
                        100.5028167,
                        13.7708901
                  ],
                  [
                        100.502846,
                        13.7708686
                  ],
                  [
                        100.5028571,
                        13.770883
                  ],
                  [
                        100.5030128,
                        13.7710852
                  ],
                  [
                        100.502998,
                        13.7710961
                  ],
                  [
                        100.5029836,
                        13.7711067
                  ],
                  [
                        100.5024804,
                        13.771477
                  ],
                  [
                        100.502466,
                        13.7714875
                  ],
                  [
                        100.5024549,
                        13.7714731
                  ],
                  [
                        100.5022992,
                        13.7712709
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "twr-02",
            "name": "โซน 2 (อาคารตลาดสดรอบนอก)",
            "sectionNumber": "02",
            "category": "ของแห้ง วัตถุดิบ เครื่องเทศ และเบ็ดเตล็ด",
            "color": "#0d9488",
            "stallsAvailable": 92,
            "totalStalls": 92,
            "realAreaSqm": 333,
            "centroid": [
                  100.5027045,
                  13.7712466
            ],
            "coordinates": [
                  [
                        100.5022919,
                        13.7713215
                  ],
                  [
                        100.5023214,
                        13.7712997
                  ],
                  [
                        100.5028978,
                        13.7708757
                  ],
                  [
                        100.5030497,
                        13.7710129
                  ],
                  [
                        100.5030719,
                        13.7710417
                  ],
                  [
                        100.503083,
                        13.7710562
                  ],
                  [
                        100.5030683,
                        13.7710671
                  ],
                  [
                        100.5030092,
                        13.7711106
                  ],
                  [
                        100.5024772,
                        13.771502
                  ],
                  [
                        100.5024328,
                        13.7715346
                  ],
                  [
                        100.5024106,
                        13.7715057
                  ],
                  [
                        100.5022919,
                        13.7713215
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "twr-03",
            "name": "โซน 3 (ศูนย์อาหารเทเวศร์)",
            "sectionNumber": "03",
            "category": "อาหารปรุงสำเร็จ ข้าวแกง เครื่องดื่ม ขนมไทย",
            "color": "#ea580c",
            "stallsAvailable": 44,
            "totalStalls": 44,
            "realAreaSqm": 248,
            "centroid": [
                  100.502962,
                  13.7716199
            ],
            "coordinates": [
                  [
                        100.5028519,
                        13.771452
                  ],
                  [
                        100.5028992,
                        13.7714355
                  ],
                  [
                        100.5029297,
                        13.7714249
                  ],
                  [
                        100.5030072,
                        13.7716282
                  ],
                  [
                        100.5030116,
                        13.7716401
                  ],
                  [
                        100.5030166,
                        13.7716537
                  ],
                  [
                        100.5030371,
                        13.7717099
                  ],
                  [
                        100.5030492,
                        13.7717431
                  ],
                  [
                        100.5030613,
                        13.7717763
                  ],
                  [
                        100.5030662,
                        13.77179
                  ],
                  [
                        100.5029855,
                        13.7718181
                  ],
                  [
                        100.5029808,
                        13.7718053
                  ],
                  [
                        100.502973,
                        13.771784
                  ],
                  [
                        100.5029435,
                        13.7717032
                  ],
                  [
                        100.5029109,
                        13.7716138
                  ],
                  [
                        100.5028519,
                        13.771452
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "twr-04",
            "name": "โซน 4 (ลานต้นโพธิ์)",
            "sectionNumber": "04",
            "category": "ไม้ดอกไม้ประดับ แคคตัส กระถาง และสินค้าทั่วไป",
            "color": "#16a34a",
            "stallsAvailable": 33,
            "totalStalls": 33,
            "realAreaSqm": 131,
            "centroid": [
                  100.5030219,
                  13.7708711
            ],
            "coordinates": [
                  [
                        100.5029021,
                        13.7707996
                  ],
                  [
                        100.5029169,
                        13.7707886
                  ],
                  [
                        100.5029316,
                        13.7707777
                  ],
                  [
                        100.5029723,
                        13.7707509
                  ],
                  [
                        100.5029835,
                        13.7707653
                  ],
                  [
                        100.5030617,
                        13.7708661
                  ],
                  [
                        100.5032048,
                        13.7710513
                  ],
                  [
                        100.50319,
                        13.7710622
                  ],
                  [
                        100.5029804,
                        13.7709004
                  ],
                  [
                        100.5029692,
                        13.770886
                  ],
                  [
                        100.5029468,
                        13.7708572
                  ],
                  [
                        100.5029021,
                        13.7707996
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '6': {
    id: 6,
    slug: 'rat-burana',
    name: 'ตลาดราษฎร์บูรณะ',
    district: 'เขตราษฎร์บูรณะ',
    center: [100.506194, 13.6811691],
    overviewZoom: 18.2,
    bearing: 0,
    pitch: 35,
    description: 'ตลาดสดและสินค้าชุมชนฝั่งธนบุรี บริเวณศูนย์ราชการราษฎร์บูรณะ',
    projects: [
      {
            "id": "rat-01",
            "name": "โครงการ 01 (อาคารตลาดราษฎร์บูรณะ)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 1,
            "totalStalls": 1,
            "realAreaSqm": 1284,
            "centroid": [
                  100.5062093,
                  13.681123
            ],
            "coordinates": [
                  [
                        100.5060085,
                        13.6810092
                  ],
                  [
                        100.5062612,
                        13.6809345
                  ],
                  [
                        100.5063795,
                        13.6813331
                  ],
                  [
                        100.5061362,
                        13.6814038
                  ],
                  [
                        100.5060085,
                        13.6810092
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '7': {
    id: 7,
    slug: 'bang-kapi',
    name: 'ตลาดบางกะปิ',
    district: 'เขตบางกะปิ',
    center: [100.6462099, 13.7671914],
    overviewZoom: 18.2,
    bearing: 12,
    pitch: 35,
    description: 'ตลาดสดและศูนย์การค้าชุมชนขนาดใหญ่ย่านลาดพร้าว-รามคำแหง ติดแนวรถไฟฟ้าสายสีเหลือง',
    projects: [
      {
            "id": "ban-01",
            "name": "โครงการ 01 (แผงร้านค้า)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 689,
            "totalStalls": 689,
            "realAreaSqm": 2756,
            "centroid": [
                  100.6461843,
                  13.7673215
            ],
            "coordinates": [
                  [
                        100.645963,
                        13.7680913
                  ],
                  [
                        100.6459649,
                        13.7680733
                  ],
                  [
                        100.6459688,
                        13.7680373
                  ],
                  [
                        100.6459815,
                        13.7679205
                  ],
                  [
                        100.6459903,
                        13.7678396
                  ],
                  [
                        100.6460495,
                        13.7672958
                  ],
                  [
                        100.6460539,
                        13.7672554
                  ],
                  [
                        100.6461374,
                        13.766524
                  ],
                  [
                        100.6461558,
                        13.7665259
                  ],
                  [
                        100.6461742,
                        13.7665278
                  ],
                  [
                        100.6463857,
                        13.7665498
                  ],
                  [
                        100.6464041,
                        13.7665518
                  ],
                  [
                        100.6464002,
                        13.7665877
                  ],
                  [
                        100.6463914,
                        13.7666686
                  ],
                  [
                        100.6463555,
                        13.7669985
                  ],
                  [
                        100.6463281,
                        13.7672501
                  ],
                  [
                        100.6462296,
                        13.768119
                  ],
                  [
                        100.6461928,
                        13.7681152
                  ],
                  [
                        100.6461745,
                        13.7681133
                  ],
                  [
                        100.645963,
                        13.7680913
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-02",
            "name": "โครงการ 02 (อาคารพาณิชย์)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 19,
            "totalStalls": 19,
            "realAreaSqm": 880,
            "centroid": [
                  100.6462869,
                  13.7664055
            ],
            "coordinates": [
                  [
                        100.6461048,
                        13.7664586
                  ],
                  [
                        100.6461098,
                        13.766363
                  ],
                  [
                        100.6461206,
                        13.7662637
                  ],
                  [
                        100.6463524,
                        13.7662878
                  ],
                  [
                        100.6464858,
                        13.7663017
                  ],
                  [
                        100.646475,
                        13.766401
                  ],
                  [
                        100.646458,
                        13.7665404
                  ],
                  [
                        100.6463565,
                        13.7665299
                  ],
                  [
                        100.6462925,
                        13.7665232
                  ],
                  [
                        100.6461048,
                        13.7664586
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-03",
            "name": "โครงการ 03 (พื้นที่ด้านซอย 127)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 1,
            "totalStalls": 1,
            "realAreaSqm": 611,
            "centroid": [
                  100.6463696,
                  13.7671455
            ],
            "coordinates": [
                  [
                        100.6462723,
                        13.7678882
                  ],
                  [
                        100.6464073,
                        13.7666476
                  ],
                  [
                        100.646448,
                        13.7666518
                  ],
                  [
                        100.646313,
                        13.7678924
                  ],
                  [
                        100.6462723,
                        13.7678882
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-04",
            "name": "โครงการ 04 (พื้นที่ด้านซอย 125)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 1,
            "totalStalls": 1,
            "realAreaSqm": 668,
            "centroid": [
                  100.646037,
                  13.7670528
            ],
            "coordinates": [
                  [
                        100.645934,
                        13.7678527
                  ],
                  [
                        100.6460781,
                        13.7665165
                  ],
                  [
                        100.64612,
                        13.7665215
                  ],
                  [
                        100.6459747,
                        13.7678569
                  ],
                  [
                        100.645934,
                        13.7678527
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '8': {
    id: 8,
    slug: 'wongwian-lek',
    name: 'ตลาดพระเครื่องวงเวียนเล็ก',
    district: 'เขตคลองสาน',
    center: [100.4965505, 13.7351518],
    overviewZoom: 18.6,
    bearing: 5,
    pitch: 35,
    description: 'ศูนย์รวมพระเครื่อง วัตถุมงคล ของเก่า และของสะสมเก่าแก่ระดับตำนานฝั่งธนบุรี',
    projects: [
      {
            "id": "won-01",
            "name": "โครงการ 01 (ฉ)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 107,
            "totalStalls": 107,
            "realAreaSqm": 158,
            "centroid": [
                  100.4965771,
                  13.735236
            ],
            "coordinates": [
                  [
                        100.4964387,
                        13.7346483
                  ],
                  [
                        100.4964424,
                        13.7346475
                  ],
                  [
                        100.4964505,
                        13.7346458
                  ],
                  [
                        100.496455,
                        13.7346656
                  ],
                  [
                        100.4964775,
                        13.7347649
                  ],
                  [
                        100.4966326,
                        13.73545
                  ],
                  [
                        100.4966798,
                        13.7356585
                  ],
                  [
                        100.496709,
                        13.7357876
                  ],
                  [
                        100.4967132,
                        13.7358064
                  ],
                  [
                        100.496704,
                        13.7358084
                  ],
                  [
                        100.4967015,
                        13.7358089
                  ],
                  [
                        100.4966991,
                        13.7357986
                  ],
                  [
                        100.4966897,
                        13.7357571
                  ],
                  [
                        100.49652,
                        13.7350075
                  ],
                  [
                        100.4965109,
                        13.7349673
                  ],
                  [
                        100.4964432,
                        13.7346682
                  ],
                  [
                        100.4964387,
                        13.7346483
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "won-02",
            "name": "โครงการ 02 (ง)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 104,
            "totalStalls": 104,
            "realAreaSqm": 142,
            "centroid": [
                  100.4966143,
                  13.7352337
            ],
            "coordinates": [
                  [
                        100.496474,
                        13.7346407
                  ],
                  [
                        100.4964847,
                        13.7346384
                  ],
                  [
                        100.4964852,
                        13.7346401
                  ],
                  [
                        100.4964942,
                        13.7346798
                  ],
                  [
                        100.4965114,
                        13.7347557
                  ],
                  [
                        100.496568,
                        13.7350057
                  ],
                  [
                        100.4967231,
                        13.7356908
                  ],
                  [
                        100.4967433,
                        13.7357802
                  ],
                  [
                        100.4967475,
                        13.7357989
                  ],
                  [
                        100.4967367,
                        13.7358013
                  ],
                  [
                        100.4967324,
                        13.7357825
                  ],
                  [
                        100.4966316,
                        13.7353373
                  ],
                  [
                        100.4964784,
                        13.7346606
                  ],
                  [
                        100.496474,
                        13.7346407
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "won-03",
            "name": "โครงการ 03 (จ)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 104,
            "totalStalls": 104,
            "realAreaSqm": 142,
            "centroid": [
                  100.4965987,
                  13.7352218
            ],
            "coordinates": [
                  [
                        100.4964631,
                        13.7346431
                  ],
                  [
                        100.496474,
                        13.7346407
                  ],
                  [
                        100.4965774,
                        13.7350974
                  ],
                  [
                        100.4967044,
                        13.7356584
                  ],
                  [
                        100.4967235,
                        13.7357428
                  ],
                  [
                        100.496728,
                        13.7357627
                  ],
                  [
                        100.4967367,
                        13.7358013
                  ],
                  [
                        100.4967259,
                        13.7358036
                  ],
                  [
                        100.4967216,
                        13.7357849
                  ],
                  [
                        100.4967126,
                        13.7357452
                  ],
                  [
                        100.4966991,
                        13.7356856
                  ],
                  [
                        100.4966429,
                        13.7354374
                  ],
                  [
                        100.496535,
                        13.7349608
                  ],
                  [
                        100.4964878,
                        13.7347523
                  ],
                  [
                        100.4964631,
                        13.7346431
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "won-04",
            "name": "โครงการ 04 (ก)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 96,
            "totalStalls": 96,
            "realAreaSqm": 143,
            "centroid": [
                  100.4966696,
                  13.7352153
            ],
            "coordinates": [
                  [
                        100.4965317,
                        13.7346282
                  ],
                  [
                        100.4965435,
                        13.7346257
                  ],
                  [
                        100.496548,
                        13.7346455
                  ],
                  [
                        100.496557,
                        13.7346852
                  ],
                  [
                        100.4967634,
                        13.7355969
                  ],
                  [
                        100.4967975,
                        13.7357476
                  ],
                  [
                        100.4968062,
                        13.7357862
                  ],
                  [
                        100.4967945,
                        13.7357888
                  ],
                  [
                        100.4967898,
                        13.7357683
                  ],
                  [
                        100.4967767,
                        13.7357105
                  ],
                  [
                        100.4966571,
                        13.7351825
                  ],
                  [
                        100.4965362,
                        13.7346481
                  ],
                  [
                        100.4965317,
                        13.7346282
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "won-05",
            "name": "โครงการ 05 (ข)",
            "sectionNumber": "05",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#8b5cf6",
            "stallsAvailable": 94,
            "totalStalls": 94,
            "realAreaSqm": 128,
            "centroid": [
                  100.4966486,
                  13.7352307
            ],
            "coordinates": [
                  [
                        100.4965083,
                        13.7346333
                  ],
                  [
                        100.4965191,
                        13.7346309
                  ],
                  [
                        100.4965506,
                        13.7347699
                  ],
                  [
                        100.4967664,
                        13.7357231
                  ],
                  [
                        100.4967776,
                        13.7357728
                  ],
                  [
                        100.4967818,
                        13.7357915
                  ],
                  [
                        100.4967805,
                        13.7357918
                  ],
                  [
                        100.496771,
                        13.7357939
                  ],
                  [
                        100.4967671,
                        13.7357767
                  ],
                  [
                        100.4967555,
                        13.7357255
                  ],
                  [
                        100.496742,
                        13.7356659
                  ],
                  [
                        100.4966749,
                        13.7353696
                  ],
                  [
                        100.4965689,
                        13.7349014
                  ],
                  [
                        100.4965217,
                        13.7346929
                  ],
                  [
                        100.4965172,
                        13.734673
                  ],
                  [
                        100.4965105,
                        13.7346432
                  ],
                  [
                        100.4965083,
                        13.7346333
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "won-06",
            "name": "โครงการ 06 (ค)",
            "sectionNumber": "06",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#06b6d4",
            "stallsAvailable": 94,
            "totalStalls": 94,
            "realAreaSqm": 128,
            "centroid": [
                  100.4966364,
                  13.7352292
            ],
            "coordinates": [
                  [
                        100.4964974,
                        13.7346356
                  ],
                  [
                        100.4965083,
                        13.7346333
                  ],
                  [
                        100.4965128,
                        13.7346531
                  ],
                  [
                        100.4966705,
                        13.7353497
                  ],
                  [
                        100.4967668,
                        13.7357751
                  ],
                  [
                        100.496771,
                        13.7357939
                  ],
                  [
                        100.4967602,
                        13.7357962
                  ],
                  [
                        100.4967559,
                        13.7357775
                  ],
                  [
                        100.4967334,
                        13.7356782
                  ],
                  [
                        100.4967053,
                        13.7355541
                  ],
                  [
                        100.4966255,
                        13.7352016
                  ],
                  [
                        100.4965783,
                        13.7349931
                  ],
                  [
                        100.4965311,
                        13.7347846
                  ],
                  [
                        100.4965019,
                        13.7346555
                  ],
                  [
                        100.4964974,
                        13.7346356
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "won-07",
            "name": "โครงการ 07 (โซนหลัก)",
            "sectionNumber": "07",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#e11d48",
            "stallsAvailable": 49,
            "totalStalls": 49,
            "realAreaSqm": 165,
            "centroid": [
                  100.4963412,
                  13.7346862
            ],
            "coordinates": [
                  [
                        100.4962947,
                        13.7347514
                  ],
                  [
                        100.4963434,
                        13.7345883
                  ],
                  [
                        100.4963696,
                        13.7345077
                  ],
                  [
                        100.4964264,
                        13.7344947
                  ],
                  [
                        100.4964557,
                        13.7346156
                  ],
                  [
                        100.4963458,
                        13.7347672
                  ],
                  [
                        100.4963449,
                        13.734767
                  ],
                  [
                        100.4963158,
                        13.734758
                  ],
                  [
                        100.4962956,
                        13.7347517
                  ],
                  [
                        100.4962947,
                        13.7347514
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '9': {
    id: 9,
    slug: 'nong-chok',
    name: 'ตลาดหนองจอก',
    district: 'เขตหนองจอก',
    center: [100.866388, 13.8562316],
    overviewZoom: 18.4,
    bearing: 20,
    pitch: 35,
    description: 'ตลาดสดชานเมืองริมคลองแสนแสบ แหล่งรวมอาหารสด พืชผักการเกษตรท้องถิ่น และอาหารฮาลาล',
    projects: [
      {
            "id": "non-01",
            "name": "โครงการ 01 (ด้านใน)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 140,
            "totalStalls": 140,
            "realAreaSqm": 560,
            "centroid": [
                  100.8664449,
                  13.8562117
            ],
            "coordinates": [
                  [
                        100.8663062,
                        13.8560407
                  ],
                  [
                        100.866397,
                        13.8560267
                  ],
                  [
                        100.8664522,
                        13.8560183
                  ],
                  [
                        100.8664704,
                        13.8560156
                  ],
                  [
                        100.866507,
                        13.8560102
                  ],
                  [
                        100.8665253,
                        13.8560075
                  ],
                  [
                        100.8665818,
                        13.8563594
                  ],
                  [
                        100.8665845,
                        13.8563772
                  ],
                  [
                        100.8665113,
                        13.856388
                  ],
                  [
                        100.8663654,
                        13.8564094
                  ],
                  [
                        100.8663592,
                        13.8563813
                  ],
                  [
                        100.8663337,
                        13.85622
                  ],
                  [
                        100.8663281,
                        13.8561843
                  ],
                  [
                        100.8663116,
                        13.8560768
                  ],
                  [
                        100.8663062,
                        13.8560407
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "non-02",
            "name": "โครงการ 02 (โซนหลัก)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 98,
            "totalStalls": 98,
            "realAreaSqm": 3721,
            "centroid": [
                  100.8663682,
                  13.8561554
            ],
            "coordinates": [
                  [
                        100.8659463,
                        13.8558201
                  ],
                  [
                        100.8661147,
                        13.8557331
                  ],
                  [
                        100.8665673,
                        13.8556489
                  ],
                  [
                        100.8667409,
                        13.8556236
                  ],
                  [
                        100.8667658,
                        13.8557876
                  ],
                  [
                        100.8668296,
                        13.8563969
                  ],
                  [
                        100.8664156,
                        13.8568264
                  ],
                  [
                        100.8663272,
                        13.8568395
                  ],
                  [
                        100.8660728,
                        13.8566138
                  ],
                  [
                        100.8659463,
                        13.8558201
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "non-03",
            "name": "โครงการ 03 (ด้านนอก)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 74,
            "totalStalls": 74,
            "realAreaSqm": 293,
            "centroid": [
                  100.8664354,
                  13.8562624
            ],
            "coordinates": [
                  [
                        100.8662851,
                        13.8560255
                  ],
                  [
                        100.8663943,
                        13.8560088
                  ],
                  [
                        100.8664494,
                        13.8560004
                  ],
                  [
                        100.8664688,
                        13.8559975
                  ],
                  [
                        100.8665226,
                        13.8559896
                  ],
                  [
                        100.8665515,
                        13.8559861
                  ],
                  [
                        100.8665656,
                        13.8560755
                  ],
                  [
                        100.8665825,
                        13.8561827
                  ],
                  [
                        100.8666022,
                        13.8563077
                  ],
                  [
                        100.8666078,
                        13.8563434
                  ],
                  [
                        100.8666122,
                        13.8563715
                  ],
                  [
                        100.8666155,
                        13.8563926
                  ],
                  [
                        100.8665916,
                        13.856419
                  ],
                  [
                        100.8665733,
                        13.8564218
                  ],
                  [
                        100.8665368,
                        13.8564273
                  ],
                  [
                        100.8663448,
                        13.8564562
                  ],
                  [
                        100.8663351,
                        13.8564576
                  ],
                  [
                        100.8663343,
                        13.8564577
                  ],
                  [
                        100.8663327,
                        13.8564577
                  ],
                  [
                        100.8663311,
                        13.8564573
                  ],
                  [
                        100.8663303,
                        13.8564571
                  ],
                  [
                        100.8663296,
                        13.8564568
                  ],
                  [
                        100.8663289,
                        13.8564564
                  ],
                  [
                        100.8663282,
                        13.856456
                  ],
                  [
                        100.8663276,
                        13.8564555
                  ],
                  [
                        100.866327,
                        13.8564549
                  ],
                  [
                        100.866326,
                        13.8564537
                  ],
                  [
                        100.8663256,
                        13.856453
                  ],
                  [
                        100.8663252,
                        13.8564523
                  ],
                  [
                        100.8663249,
                        13.8564516
                  ],
                  [
                        100.8663244,
                        13.8564497
                  ],
                  [
                        100.8663175,
                        13.8564054
                  ],
                  [
                        100.8662851,
                        13.8560255
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "non-04",
            "name": "โครงการ 04 (นอกตลาด)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 54,
            "totalStalls": 54,
            "realAreaSqm": 54,
            "centroid": [
                  100.8665634,
                  13.856549
            ],
            "coordinates": [
                  [
                        100.866424,
                        13.8565885
                  ],
                  [
                        100.8664625,
                        13.8565352
                  ],
                  [
                        100.8667072,
                        13.8564207
                  ],
                  [
                        100.8667163,
                        13.8564194
                  ],
                  [
                        100.8667177,
                        13.8564283
                  ],
                  [
                        100.8667205,
                        13.8564462
                  ],
                  [
                        100.866726,
                        13.856482
                  ],
                  [
                        100.8667273,
                        13.8564909
                  ],
                  [
                        100.8666998,
                        13.8565571
                  ],
                  [
                        100.8666456,
                        13.8565651
                  ],
                  [
                        100.8666083,
                        13.8565706
                  ],
                  [
                        100.8665077,
                        13.8565854
                  ],
                  [
                        100.8664254,
                        13.8565975
                  ],
                  [
                        100.866425,
                        13.8565953
                  ],
                  [
                        100.866424,
                        13.8565885
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '10': {
    id: 10,
    slug: 'ratchadaphisek',
    name: 'ตลาดรัชดาภิเษก',
    district: 'เขตธนบุรี',
    center: [100.4770889, 13.7212038],
    overviewZoom: 18.5,
    bearing: 10,
    pitch: 35,
    description: 'ตลาดรัชดาภิเษก (ตลาดพลู) ศูนย์รวมสตรีทฟู้ด ขนมหวาน และอาหารโบราณชื่อดังของฝั่งธนบุรี',
    projects: [
      {
            "id": "rat-01",
            "name": "โครงการ 01 (M)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 36,
            "totalStalls": 36,
            "realAreaSqm": 144,
            "centroid": [
                  100.4770704,
                  13.7212787
            ],
            "coordinates": [
                  [
                        100.477008,
                        13.7214586
                  ],
                  [
                        100.4770114,
                        13.7214408
                  ],
                  [
                        100.4770148,
                        13.721423
                  ],
                  [
                        100.4770275,
                        13.7213568
                  ],
                  [
                        100.4770309,
                        13.7213391
                  ],
                  [
                        100.4770787,
                        13.7210903
                  ],
                  [
                        100.4770952,
                        13.7210933
                  ],
                  [
                        100.4771369,
                        13.721101
                  ],
                  [
                        100.4771335,
                        13.7211188
                  ],
                  [
                        100.4771267,
                        13.7211543
                  ],
                  [
                        100.4771208,
                        13.721185
                  ],
                  [
                        100.477073,
                        13.7214337
                  ],
                  [
                        100.4770661,
                        13.7214692
                  ],
                  [
                        100.477048,
                        13.7214659
                  ],
                  [
                        100.477008,
                        13.7214586
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-02",
            "name": "โครงการ 02 (B)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 12,
            "totalStalls": 12,
            "realAreaSqm": 38,
            "centroid": [
                  100.4770242,
                  13.7211425
            ],
            "coordinates": [
                  [
                        100.4769685,
                        13.7211938
                  ],
                  [
                        100.4769889,
                        13.7210876
                  ],
                  [
                        100.4769915,
                        13.7210743
                  ],
                  [
                        100.4770243,
                        13.7210776
                  ],
                  [
                        100.4770329,
                        13.7210791
                  ],
                  [
                        100.4770733,
                        13.7210893
                  ],
                  [
                        100.4770665,
                        13.7211249
                  ],
                  [
                        100.4770572,
                        13.7211733
                  ],
                  [
                        100.4770503,
                        13.7212088
                  ],
                  [
                        100.477009,
                        13.7212035
                  ],
                  [
                        100.4770004,
                        13.7212019
                  ],
                  [
                        100.4769685,
                        13.7211938
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-03",
            "name": "โครงการ 03 (D)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 12,
            "totalStalls": 12,
            "realAreaSqm": 38,
            "centroid": [
                  100.4770003,
                  13.7212668
            ],
            "coordinates": [
                  [
                        100.4769446,
                        13.7213182
                  ],
                  [
                        100.476965,
                        13.721212
                  ],
                  [
                        100.4769676,
                        13.7211987
                  ],
                  [
                        100.4770004,
                        13.7212019
                  ],
                  [
                        100.477009,
                        13.7212035
                  ],
                  [
                        100.4770494,
                        13.7212137
                  ],
                  [
                        100.477046,
                        13.7212315
                  ],
                  [
                        100.4770426,
                        13.7212492
                  ],
                  [
                        100.4770367,
                        13.7212799
                  ],
                  [
                        100.4770264,
                        13.7213332
                  ],
                  [
                        100.4769851,
                        13.7213279
                  ],
                  [
                        100.4769765,
                        13.7213263
                  ],
                  [
                        100.4769446,
                        13.7213182
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-04",
            "name": "โครงการ 04 (F)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 12,
            "totalStalls": 12,
            "realAreaSqm": 38,
            "centroid": [
                  100.4769765,
                  13.7213905
            ],
            "coordinates": [
                  [
                        100.4769207,
                        13.7214425
                  ],
                  [
                        100.4769411,
                        13.7213364
                  ],
                  [
                        100.4769437,
                        13.721323
                  ],
                  [
                        100.4769765,
                        13.7213263
                  ],
                  [
                        100.4769851,
                        13.7213279
                  ],
                  [
                        100.4770255,
                        13.7213381
                  ],
                  [
                        100.4770187,
                        13.7213736
                  ],
                  [
                        100.4770128,
                        13.7214043
                  ],
                  [
                        100.4770025,
                        13.7214576
                  ],
                  [
                        100.4769612,
                        13.7214523
                  ],
                  [
                        100.4769526,
                        13.7214507
                  ],
                  [
                        100.4769207,
                        13.7214425
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-05",
            "name": "โครงการ 05 (E)",
            "sectionNumber": "05",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#8b5cf6",
            "stallsAvailable": 12,
            "totalStalls": 12,
            "realAreaSqm": 38,
            "centroid": [
                  100.4771181,
                  13.7214164
            ],
            "coordinates": [
                  [
                        100.4770716,
                        13.7214702
                  ],
                  [
                        100.4770818,
                        13.7214169
                  ],
                  [
                        100.4770945,
                        13.7213508
                  ],
                  [
                        100.4771354,
                        13.721356
                  ],
                  [
                        100.477144,
                        13.7213575
                  ],
                  [
                        100.4771759,
                        13.7213657
                  ],
                  [
                        100.4771555,
                        13.7214719
                  ],
                  [
                        100.4771529,
                        13.7214852
                  ],
                  [
                        100.4771201,
                        13.7214819
                  ],
                  [
                        100.4771115,
                        13.7214803
                  ],
                  [
                        100.4770716,
                        13.7214702
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-06",
            "name": "โครงการ 06 (C)",
            "sectionNumber": "06",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#06b6d4",
            "stallsAvailable": 12,
            "totalStalls": 12,
            "realAreaSqm": 38,
            "centroid": [
                  100.4771421,
                  13.7212944
            ],
            "coordinates": [
                  [
                        100.4770955,
                        13.7213459
                  ],
                  [
                        100.4770989,
                        13.7213281
                  ],
                  [
                        100.4771023,
                        13.7213103
                  ],
                  [
                        100.477115,
                        13.7212441
                  ],
                  [
                        100.4771184,
                        13.7212264
                  ],
                  [
                        100.4771593,
                        13.7212316
                  ],
                  [
                        100.4771679,
                        13.7212332
                  ],
                  [
                        100.4771998,
                        13.7212413
                  ],
                  [
                        100.4771794,
                        13.7213475
                  ],
                  [
                        100.4771768,
                        13.7213608
                  ],
                  [
                        100.477144,
                        13.7213575
                  ],
                  [
                        100.4771354,
                        13.721356
                  ],
                  [
                        100.4770955,
                        13.7213459
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-07",
            "name": "โครงการ 07 (A)",
            "sectionNumber": "07",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#e11d48",
            "stallsAvailable": 12,
            "totalStalls": 12,
            "realAreaSqm": 38,
            "centroid": [
                  100.4771661,
                  13.721169
            ],
            "coordinates": [
                  [
                        100.4771194,
                        13.7212215
                  ],
                  [
                        100.4771228,
                        13.7212037
                  ],
                  [
                        100.4771296,
                        13.7211682
                  ],
                  [
                        100.4771423,
                        13.721102
                  ],
                  [
                        100.4771832,
                        13.7211072
                  ],
                  [
                        100.4771918,
                        13.7211088
                  ],
                  [
                        100.4772237,
                        13.7211169
                  ],
                  [
                        100.4772033,
                        13.7212231
                  ],
                  [
                        100.4772007,
                        13.7212364
                  ],
                  [
                        100.4771679,
                        13.7212332
                  ],
                  [
                        100.4771593,
                        13.7212316
                  ],
                  [
                        100.4771194,
                        13.7212215
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-08",
            "name": "โครงการ 08 (G)",
            "sectionNumber": "08",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#84cc16",
            "stallsAvailable": 10,
            "totalStalls": 10,
            "realAreaSqm": 28,
            "centroid": [
                  100.4771083,
                  13.7210854
            ],
            "coordinates": [
                  [
                        100.4769924,
                        13.7210694
                  ],
                  [
                        100.476995,
                        13.7210561
                  ],
                  [
                        100.4771004,
                        13.7210754
                  ],
                  [
                        100.4772272,
                        13.7210987
                  ],
                  [
                        100.4772246,
                        13.7211121
                  ],
                  [
                        100.4771918,
                        13.7211088
                  ],
                  [
                        100.4771832,
                        13.7211072
                  ],
                  [
                        100.4770243,
                        13.7210776
                  ],
                  [
                        100.4769924,
                        13.7210694
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-09",
            "name": "โครงการ 09 (H)",
            "sectionNumber": "09",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#d97706",
            "stallsAvailable": 10,
            "totalStalls": 10,
            "realAreaSqm": 28,
            "centroid": [
                  100.4770365,
                  13.7214746
            ],
            "coordinates": [
                  [
                        100.4769172,
                        13.7214607
                  ],
                  [
                        100.4769198,
                        13.7214474
                  ],
                  [
                        100.4769526,
                        13.7214507
                  ],
                  [
                        100.4769612,
                        13.7214523
                  ],
                  [
                        100.4771201,
                        13.7214819
                  ],
                  [
                        100.477152,
                        13.7214901
                  ],
                  [
                        100.4771494,
                        13.7215034
                  ],
                  [
                        100.4771221,
                        13.7214984
                  ],
                  [
                        100.4770654,
                        13.721488
                  ],
                  [
                        100.4769445,
                        13.7214658
                  ],
                  [
                        100.4769309,
                        13.7214633
                  ],
                  [
                        100.4769172,
                        13.7214607
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "rat-10",
            "name": "โครงการ 10 (โซนหลัก)",
            "sectionNumber": "10",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#6366f1",
            "stallsAvailable": 9,
            "totalStalls": 9,
            "realAreaSqm": 1879,
            "centroid": [
                  100.4772014,
                  13.7207497
            ],
            "coordinates": [
                  [
                        100.4767585,
                        13.722172
                  ],
                  [
                        100.4768317,
                        13.7217974
                  ],
                  [
                        100.4771117,
                        13.7203995
                  ],
                  [
                        100.4771726,
                        13.7201647
                  ],
                  [
                        100.4772466,
                        13.7201777
                  ],
                  [
                        100.4773396,
                        13.7201952
                  ],
                  [
                        100.4774193,
                        13.720211
                  ],
                  [
                        100.4771618,
                        13.7221605
                  ],
                  [
                        100.4771437,
                        13.7222428
                  ],
                  [
                        100.4770447,
                        13.7222249
                  ],
                  [
                        100.4767585,
                        13.722172
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '11': {
    id: 11,
    slug: 'thonburi-sanamluang-2',
    name: 'ตลาดธนบุรี (สนามหลวง 2)',
    district: 'เขตทวีวัฒนา',
    center: [100.3528837, 13.7469945],
    overviewZoom: 17.2,
    bearing: 0,
    pitch: 35,
    description: 'ตลาดนัดครบวงจรขนาดใหญ่ 11 โซน ครอบคลุมไม้ดอกไม้ประดับ สัตว์เลี้ยง ปลาสวยงาม พระเครื่อง และศูนย์อาหาร',
    projects: [
      {
            "id": "tho-01",
            "name": "โครงการ 01 (4)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 824,
            "totalStalls": 824,
            "realAreaSqm": 3296,
            "centroid": [
                  100.3515886,
                  13.7468379
            ],
            "coordinates": [
                  [
                        100.351328,
                        13.7467742
                  ],
                  [
                        100.3513298,
                        13.7467061
                  ],
                  [
                        100.3513309,
                        13.7466713
                  ],
                  [
                        100.3513339,
                        13.7466067
                  ],
                  [
                        100.3513409,
                        13.7464867
                  ],
                  [
                        100.3513508,
                        13.7463632
                  ],
                  [
                        100.3513515,
                        13.7463632
                  ],
                  [
                        100.3513693,
                        13.7463637
                  ],
                  [
                        100.3514062,
                        13.7463648
                  ],
                  [
                        100.3515357,
                        13.7463687
                  ],
                  [
                        100.3517938,
                        13.7463765
                  ],
                  [
                        100.3518129,
                        13.7463771
                  ],
                  [
                        100.3518314,
                        13.7463777
                  ],
                  [
                        100.3518314,
                        13.7463784
                  ],
                  [
                        100.351827,
                        13.7468104
                  ],
                  [
                        100.3518259,
                        13.7468452
                  ],
                  [
                        100.3518242,
                        13.7468954
                  ],
                  [
                        100.3517743,
                        13.7474991
                  ],
                  [
                        100.3517742,
                        13.7474997
                  ],
                  [
                        100.3517736,
                        13.7474997
                  ],
                  [
                        100.3517558,
                        13.7474992
                  ],
                  [
                        100.3517188,
                        13.7474981
                  ],
                  [
                        100.3516119,
                        13.7474238
                  ],
                  [
                        100.3515419,
                        13.7473469
                  ],
                  [
                        100.3514352,
                        13.747198
                  ],
                  [
                        100.3513664,
                        13.7470818
                  ],
                  [
                        100.3513487,
                        13.7470326
                  ],
                  [
                        100.3513322,
                        13.7469822
                  ],
                  [
                        100.351328,
                        13.7467749
                  ],
                  [
                        100.351328,
                        13.7467742
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-02",
            "name": "โครงการ 02 (3)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 626,
            "totalStalls": 626,
            "realAreaSqm": 2634,
            "centroid": [
                  100.3520716,
                  13.7469659
            ],
            "coordinates": [
                  [
                        100.3518082,
                        13.7474996
                  ],
                  [
                        100.3518087,
                        13.7474822
                  ],
                  [
                        100.3518093,
                        13.7474641
                  ],
                  [
                        100.3518313,
                        13.7469078
                  ],
                  [
                        100.3518555,
                        13.7465011
                  ],
                  [
                        100.3518653,
                        13.7463782
                  ],
                  [
                        100.351866,
                        13.7463782
                  ],
                  [
                        100.351903,
                        13.7463793
                  ],
                  [
                        100.3520125,
                        13.7463826
                  ],
                  [
                        100.3520687,
                        13.7463843
                  ],
                  [
                        100.3521248,
                        13.746386
                  ],
                  [
                        100.3521611,
                        13.7463871
                  ],
                  [
                        100.3533754,
                        13.7468489
                  ],
                  [
                        100.3533754,
                        13.7468498
                  ],
                  [
                        100.3533748,
                        13.7468841
                  ],
                  [
                        100.3533699,
                        13.7471408
                  ],
                  [
                        100.3533695,
                        13.747158
                  ],
                  [
                        100.3520999,
                        13.7475839
                  ],
                  [
                        100.3520992,
                        13.7475839
                  ],
                  [
                        100.3519144,
                        13.7475783
                  ],
                  [
                        100.3518781,
                        13.7475772
                  ],
                  [
                        100.3518082,
                        13.7475003
                  ],
                  [
                        100.3518082,
                        13.7474996
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-03",
            "name": "โครงการ 03 (1)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 620,
            "totalStalls": 620,
            "realAreaSqm": 2480,
            "centroid": [
                  100.3527823,
                  13.7469199
            ],
            "coordinates": [
                  [
                        100.3525339,
                        13.7475312
                  ],
                  [
                        100.3525358,
                        13.7474645
                  ],
                  [
                        100.3525363,
                        13.7474471
                  ],
                  [
                        100.3525369,
                        13.747429
                  ],
                  [
                        100.3525451,
                        13.7472185
                  ],
                  [
                        100.3525542,
                        13.7470691
                  ],
                  [
                        100.3525949,
                        13.7464435
                  ],
                  [
                        100.3525956,
                        13.7464435
                  ],
                  [
                        100.3526312,
                        13.7464445
                  ],
                  [
                        100.3528167,
                        13.7464501
                  ],
                  [
                        100.3530386,
                        13.7464568
                  ],
                  [
                        100.3530749,
                        13.7464579
                  ],
                  [
                        100.3530755,
                        13.746458
                  ],
                  [
                        100.3530755,
                        13.7464586
                  ],
                  [
                        100.353075,
                        13.746476
                  ],
                  [
                        100.3530744,
                        13.7464941
                  ],
                  [
                        100.3530566,
                        13.7469057
                  ],
                  [
                        100.3530501,
                        13.7469785
                  ],
                  [
                        100.3529783,
                        13.7471181
                  ],
                  [
                        100.3528952,
                        13.7472652
                  ],
                  [
                        100.352839,
                        13.7473339
                  ],
                  [
                        100.3527801,
                        13.7474058
                  ],
                  [
                        100.3527021,
                        13.7474702
                  ],
                  [
                        100.3525894,
                        13.7475328
                  ],
                  [
                        100.3525702,
                        13.7475323
                  ],
                  [
                        100.3525339,
                        13.7475312
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-04",
            "name": "โครงการ 04 (11)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 520,
            "totalStalls": 520,
            "realAreaSqm": 2080,
            "centroid": [
                  100.3512607,
                  13.7475913
            ],
            "coordinates": [
                  [
                        100.3510257,
                        13.7478349
                  ],
                  [
                        100.3510263,
                        13.7478175
                  ],
                  [
                        100.3510276,
                        13.7477813
                  ],
                  [
                        100.3510315,
                        13.7476729
                  ],
                  [
                        100.3510328,
                        13.7476368
                  ],
                  [
                        100.3510348,
                        13.7475819
                  ],
                  [
                        100.3510361,
                        13.7475464
                  ],
                  [
                        100.3510622,
                        13.7468911
                  ],
                  [
                        100.3510629,
                        13.7468911
                  ],
                  [
                        100.3510985,
                        13.7468923
                  ],
                  [
                        100.3510992,
                        13.7468924
                  ],
                  [
                        100.3515655,
                        13.7476299
                  ],
                  [
                        100.3515655,
                        13.7476306
                  ],
                  [
                        100.3515643,
                        13.7476654
                  ],
                  [
                        100.351563,
                        13.7477015
                  ],
                  [
                        100.3515584,
                        13.7478286
                  ],
                  [
                        100.3515491,
                        13.7480695
                  ],
                  [
                        100.351549,
                        13.7480702
                  ],
                  [
                        100.3515483,
                        13.7480702
                  ],
                  [
                        100.3515305,
                        13.7480696
                  ],
                  [
                        100.3515128,
                        13.748069
                  ],
                  [
                        100.35145,
                        13.7480644
                  ],
                  [
                        100.3513815,
                        13.748044
                  ],
                  [
                        100.3510257,
                        13.7478355
                  ],
                  [
                        100.3510257,
                        13.7478349
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-05",
            "name": "โครงการ 05 (2)",
            "sectionNumber": "05",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#8b5cf6",
            "stallsAvailable": 464,
            "totalStalls": 464,
            "realAreaSqm": 1856,
            "centroid": [
                  100.3523767,
                  13.7470552
            ],
            "coordinates": [
                  [
                        100.3521928,
                        13.7475897
                  ],
                  [
                        100.3521939,
                        13.7475542
                  ],
                  [
                        100.3521987,
                        13.7474184
                  ],
                  [
                        100.3522069,
                        13.7472079
                  ],
                  [
                        100.352216,
                        13.7470585
                  ],
                  [
                        100.3522907,
                        13.7464359
                  ],
                  [
                        100.3522914,
                        13.7464359
                  ],
                  [
                        100.3524571,
                        13.7464409
                  ],
                  [
                        100.3525133,
                        13.7464426
                  ],
                  [
                        100.3525495,
                        13.7464437
                  ],
                  [
                        100.3525495,
                        13.7464444
                  ],
                  [
                        100.352549,
                        13.7464618
                  ],
                  [
                        100.3525484,
                        13.7464799
                  ],
                  [
                        100.3525317,
                        13.7468883
                  ],
                  [
                        100.3524915,
                        13.7475295
                  ],
                  [
                        100.3524146,
                        13.7475971
                  ],
                  [
                        100.3524139,
                        13.7475971
                  ],
                  [
                        100.3523769,
                        13.747596
                  ],
                  [
                        100.3522482,
                        13.7475921
                  ],
                  [
                        100.3521928,
                        13.7475904
                  ],
                  [
                        100.3521928,
                        13.7475897
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-06",
            "name": "โครงการ 06 (6)",
            "sectionNumber": "06",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#06b6d4",
            "stallsAvailable": 332,
            "totalStalls": 332,
            "realAreaSqm": 1328,
            "centroid": [
                  100.3530467,
                  13.7477224
            ],
            "coordinates": [
                  [
                        100.3525266,
                        13.7478504
                  ],
                  [
                        100.3525272,
                        13.7478323
                  ],
                  [
                        100.3525278,
                        13.7478149
                  ],
                  [
                        100.3525285,
                        13.7477962
                  ],
                  [
                        100.3529078,
                        13.7475364
                  ],
                  [
                        100.3529448,
                        13.7475376
                  ],
                  [
                        100.3530183,
                        13.7475401
                  ],
                  [
                        100.3531662,
                        13.7475452
                  ],
                  [
                        100.3533133,
                        13.7475508
                  ],
                  [
                        100.3533876,
                        13.747554
                  ],
                  [
                        100.3533876,
                        13.7475547
                  ],
                  [
                        100.3533828,
                        13.7476993
                  ],
                  [
                        100.3533804,
                        13.7477715
                  ],
                  [
                        100.3533768,
                        13.7478793
                  ],
                  [
                        100.3533761,
                        13.7478793
                  ],
                  [
                        100.3532282,
                        13.7478749
                  ],
                  [
                        100.3531919,
                        13.7478737
                  ],
                  [
                        100.3525266,
                        13.7478504
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-07",
            "name": "โครงการ 07 (7)",
            "sectionNumber": "07",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#e11d48",
            "stallsAvailable": 252,
            "totalStalls": 252,
            "realAreaSqm": 1008,
            "centroid": [
                  100.3530438,
                  13.7481403
            ],
            "coordinates": [
                  [
                        100.3528656,
                        13.7483659
                  ],
                  [
                        100.3528762,
                        13.7481495
                  ],
                  [
                        100.3528781,
                        13.7481134
                  ],
                  [
                        100.3528848,
                        13.7479869
                  ],
                  [
                        100.3528896,
                        13.747898
                  ],
                  [
                        100.3528897,
                        13.7478974
                  ],
                  [
                        100.3528904,
                        13.7478974
                  ],
                  [
                        100.3529266,
                        13.7478992
                  ],
                  [
                        100.3530381,
                        13.7479049
                  ],
                  [
                        100.3531476,
                        13.7479105
                  ],
                  [
                        100.3532215,
                        13.7479143
                  ],
                  [
                        100.3532222,
                        13.7479144
                  ],
                  [
                        100.3532149,
                        13.7480593
                  ],
                  [
                        100.3532,
                        13.7483482
                  ],
                  [
                        100.3531991,
                        13.7483656
                  ],
                  [
                        100.3531981,
                        13.7483836
                  ],
                  [
                        100.3531974,
                        13.7483836
                  ],
                  [
                        100.3531618,
                        13.7483818
                  ],
                  [
                        100.3530873,
                        13.748378
                  ],
                  [
                        100.3529388,
                        13.7483704
                  ],
                  [
                        100.3528841,
                        13.7483676
                  ],
                  [
                        100.3528656,
                        13.7483666
                  ],
                  [
                        100.3528656,
                        13.7483659
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-08",
            "name": "โครงการ 08 (8)",
            "sectionNumber": "08",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#84cc16",
            "stallsAvailable": 228,
            "totalStalls": 228,
            "realAreaSqm": 912,
            "centroid": [
                  100.3526673,
                  13.7480853
            ],
            "coordinates": [
                  [
                        100.352481,
                        13.7482752
                  ],
                  [
                        100.3524959,
                        13.7479858
                  ],
                  [
                        100.3524978,
                        13.7479503
                  ],
                  [
                        100.3525025,
                        13.7478782
                  ],
                  [
                        100.3525032,
                        13.7478782
                  ],
                  [
                        100.3525764,
                        13.7478819
                  ],
                  [
                        100.3528165,
                        13.7478942
                  ],
                  [
                        100.3528534,
                        13.7478961
                  ],
                  [
                        100.3528534,
                        13.7478968
                  ],
                  [
                        100.3528525,
                        13.7479142
                  ],
                  [
                        100.352832,
                        13.7482932
                  ],
                  [
                        100.3526657,
                        13.7482847
                  ],
                  [
                        100.3525173,
                        13.7482771
                  ],
                  [
                        100.352481,
                        13.7482752
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-09",
            "name": "โครงการ 09 (โซนหลัก)",
            "sectionNumber": "09",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#d97706",
            "stallsAvailable": 207,
            "totalStalls": 207,
            "realAreaSqm": 4142,
            "centroid": [
                  100.3517208,
                  13.747544
            ],
            "coordinates": [
                  [
                        100.3510655,
                        13.7468564
                  ],
                  [
                        100.3510667,
                        13.746821
                  ],
                  [
                        100.3510719,
                        13.7466771
                  ],
                  [
                        100.3510739,
                        13.7466222
                  ],
                  [
                        100.351084,
                        13.7463983
                  ],
                  [
                        100.353555,
                        13.7457271
                  ],
                  [
                        100.3542942,
                        13.7456054
                  ],
                  [
                        100.354627,
                        13.7456115
                  ],
                  [
                        100.3547417,
                        13.7457287
                  ],
                  [
                        100.3547382,
                        13.7459094
                  ],
                  [
                        100.3533153,
                        13.7483788
                  ],
                  [
                        100.3532228,
                        13.7483771
                  ],
                  [
                        100.3517547,
                        13.7481397
                  ],
                  [
                        100.3510655,
                        13.7468571
                  ],
                  [
                        100.3510655,
                        13.7468564
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-10",
            "name": "โครงการ 10 (5)",
            "sectionNumber": "10",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#6366f1",
            "stallsAvailable": 162,
            "totalStalls": 162,
            "realAreaSqm": 648,
            "centroid": [
                  100.3532376,
                  13.7473514
            ],
            "coordinates": [
                  [
                        100.3530006,
                        13.7474595
                  ],
                  [
                        100.353001,
                        13.7474421
                  ],
                  [
                        100.3530015,
                        13.747424
                  ],
                  [
                        100.3531778,
                        13.7472014
                  ],
                  [
                        100.3531785,
                        13.7472014
                  ],
                  [
                        100.3531963,
                        13.7472018
                  ],
                  [
                        100.353325,
                        13.747205
                  ],
                  [
                        100.3533812,
                        13.7472064
                  ],
                  [
                        100.3533997,
                        13.7472069
                  ],
                  [
                        100.3533997,
                        13.7472076
                  ],
                  [
                        100.3533988,
                        13.7472424
                  ],
                  [
                        100.3533889,
                        13.7474691
                  ],
                  [
                        100.3533888,
                        13.7474698
                  ],
                  [
                        100.3533881,
                        13.7474698
                  ],
                  [
                        100.3533703,
                        13.7474694
                  ],
                  [
                        100.3531492,
                        13.7474639
                  ],
                  [
                        100.3530006,
                        13.7474602
                  ],
                  [
                        100.3530006,
                        13.7474595
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-11",
            "name": "โครงการ 11 (9)",
            "sectionNumber": "11",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#14b8a6",
            "stallsAvailable": 160,
            "totalStalls": 160,
            "realAreaSqm": 640,
            "centroid": [
                  100.3523088,
                  13.7480311
            ],
            "coordinates": [
                  [
                        100.3521521,
                        13.7481862
                  ],
                  [
                        100.352154,
                        13.7481508
                  ],
                  [
                        100.3521686,
                        13.747879
                  ],
                  [
                        100.3521696,
                        13.747861
                  ],
                  [
                        100.3521703,
                        13.747861
                  ],
                  [
                        100.3522065,
                        13.7478628
                  ],
                  [
                        100.3523906,
                        13.7478722
                  ],
                  [
                        100.3524644,
                        13.747876
                  ],
                  [
                        100.3524651,
                        13.7478761
                  ],
                  [
                        100.3524651,
                        13.7478767
                  ],
                  [
                        100.3524615,
                        13.7479493
                  ],
                  [
                        100.352452,
                        13.7481288
                  ],
                  [
                        100.3524477,
                        13.7482013
                  ],
                  [
                        100.352447,
                        13.7482013
                  ],
                  [
                        100.3524107,
                        13.7481995
                  ],
                  [
                        100.3522075,
                        13.7481891
                  ],
                  [
                        100.3521528,
                        13.7481863
                  ],
                  [
                        100.3521521,
                        13.7481862
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-12",
            "name": "โครงการ 12 (1-2)",
            "sectionNumber": "12",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f97316",
            "stallsAvailable": 40,
            "totalStalls": 40,
            "realAreaSqm": 304,
            "centroid": [
                  100.3516529,
                  13.7479329
            ],
            "coordinates": [
                  [
                        100.3515844,
                        13.7481012
                  ],
                  [
                        100.351585,
                        13.7480669
                  ],
                  [
                        100.3515853,
                        13.7480506
                  ],
                  [
                        100.3515863,
                        13.7479982
                  ],
                  [
                        100.3515899,
                        13.7478102
                  ],
                  [
                        100.3515909,
                        13.7477587
                  ],
                  [
                        100.3515919,
                        13.7477587
                  ],
                  [
                        100.3516279,
                        13.7477593
                  ],
                  [
                        100.3517255,
                        13.7477639
                  ],
                  [
                        100.3517255,
                        13.7477648
                  ],
                  [
                        100.3517249,
                        13.7477992
                  ],
                  [
                        100.3517203,
                        13.7480396
                  ],
                  [
                        100.351719,
                        13.7481074
                  ],
                  [
                        100.351718,
                        13.7481074
                  ],
                  [
                        100.351682,
                        13.7481067
                  ],
                  [
                        100.3515844,
                        13.7481021
                  ],
                  [
                        100.3515844,
                        13.7481012
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "tho-13",
            "name": "โครงการ 13 (ด้านนอก)",
            "sectionNumber": "13",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#a855f7",
            "stallsAvailable": 35,
            "totalStalls": 35,
            "realAreaSqm": 348,
            "centroid": [
                  100.3533628,
                  13.7466483
            ],
            "coordinates": [
                  [
                        100.3532848,
                        13.7467966
                  ],
                  [
                        100.3532854,
                        13.7467622
                  ],
                  [
                        100.3532858,
                        13.7467412
                  ],
                  [
                        100.353288,
                        13.7466266
                  ],
                  [
                        100.3532907,
                        13.7464875
                  ],
                  [
                        100.3532914,
                        13.746454
                  ],
                  [
                        100.3532923,
                        13.746454
                  ],
                  [
                        100.3534014,
                        13.746456
                  ],
                  [
                        100.3534393,
                        13.7464567
                  ],
                  [
                        100.3534393,
                        13.7464576
                  ],
                  [
                        100.3534387,
                        13.7464902
                  ],
                  [
                        100.3534347,
                        13.7466981
                  ],
                  [
                        100.3534334,
                        13.7467649
                  ],
                  [
                        100.3534327,
                        13.7468002
                  ],
                  [
                        100.3534318,
                        13.7468002
                  ],
                  [
                        100.3533217,
                        13.7467982
                  ],
                  [
                        100.3532848,
                        13.7467975
                  ],
                  [
                        100.3532848,
                        13.7467966
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  },
  '12': {
    id: 12,
    slug: 'bang-khae-phirom',
    name: 'ตลาดบางแคภิรมย์',
    district: 'เขตบางแค',
    center: [100.3836051, 13.6863954],
    overviewZoom: 18.4,
    bearing: 0,
    pitch: 35,
    description: 'ตลาดแห่งใหม่ในสวนสาธารณะบางแคภิรมย์ อาคารโปร่งสบาย 6 โซนสินค้าครบครัน',
    projects: [
      {
            "id": "ban-01",
            "name": "โครงการ 01 (5 เบ็ดเตล็ด)",
            "sectionNumber": "01",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#2563eb",
            "stallsAvailable": 144,
            "totalStalls": 144,
            "realAreaSqm": 662,
            "centroid": [
                  100.3835329,
                  13.6865499
            ],
            "coordinates": [
                  [
                        100.3833347,
                        13.6865864
                  ],
                  [
                        100.3833435,
                        13.6865675
                  ],
                  [
                        100.3833604,
                        13.6865313
                  ],
                  [
                        100.3834307,
                        13.6863809
                  ],
                  [
                        100.3834817,
                        13.6864036
                  ],
                  [
                        100.3836662,
                        13.686486
                  ],
                  [
                        100.3836841,
                        13.686494
                  ],
                  [
                        100.3837335,
                        13.6865161
                  ],
                  [
                        100.3836632,
                        13.6866666
                  ],
                  [
                        100.3836463,
                        13.6867027
                  ],
                  [
                        100.3836374,
                        13.6867217
                  ],
                  [
                        100.3833683,
                        13.6866015
                  ],
                  [
                        100.3833347,
                        13.6865864
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-02",
            "name": "โครงการ 02 (4 เบ็ดเตล็ด)",
            "sectionNumber": "02",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#10b981",
            "stallsAvailable": 106,
            "totalStalls": 106,
            "realAreaSqm": 442,
            "centroid": [
                  100.383236,
                  13.6864314
            ],
            "coordinates": [
                  [
                        100.3830824,
                        13.6864737
                  ],
                  [
                        100.3830912,
                        13.6864548
                  ],
                  [
                        100.383135,
                        13.6863611
                  ],
                  [
                        100.3831696,
                        13.6862871
                  ],
                  [
                        100.3831785,
                        13.6862682
                  ],
                  [
                        100.3832279,
                        13.6862902
                  ],
                  [
                        100.3833803,
                        13.6863583
                  ],
                  [
                        100.3833022,
                        13.686527
                  ],
                  [
                        100.3832842,
                        13.6865639
                  ],
                  [
                        100.3832674,
                        13.6865564
                  ],
                  [
                        100.383133,
                        13.6864964
                  ],
                  [
                        100.383116,
                        13.6864888
                  ],
                  [
                        100.3830824,
                        13.6864737
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-03",
            "name": "โครงการ 03 (3 อาหารสำเร็จรูป)",
            "sectionNumber": "03",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#f59e0b",
            "stallsAvailable": 96,
            "totalStalls": 96,
            "realAreaSqm": 442,
            "centroid": [
                  100.3833732,
                  13.6861105
            ],
            "coordinates": [
                  [
                        100.3832246,
                        13.6861695
                  ],
                  [
                        100.3832334,
                        13.6861506
                  ],
                  [
                        100.3832422,
                        13.6861317
                  ],
                  [
                        100.3832591,
                        13.6860955
                  ],
                  [
                        100.3833029,
                        13.6860018
                  ],
                  [
                        100.3833206,
                        13.685964
                  ],
                  [
                        100.38337,
                        13.685986
                  ],
                  [
                        100.3834383,
                        13.6860165
                  ],
                  [
                        100.3835224,
                        13.6860541
                  ],
                  [
                        100.3835136,
                        13.686073
                  ],
                  [
                        100.3834967,
                        13.6861092
                  ],
                  [
                        100.3834698,
                        13.6861668
                  ],
                  [
                        100.3834264,
                        13.6862597
                  ],
                  [
                        100.3834096,
                        13.6862522
                  ],
                  [
                        100.3832918,
                        13.6861996
                  ],
                  [
                        100.3832246,
                        13.6861695
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-04",
            "name": "โครงการ 04 (6 เนื้อสัตว์ อาหารทะเล)",
            "sectionNumber": "04",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#ec4899",
            "stallsAvailable": 94,
            "totalStalls": 94,
            "realAreaSqm": 432,
            "centroid": [
                  100.3838347,
                  13.6866866
            ],
            "coordinates": [
                  [
                        100.3836879,
                        13.6867442
                  ],
                  [
                        100.3837055,
                        13.6867064
                  ],
                  [
                        100.3837224,
                        13.6866702
                  ],
                  [
                        100.3837493,
                        13.6866126
                  ],
                  [
                        100.3837839,
                        13.6865386
                  ],
                  [
                        100.3838007,
                        13.6865461
                  ],
                  [
                        100.3838838,
                        13.6865832
                  ],
                  [
                        100.3839353,
                        13.6866062
                  ],
                  [
                        100.3839847,
                        13.6866283
                  ],
                  [
                        100.3839857,
                        13.6866288
                  ],
                  [
                        100.3839853,
                        13.6866298
                  ],
                  [
                        100.3839512,
                        13.6867028
                  ],
                  [
                        100.3839243,
                        13.6867603
                  ],
                  [
                        100.3839154,
                        13.6867793
                  ],
                  [
                        100.3838729,
                        13.6868268
                  ],
                  [
                        100.3838403,
                        13.6868123
                  ],
                  [
                        100.383772,
                        13.6867818
                  ],
                  [
                        100.3836879,
                        13.6867442
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-05",
            "name": "โครงการ 05 (1 ผัก-ผลไม้)",
            "sectionNumber": "05",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#8b5cf6",
            "stallsAvailable": 94,
            "totalStalls": 94,
            "realAreaSqm": 432,
            "centroid": [
                  100.3839769,
                  13.6863804
            ],
            "coordinates": [
                  [
                        100.38383,
                        13.68644
                  ],
                  [
                        100.3838388,
                        13.6864211
                  ],
                  [
                        100.3838826,
                        13.6863273
                  ],
                  [
                        100.3839172,
                        13.6862533
                  ],
                  [
                        100.3839261,
                        13.6862344
                  ],
                  [
                        100.3839597,
                        13.6862494
                  ],
                  [
                        100.3839765,
                        13.6862569
                  ],
                  [
                        100.3841111,
                        13.686317
                  ],
                  [
                        100.3841279,
                        13.6863246
                  ],
                  [
                        100.3840845,
                        13.6864175
                  ],
                  [
                        100.3840576,
                        13.686475
                  ],
                  [
                        100.384015,
                        13.6865226
                  ],
                  [
                        100.3839477,
                        13.6864926
                  ],
                  [
                        100.38383,
                        13.68644
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      },
      {
            "id": "ban-06",
            "name": "โครงการ 06 (2 อาหารปรุงและอาหารสำเร็จรูป)",
            "sectionNumber": "06",
            "category": "สินค้าทั่วไป อาหาร และบริการ",
            "color": "#06b6d4",
            "stallsAvailable": 90,
            "totalStalls": 90,
            "realAreaSqm": 497,
            "centroid": [
                  100.3836655,
                  13.6862687
            ],
            "coordinates": [
                  [
                        100.3834768,
                        13.6862822
                  ],
                  [
                        100.3835202,
                        13.6861893
                  ],
                  [
                        100.383564,
                        13.6860956
                  ],
                  [
                        100.3835729,
                        13.6860766
                  ],
                  [
                        100.3836244,
                        13.6860996
                  ],
                  [
                        100.383842,
                        13.6861968
                  ],
                  [
                        100.3838756,
                        13.6862119
                  ],
                  [
                        100.3838668,
                        13.6862308
                  ],
                  [
                        100.3837798,
                        13.686417
                  ],
                  [
                        100.3837796,
                        13.6864174
                  ],
                  [
                        100.3837785,
                        13.686417
                  ],
                  [
                        100.3836786,
                        13.6863724
                  ],
                  [
                        100.3835441,
                        13.6863123
                  ],
                  [
                        100.3834768,
                        13.6862822
                  ]
            ],
            "floors": [
                  {
                        "id": "1",
                        "name": "ชั้น 1",
                        "shortLabel": "1F",
                        "level": 1
                  }
            ]
      }
]
  }
}

export function getMarketGisConfig(marketIdOrSlug?: string | number | null): MarketGisConfig {
  const fallback = BMA_MARKETS_MASTER['1']!
  if (!marketIdOrSlug) return fallback
  const key = String(marketIdOrSlug).trim()

  // Match by direct ID
  if (BMA_MARKETS_MASTER[key]) return BMA_MARKETS_MASTER[key]!

  // Match by slug
  const match = Object.values(BMA_MARKETS_MASTER).find(
    m => m.slug.toLowerCase() === key.toLowerCase() || m.name === key
  )
  return match || fallback
}
