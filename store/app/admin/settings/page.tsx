import { getAdminSnapshot } from "@/lib/payment";
import { SettingsClient } from "@/components/admin/settings-client";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const paymentSnapshot = getAdminSnapshot();
  return <SettingsClient paymentSnapshot={paymentSnapshot} />;
}
