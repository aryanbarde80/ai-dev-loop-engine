import { NextResponse } from "next/server";
import { getEnvironmentStatus } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ai-dev-loop-engine",
    checkedAt: new Date().toISOString(),
    environment: getEnvironmentStatus(),
  });
}
