"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Smartphone,
  Search,
  Loader2,
  RefreshCw,
  User,
  Wifi,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
} from "lucide-react";
import { useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusInfo(status: string) {
  switch (status) {
    case "IN_USE":
      return { label: "Active", color: "bg-green-100 text-green-600", icon: Wifi };
    case "GOT_RESOURCE":
      return { label: "Ready", color: "bg-blue-100 text-blue-600", icon: QrCode };
    case "PAID":
      return { label: "Processing", color: "bg-amber-100 text-amber-600", icon: Clock };
    case "USED_UP":
      return { label: "Used Up", color: "bg-gray-100 text-gray-600", icon: Database };
    case "USED_EXPIRED":
    case "UNUSED_EXPIRED":
      return { label: "Expired", color: "bg-gray-100 text-gray-500", icon: Clock };
    case "CANCEL":
      return { label: "Cancelled", color: "bg-red-100 text-red-600", icon: XCircle };
    default:
      return { label: status, color: "bg-gray-100 text-gray-600", icon: Clock };
  }
}

export default function AdminEsimsPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshingIccid, setRefreshingIccid] = useState<string | null>(null);

  const esims = useQuery(
    api.admin.getAllEsims,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const refreshEsim = useAction(api.ordersActions.refreshEsimStatus);

  const handleRefresh = async (iccid: string) => {
    setRefreshingIccid(iccid);
    try {
      await refreshEsim({ iccid });
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshingIccid(null);
    }
  };

  const statuses = ["IN_USE", "GOT_RESOURCE", "PAID", "USED_UP", "USED_EXPIRED", "UNUSED_EXPIRED", "CANCEL"];

  const filteredEsims = esims?.filter((esim) => {
    const matchesSearch =
      esim.iccid.toLowerCase().includes(search.toLowerCase()) ||
      esim.locationName.toLowerCase().includes(search.toLowerCase()) ||
      esim.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      esim.user?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || esim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!esims) {
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
          <h1 className="text-3xl font-bold mb-2">eSIMs</h1>
          <p className="text-muted-foreground">{esims.length} total eSIMs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ICCID, location, or user..."
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
            {statuses.map((status) => (
              <option key={status} value={status}>
                {getStatusInfo(status).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* eSIMs Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">eSIM</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data Usage</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEsims?.map((esim) => {
                const statusInfo = getStatusInfo(esim.status);
                const StatusIcon = statusInfo.icon;
                const usagePercent = esim.dataUsed
                  ? Math.min((esim.dataUsed / esim.dataTotal) * 100, 100)
                  : 0;

                return (
                  <tr key={esim._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{esim.locationName}</p>
                        <p className="text-sm text-muted-foreground">{esim.packageName}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">{esim.iccid}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{esim.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{esim.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{formatBytes(esim.dataUsed || 0)}</span>
                          <span className="text-muted-foreground">{formatBytes(esim.dataTotal)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent > 80 ? "bg-red-500" : "bg-[var(--simlak-teal)]"
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(esim.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRefresh(esim.iccid)}
                          disabled={refreshingIccid === esim.iccid}
                          className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors disabled:opacity-50"
                          title="Refresh status"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshingIccid === esim.iccid ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEsims?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No eSIMs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
