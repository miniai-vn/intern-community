import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

export function GET() {
  return NextResponse.json(swaggerSpec);
}
