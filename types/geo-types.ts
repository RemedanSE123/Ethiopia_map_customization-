export interface Region {
  gid: number
  adm1_en: string
  adm1_pcode: string
  geojson: string
}

export interface Zone {
  adm2_en: string
  adm2_pcode: string
  adm1_en: string
  adm1_pcode: string
  geojson: string
}

export interface Woreda {
  adm3_en: string
  adm3_pcode: string
  adm2_en: string
  adm2_pcode: string
  adm1_en: string
  adm1_pcode: string
  geojson: string
}

export interface GeoFeature {
  type: string
  properties: {
    name: string
    code: string
    level?: "region" | "zone" | "woreda"
  }
  geometry: any
}
