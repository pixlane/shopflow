/**
 * PATCH /api/payment/config
 *
 * Body (one of):
 *   { action: "setActive", providerId: ProviderId }
 *   { action: "updateConfig", providerId: ProviderId, credentials: {...}, options: {...}, mode, enabled }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  setActiveProvider,
  updateProviderConfig,
  getAdminSnapshot,
} from "@/lib/payment";
import type { ProviderId } from "@/lib/payment";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: "setActive" | "updateConfig";
      providerId: ProviderId;
      credentials?: Record<string, string>;
      options?: Record<string, string | number | boolean>;
      mode?: "test" | "live";
      enabled?: boolean;
      label?: string;
    };

    if (!body.providerId) {
      return NextResponse.json({ error: "providerId required" }, { status: 400 });
    }

    if (body.action === "setActive") {
      setActiveProvider(body.providerId);
    } else if (body.action === "updateConfig") {
      updateProviderConfig(body.providerId, {
        ...(body.credentials !== undefined && { credentials: body.credentials }),
        ...(body.options !== undefined && { options: body.options }),
        ...(body.mode !== undefined && { mode: body.mode }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.label !== undefined && { label: body.label }),
      });
    } else {
      return NextResponse.json({ error: "action must be setActive or updateConfig" }, { status: 400 });
    }

    return NextResponse.json({ data: getAdminSnapshot() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Config update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
