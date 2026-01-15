"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import {
  Package,
  Search,
  Loader2,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Database,
  Clock,
  Globe,
} from "lucide-react";
import { useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return gb.toFixed(1) + " GB";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(0) + " MB";
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function AdminPackagesPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Id<"packages"> | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const packages = useQuery(
    api.admin.getAllPackages,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updatePackage = useMutation(api.admin.updatePackage);
  const deletePackage = useMutation(api.admin.deletePackage);
  const syncAllPackages = useAction(api.adminActions.syncAllPackages);

  const handleSync = async () => {
    if (!user?.id || isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncAllPackages({ clerkId: user.id });
      alert(`Successfully synced ${result.synced} packages and ${result.countriesCreated} countries/bundles`);
    } catch (error: any) {
      alert(error.message || "Failed to sync packages");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditPrice = async (packageId: Id<"packages">) => {
    if (!user?.id) return;
    const priceInCents = Math.round(parseFloat(editPrice) * 100);
    if (isNaN(priceInCents)) {
      alert("Invalid price");
      return;
    }

    await updatePackage({
      clerkId: user.id,
      packageId,
      retailPrice: priceInCents,
    });
    setEditingPackage(null);
    setEditPrice("");
  };

  const handleDelete = async (packageId: Id<"packages">) => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this package?")) return;

    await deletePackage({ clerkId: user.id, packageId });
  };

  // Get unique locations for filter
  const locations = packages
    ? [...new Set(packages.map((p) => p.locationName))].sort()
    : [];

  const filteredPackages = packages?.filter((pkg) => {
    const matchesSearch =
      pkg.packageCode.toLowerCase().includes(search.toLowerCase()) ||
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.locationName.toLowerCase().includes(search.toLowerCase());

    const matchesLocation = locationFilter === "all" || pkg.locationName === locationFilter;

    return matchesSearch && matchesLocation;
  });

  if (!packages) {
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
          <h1 className="text-3xl font-bold mb-2">Packages</h1>
          <p className="text-muted-foreground">{packages.length} total packages</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync All"}
          </button>
          <Link
            href="/admin/packages/add"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--simlak-orange)] text-white text-sm font-medium hover:bg-[var(--simlak-coral)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Package
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by code, name, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
            />
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none min-w-[200px]"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Packages List */}
      <div className="space-y-3">
        {filteredPackages?.map((pkg) => (
          <div
            key={pkg._id}
            className="bg-card rounded-2xl border border-border p-4 hover:border-[var(--simlak-orange)]/30 transition-colors overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Package Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--simlak-orange)]/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[var(--simlak-orange)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{pkg.name}</p>
                    <p className="text-xs font-mono text-muted-foreground truncate">{pkg.packageCode}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>{pkg.locationName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Database className="w-4 h-4" />
                  <span>{formatBytes(pkg.volume)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.duration}d</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Wholesale</p>
                  <p className="text-sm">{formatPrice(pkg.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Retail</p>
                  {editingPackage === pkg._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-20 px-2 py-1 bg-muted rounded border-0 text-sm"
                        placeholder="0.00"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditPrice(pkg._id)}
                        className="px-2 py-1 bg-[var(--simlak-teal)] text-white rounded text-xs font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingPackage(null);
                          setEditPrice("");
                        }}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="font-semibold text-[var(--simlak-orange)]">
                      {formatPrice(pkg.retailPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingPackage(pkg._id);
                    setEditPrice((pkg.retailPrice / 100).toFixed(2));
                  }}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                  title="Edit price"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Delete package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>

      {filteredPackages?.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No packages found</p>
        </div>
      )}
    </div>
  );
}
