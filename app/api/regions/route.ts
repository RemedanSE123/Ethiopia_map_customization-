import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        gid, 
        adm1_en, 
        adm1_pcode,
        ST_AsGeoJSON(geom) as geojson
      FROM 
        public.region
      ORDER BY 
        adm1_en ASC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching regions:", error)
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 })
  }
}
