import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getOrderById } from "@/lib/store";
import { formatPrice, formatDateTime, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

export const dynamic = "force-dynamic";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = getOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={15} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold font-mono">{order.orderNumber}</h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <OrderDetailClient order={order} />
    </div>
  );
}
