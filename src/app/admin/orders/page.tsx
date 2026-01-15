"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  ShoppingCart,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Package,
  User,
  Mail,
  Calendar,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "paid", label: "Paid", color: "bg-blue-100 text-blue-600" },
  { value: "processing", label: "Processing", color: "bg-amber-100 text-amber-600" },
  { value: "fulfilled", label: "Fulfilled", color: "bg-green-100 text-green-600" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-600" },
  { value: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-600" },
] as const;

function getStatusStyle(status: string) {
  return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-600";
}

function getStatusIcon(status: string) {
  switch (status) {
    case "fulfilled":
      return CheckCircle2;
    case "failed":
    case "refunded":
      return XCircle;
    case "processing":
      return RefreshCw;
    default:
      return Clock;
  }
}

export default function AdminOrdersPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const orders = useQuery(
    api.admin.getAllOrders,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateStatus = useMutation(api.admin.updateOrderStatus);

  const handleStatusChange = async (orderId: Id<"orders">, newStatus: string) => {
    if (!user?.id) return;
    await updateStatus({
      clerkId: user.id,
      orderId,
      status: newStatus as any,
    });
  };

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!orders) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--simlak-orange)]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by transaction ID, email, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders?.map((order) => {
          const StatusIcon = getStatusIcon(order.status);

          return (
            <div key={order._id} className="bg-card rounded-2xl border border-border p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-mono font-semibold">{order.transactionId}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {order.user?.name || order.user?.email || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {order.customerEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-4 h-4" />
                      {order.esimCount} eSIM{order.esimCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold text-[var(--simlak-orange)]">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="px-3 py-2 bg-muted rounded-lg border-0 text-sm focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Items ({order.items.length})</p>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{item.locationName}</span>
                        <span className="text-muted-foreground">
                          · {item.packageName}
                        </span>
                        {item.quantity > 1 && (
                          <span className="px-2 py-0.5 bg-muted rounded text-xs">
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.orderNo && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    eSIM Access Order: <span className="font-mono">{order.orderNo}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders?.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
