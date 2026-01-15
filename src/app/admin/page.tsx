"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Users,
  ShoppingCart,
  Smartphone,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  Wallet,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: "orange" | "teal" | "green" | "blue";
}) {
  const colors = {
    orange: "icon-container-orange",
    teal: "icon-container-teal",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balance, setBalance] = useState<{ balanceDollars: number } | null>(null);

  const stats = useQuery(
    api.admin.getDashboardStats,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const getBalance = useAction(api.adminActions.getBalance);

  const handleFetchBalance = async () => {
    if (!user?.id) return;
    setIsLoadingBalance(true);
    try {
      const result = await getBalance({ clerkId: user.id });
      setBalance(result);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  if (!stats) {
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
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName || "Admin"}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.recentOrders} this week`}
          icon={ShoppingCart}
          color="orange"
        />
        <StatCard
          title="Active eSIMs"
          value={stats.activeEsims}
          subtitle={`${stats.totalEsims} total`}
          icon={Smartphone}
          color="teal"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          subtitle={`${formatPrice(stats.recentRevenue)} this week`}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-4">Order Status</h2>
          <div className="space-y-3">
            {[
              { status: "Fulfilled", count: stats.ordersByStatus.fulfilled, color: "bg-green-500", icon: CheckCircle2 },
              { status: "Processing", count: stats.ordersByStatus.processing, color: "bg-amber-500", icon: Clock },
              { status: "Paid", count: stats.ordersByStatus.paid, color: "bg-blue-500", icon: Activity },
              { status: "Pending", count: stats.ordersByStatus.pending, color: "bg-gray-400", icon: Clock },
              { status: "Failed", count: stats.ordersByStatus.failed, color: "bg-red-500", icon: XCircle },
              { status: "Refunded", count: stats.ordersByStatus.refunded, color: "bg-purple-500", icon: AlertCircle },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.status}</span>
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* eSIM Access Balance */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">eSIM Access Balance</h2>
            <button
              onClick={handleFetchBalance}
              disabled={isLoadingBalance}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
              {isLoadingBalance ? "Loading..." : "Check Balance"}
            </button>
          </div>

          {balance ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-[var(--simlak-teal)] mx-auto mb-4" />
              <p className="text-4xl font-bold text-[var(--simlak-teal)]">
                ${balance.balanceDollars.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Available Balance</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Click &quot;Check Balance&quot; to view your eSIM Access account balance</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-4">Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted rounded-xl">
            <Package className="w-8 h-8 mx-auto mb-2 text-[var(--simlak-orange)]" />
            <p className="text-2xl font-bold">{stats.totalPackages}</p>
            <p className="text-sm text-muted-foreground">Available Packages</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-xl">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[var(--simlak-teal)]" />
            <p className="text-2xl font-bold">{stats.totalOrders > 0 ? ((stats.ordersByStatus.fulfilled / stats.totalOrders) * 100).toFixed(1) : 0}%</p>
            <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-xl">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.activeEsims}</p>
            <p className="text-sm text-muted-foreground">Active Connections</p>
          </div>
        </div>
      </div>
    </div>
  );
}
