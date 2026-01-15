"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Globe,
  Search,
  Loader2,
  Star,
  StarOff,
  Plus,
  Trash2,
  X,
  Edit,
  Check,
} from "lucide-react";
import { useState } from "react";

const regions = [
  "Europe",
  "Asia",
  "Americas",
  "Africa",
  "Oceania",
  "Middle East",
  "Other",
];

export default function AdminCountriesPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Id<"countries"> | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    region: "",
    flagEmoji: "",
  });
  const [newCountry, setNewCountry] = useState({
    code: "",
    name: "",
    region: "Europe",
    flagEmoji: "",
    popular: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countries = useQuery(
    api.admin.getAllCountries,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateCountry = useMutation(api.admin.updateCountry);
  const createCountry = useMutation(api.admin.createCountry);
  const deleteCountry = useMutation(api.admin.deleteCountry);

  const handleTogglePopular = async (countryId: Id<"countries">, currentPopular: boolean) => {
    if (!user?.id) return;
    await updateCountry({
      clerkId: user.id,
      countryId,
      popular: !currentPopular,
    });
  };

  const handleStartEdit = (country: any) => {
    setEditingCountry(country._id);
    setEditData({
      name: country.name,
      region: country.region,
      flagEmoji: country.flagEmoji,
    });
  };

  const handleSaveEdit = async (countryId: Id<"countries">) => {
    if (!user?.id) return;
    await updateCountry({
      clerkId: user.id,
      countryId,
      name: editData.name,
      region: editData.region,
      flagEmoji: editData.flagEmoji,
    });
    setEditingCountry(null);
  };

  const handleDelete = async (countryId: Id<"countries">) => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this country?")) return;
    await deleteCountry({ clerkId: user.id, countryId });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!newCountry.code || !newCountry.name || !newCountry.flagEmoji) {
      setError("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createCountry({
        clerkId: user.id,
        code: newCountry.code.toUpperCase(),
        name: newCountry.name,
        region: newCountry.region,
        flagEmoji: newCountry.flagEmoji,
        popular: newCountry.popular,
      });
      setShowAddForm(false);
      setNewCountry({
        code: "",
        name: "",
        region: "Europe",
        flagEmoji: "",
        popular: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create country");
    } finally {
      setIsCreating(false);
    }
  };

  // Get unique regions from existing countries for filter
  const existingRegions = countries
    ? [...new Set(countries.map((c) => c.region))].sort()
    : [];

  const filteredCountries = countries?.filter((country) => {
    const matchesSearch =
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.code.toLowerCase().includes(search.toLowerCase());

    const matchesRegion = regionFilter === "all" || country.region === regionFilter;

    return matchesSearch && matchesRegion;
  });

  // Sort: popular first, then alphabetically
  const sortedCountries = filteredCountries?.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.name.localeCompare(b.name);
  });

  if (!countries) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--simlak-orange)]" />
      </div>
    );
  }

  const popularCount = countries.filter((c) => c.popular).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Countries</h1>
          <p className="text-muted-foreground">
            {countries.length} countries · {popularCount} featured
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--simlak-orange)] text-white text-sm font-medium hover:bg-[var(--simlak-coral)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Country
        </button>
      </div>

      {/* Add Country Form */}
      {showAddForm && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--simlak-orange)]" />
              Add New Country
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="US, GB, JP..."
                  maxLength={3}
                  value={newCountry.code}
                  onChange={(e) =>
                    setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none uppercase"
                />
                <p className="text-xs text-muted-foreground mt-1">ISO Alpha-2 code (must match package location code)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="United States"
                  value={newCountry.name}
                  onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Flag Emoji <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="🇺🇸"
                  value={newCountry.flagEmoji}
                  onChange={(e) => setNewCountry({ ...newCountry, flagEmoji: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none text-2xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Copy from{" "}
                  <a
                    href="https://emojipedia.org/flags"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--simlak-orange)] hover:underline"
                  >
                    Emojipedia
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  value={newCountry.region}
                  onChange={(e) => setNewCountry({ ...newCountry, region: e.target.value })}
                  className="w-full px-4 py-2 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="popular"
                checked={newCountry.popular}
                onChange={(e) => setNewCountry({ ...newCountry, popular: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[var(--simlak-orange)] focus:ring-[var(--simlak-orange)]"
              />
              <label htmlFor="popular" className="text-sm">
                Mark as featured (show on homepage)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 rounded-xl bg-[var(--simlak-orange)] text-white text-sm font-medium hover:bg-[var(--simlak-coral)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Country
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none min-w-[200px]"
          >
            <option value="all">All Regions</option>
            {existingRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCountries?.map((country) => (
          <div
            key={country._id}
            className={`bg-card rounded-2xl border p-4 transition-all ${
              country.popular
                ? "border-[var(--simlak-orange)]/30 bg-[var(--simlak-orange)]/5"
                : "border-border"
            }`}
          >
            {editingCountry === country._id ? (
              // Edit Mode
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editData.flagEmoji}
                    onChange={(e) => setEditData({ ...editData, flagEmoji: e.target.value })}
                    className="w-16 text-2xl px-2 py-1 bg-muted rounded-lg text-center"
                    placeholder="🏳️"
                  />
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="flex-1 px-3 py-1 bg-muted rounded-lg text-sm font-medium"
                    placeholder="Country name"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{country.code}</span>
                  <select
                    value={editData.region}
                    onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                    className="flex-1 px-2 py-1 bg-muted rounded-lg text-sm"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCountry(null)}
                    className="px-3 py-1 rounded-lg bg-muted text-sm hover:bg-muted/70"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(country._id)}
                    className="px-3 py-1 rounded-lg bg-[var(--simlak-teal)] text-white text-sm flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{country.flagEmoji}</span>
                    <div>
                      <p className="font-semibold">{country.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{country.code}</span>
                        <span>·</span>
                        <span>{country.region}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(country)}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
                      title="Edit country"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTogglePopular(country._id, country.popular || false)}
                      className={`p-2 rounded-lg transition-colors ${
                        country.popular
                          ? "bg-[var(--simlak-yellow)]/20 text-[var(--simlak-yellow)]"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                      title={country.popular ? "Remove from featured" : "Add to featured"}
                    >
                      {country.popular ? (
                        <Star className="w-5 h-5 fill-current" />
                      ) : (
                        <StarOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(country._id)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete country"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(country.packageCount !== undefined || country.minPrice) && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {country.packageCount || 0} packages
                    </span>
                    {country.minPrice && (
                      <span className="font-medium text-[var(--simlak-teal)]">
                        From ${(country.minPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {sortedCountries?.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No countries found</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-[var(--simlak-orange)] hover:underline"
          >
            Add your first country
          </button>
        </div>
      )}
    </div>
  );
}
