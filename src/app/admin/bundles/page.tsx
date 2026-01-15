"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import {
  Layers,
  Search,
  Loader2,
  Trash2,
  Edit,
  Save,
  X,
  Globe,
  Package,
  Check,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface BundleData {
  _id: Id<"countries">;
  code: string;
  name: string;
  customName?: string;
  description?: string;
  includedCountries?: string[];
  minPrice?: number;
  packageCount: number;
}

function BundleEditModal({
  bundle,
  onClose,
  onSave,
}: {
  bundle: BundleData;
  onClose: () => void;
  onSave: (data: {
    customName: string;
    description: string;
    includedCountries: string[];
  }) => void;
}) {
  const [customName, setCustomName] = useState(bundle.customName || bundle.name);
  const [description, setDescription] = useState(bundle.description || "");
  const [countriesText, setCountriesText] = useState(
    bundle.includedCountries?.join("\n") || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const countries = countriesText
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    await onSave({ customName, description, includedCountries: countries });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--simlak-orange)]/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[var(--simlak-orange)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Bundle Details</h2>
              <p className="text-sm text-muted-foreground font-mono">{bundle.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this bundle includes and its benefits..."
              rows={3}
              className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none resize-none"
            />
          </div>

          {/* Included Countries */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Included Countries
            </label>
            <textarea
              value={countriesText}
              onChange={(e) => setCountriesText(e.target.value)}
              placeholder="Enter one country per line, e.g.:
Germany
France
Italy
Spain
..."
              rows={10}
              className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter each country name on a new line. These will be displayed to customers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--simlak-orange)] text-white text-sm font-medium hover:bg-[var(--simlak-coral)] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineNameEditor({
  bundleId,
  currentName,
  code,
  onSave,
}: {
  bundleId: Id<"countries">;
  currentName: string;
  code: string;
  onSave: (bundleId: Id<"countries">, name: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave(bundleId, name.trim());
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(currentName);
    setIsEditing(false);
  };

  const needsName = !currentName || currentName === code || currentName.includes(",") || currentName.includes("_");

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 bg-muted rounded-lg border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none text-sm"
          placeholder="Enter bundle name..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="p-2 rounded-lg bg-[var(--simlak-teal)] text-white hover:bg-[var(--simlak-teal)]/80 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold text-lg ${needsName ? "text-red-500" : ""}`}>
        {currentName || code}
      </span>
      {needsName && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Needs name
        </span>
      )}
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title="Edit name"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AdminBundlesPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [editingBundle, setEditingBundle] = useState<BundleData | null>(null);

  const bundles = useQuery(
    api.admin.getAllBundles,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateBundle = useMutation(api.admin.updateBundle);
  const deleteBundle = useMutation(api.admin.deleteBundle);

  const handleSaveName = async (bundleId: Id<"countries">, name: string) => {
    if (!user?.id) return;
    await updateBundle({
      clerkId: user.id,
      bundleId,
      customName: name,
    });
  };

  const handleSaveDetails = async (data: {
    customName: string;
    description: string;
    includedCountries: string[];
  }) => {
    if (!user?.id || !editingBundle) return;

    await updateBundle({
      clerkId: user.id,
      bundleId: editingBundle._id,
      customName: data.customName,
      description: data.description,
      includedCountries: data.includedCountries,
    });

    setEditingBundle(null);
  };

  const handleDelete = async (bundleId: Id<"countries">, bundleName: string) => {
    if (!user?.id) return;
    if (
      !confirm(
        `Are you sure you want to delete "${bundleName}"? This will also delete all packages in this bundle.`
      )
    )
      return;

    await deleteBundle({ clerkId: user.id, bundleId });
  };

  const filteredBundles = bundles?.filter((bundle) => {
    const displayName = bundle.customName || bundle.name;
    return (
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      bundle.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Count bundles that need names
  const bundlesNeedingNames = bundles?.filter((b) => {
    const name = b.customName || b.name;
    return !name || name === b.code || name.includes(",") || name.includes("_");
  }).length || 0;

  if (!bundles) {
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
          <h1 className="text-3xl font-bold mb-2">Bundles</h1>
          <p className="text-muted-foreground">
            {bundles.length} multi-country bundles
            {bundlesNeedingNames > 0 && (
              <span className="ml-2 text-red-500">
                ({bundlesNeedingNames} need names)
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/packages"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium transition-colors"
        >
          <Package className="w-4 h-4" />
          Manage Packages
        </Link>
      </div>

      {/* Alert for bundles needing names */}
      {bundlesNeedingNames > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">
              {bundlesNeedingNames} bundle{bundlesNeedingNames > 1 ? "s" : ""} need proper names
            </p>
            <p className="text-sm text-red-600 mt-1">
              Click the edit icon next to each bundle to set a friendly display name for customers.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bundles by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
          />
        </div>
      </div>

      {/* Bundles List */}
      <div className="space-y-3">
        {filteredBundles?.map((bundle) => {
          const displayName = bundle.customName || bundle.name;
          const hasDetails = bundle.description || (bundle.includedCountries && bundle.includedCountries.length > 0);

          return (
            <div
              key={bundle._id}
              className="bg-card rounded-2xl border border-border p-5 hover:border-[var(--simlak-orange)]/30 transition-colors"
            >
              <div className="flex flex-col gap-4">
                {/* Top row: Icon, Name Editor, Actions */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--simlak-orange)]/10 flex items-center justify-center shrink-0">
                    <Layers className="w-6 h-6 text-[var(--simlak-orange)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <InlineNameEditor
                      bundleId={bundle._id}
                      currentName={displayName}
                      code={bundle.code}
                      onSave={handleSaveName}
                    />
                    <p className="text-sm font-mono text-muted-foreground mt-1">
                      Code: {bundle.code}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Plans</p>
                      <p className="font-semibold">{bundle.packageCount}</p>
                    </div>
                    {bundle.minPrice && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-semibold text-[var(--simlak-orange)]">
                          {formatPrice(bundle.minPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingBundle(bundle)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors text-sm font-medium"
                      title="Edit description and countries"
                    >
                      <Globe className="w-4 h-4" />
                      {hasDetails ? "Edit Details" : "Add Countries"}
                    </button>
                    <button
                      onClick={() => handleDelete(bundle._id, displayName)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete bundle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom row: Description and Countries preview */}
                {hasDetails && (
                  <div className="ml-16 pl-4 border-l-2 border-border">
                    {bundle.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {bundle.description}
                      </p>
                    )}
                    {bundle.includedCountries && bundle.includedCountries.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Globe className="w-4 h-4 text-[var(--simlak-teal)] shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {bundle.includedCountries.slice(0, 5).join(", ")}
                          {bundle.includedCountries.length > 5 && (
                            <span className="text-[var(--simlak-orange)]">
                              {" "}+{bundle.includedCountries.length - 5} more
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBundles?.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No bundles found</p>
          <p className="text-sm mt-1">
            Bundles are created automatically when you sync packages
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingBundle && (
        <BundleEditModal
          bundle={editingBundle}
          onClose={() => setEditingBundle(null)}
          onSave={handleSaveDetails}
        />
      )}
    </div>
  );
}
