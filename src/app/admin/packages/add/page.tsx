"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Loader2,
  Package,
  Globe,
  Database,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
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

interface PackageData {
  packageCode: string;
  name: string;
  locationCode: string;
  locationName: string;
  price: number;
  retailPrice: number;
  currencyCode: string;
  volume: number;
  duration: number;
  activeType: string;
  description?: string;
}

export default function AdminAddPackagePage() {
  const { user } = useUser();
  const router = useRouter();
  const [packageCode, setPackageCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [customRetailPrice, setCustomRetailPrice] = useState("");

  const fetchPackage = useAction(api.adminActions.fetchPackageFromApi);
  const addPackage = useMutation(api.admin.addPackageManual);

  const handleLookup = async () => {
    if (!user?.id || !packageCode.trim()) return;

    setIsLookingUp(true);
    setError(null);
    setPackageData(null);

    try {
      const data = await fetchPackage({
        clerkId: user.id,
        packageCode: packageCode.trim(),
      });
      setPackageData(data);
      setCustomRetailPrice((data.retailPrice / 100).toFixed(2));
    } catch (err: any) {
      setError(err.message || "Failed to fetch package");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !packageData) return;

    setIsSaving(true);
    setError(null);

    try {
      const retailPrice = Math.round(parseFloat(customRetailPrice) * 100);
      if (isNaN(retailPrice)) {
        throw new Error("Invalid retail price");
      }

      await addPackage({
        clerkId: user.id,
        packageCode: packageData.packageCode,
        name: packageData.name,
        locationCode: packageData.locationCode,
        locationName: packageData.locationName,
        price: packageData.price,
        retailPrice: retailPrice,
        currencyCode: packageData.currencyCode,
        volume: packageData.volume,
        duration: packageData.duration,
        activeType: String(packageData.activeType),
        description: packageData.description,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/packages");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Package Added!</h2>
          <p className="text-muted-foreground mb-4">
            The package has been successfully added to your inventory.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/packages"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Packages
      </Link>

      <h1 className="text-3xl font-bold mb-2">Add Package</h1>
      <p className="text-muted-foreground mb-8">
        Look up a package from eSIM Access by entering its product code.
      </p>

      {/* Lookup Form */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-[var(--simlak-orange)]" />
          Package Lookup
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter package code (e.g., esim_TH_1GB_7D)"
            value={packageCode}
            onChange={(e) => setPackageCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="flex-1 px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
          />
          <button
            onClick={handleLookup}
            disabled={isLookingUp || !packageCode.trim()}
            className="px-6 py-3 bg-[var(--simlak-orange)] text-white rounded-xl font-medium hover:bg-[var(--simlak-coral)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLookingUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Lookup
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter the exact package code from eSIM Access API
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Package Preview */}
      {packageData && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--simlak-teal)]" />
            Package Details
          </h2>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Package Code</p>
                <p className="font-mono font-medium">{packageData.packageCode}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{packageData.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
                <p className="font-medium">{packageData.locationName}</p>
                <p className="text-xs text-muted-foreground">{packageData.locationCode}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Data</p>
                </div>
                <p className="font-medium">{formatBytes(packageData.volume)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <p className="font-medium">{packageData.duration} days</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Wholesale Price</p>
                </div>
                <p className="font-medium">{formatPrice(packageData.price)}</p>
              </div>
            </div>
          </div>

          {/* Custom Retail Price */}
          <div className="border-t border-border pt-6 mb-6">
            <label className="block mb-2">
              <span className="text-sm font-medium">Retail Price (USD)</span>
              <span className="text-xs text-muted-foreground ml-2">
                Suggested: {formatPrice(packageData.retailPrice)} (70% markup)
              </span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                value={customRetailPrice}
                onChange={(e) => setCustomRetailPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Profit margin: {formatPrice(Math.round(parseFloat(customRetailPrice || "0") * 100) - packageData.price)} per sale
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-[var(--simlak-orange)] text-white rounded-xl font-semibold hover:bg-[var(--simlak-coral)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Add Package to Inventory
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
