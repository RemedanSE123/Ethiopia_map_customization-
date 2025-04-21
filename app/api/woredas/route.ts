import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zoneCodes = searchParams.get("zoneCodes")

  if (!zoneCodes) {
    return NextResponse.json({ error: "Zone codes are required" }, { status: 400 })
  }

  const zoneCodesArray = zoneCodes.split(",")

  try {
    const result = await query(
      `
      SELECT 
        adm3_en, 
        adm3_pcode, 
        adm2_en, 
        adm2_pcode, 
        adm1_en, 
        adm1_pcode,
        ST_AsGeoJSON(geom) as geojson
      FROM 
        public.woreda
      WHERE 
        adm2_pcode = ANY($1)
      ORDER BY 
        adm3_en ASC
    `,
      [zoneCodesArray],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching woredas:", error)
    return NextResponse.json({ error: "Failed to fetch woredas" }, { status: 500 })
  }
}
