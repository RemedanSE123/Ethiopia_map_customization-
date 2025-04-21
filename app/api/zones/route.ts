import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const regionCodes = searchParams.get("regionCodes")

  if (!regionCodes) {
    return NextResponse.json({ error: "Region codes are required" }, { status: 400 })
  }

  const regionCodesArray = regionCodes.split(",")

  try {
    const result = await query(
      `
      SELECT 
        adm2_en, 
        adm2_pcode, 
        adm1_en, 
        adm1_pcode,
        ST_AsGeoJSON(geom) as geojson
      FROM 
        public.zone
      WHERE 
        adm1_pcode = ANY($1)
      ORDER BY 
        adm2_en ASC
    `,
      [regionCodesArray],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching zones:", error)
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 })
  }
}
