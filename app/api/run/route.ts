import { NextRequest, NextResponse } from "next/server";
import { runEvolutionCycle } from "@/lib/engine";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${getEnv().cronSecret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runEvolutionCycle("manual");
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown engine failure",
      },
      { status: 500 },
    );
  }
}
