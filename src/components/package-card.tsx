"use client";

import { Button } from "@/components/ui/button";
import { Wifi, Clock, Zap, Check } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useState } from "react";

interface PackageCardProps {
  packageCode: string;
  name: string;
  volume: number;
  duration: number;
  retailPrice: number;
  locationName: string;
  activeType: string;
  recommended?: boolean;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return gb % 1 === 0 ? `${gb}GB` : `${gb.toFixed(1)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${Math.round(mb)}MB`;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function PackageCard({
  packageCode,
  name,
  volume,
  duration,
  retailPrice,
  locationName,
  activeType,
  recommended,
}: PackageCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(packageCode);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const pricePerDay = retailPrice / duration;
  const pricePerGB = retailPrice / (volume / (1024 * 1024 * 1024));

  return (
    <div className={`feature-card h-full text-foreground ${recommended ? 'border-[var(--simlak-orange)] bg-gradient-to-br from-[var(--simlak-orange)]/5 to-transparent' : ''}`}>
      {/* Recommended badge */}
      {recommended && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          Best Value
        </div>
      )}

      {/* Data amount */}
      <div className="mb-5">
        <span className="text-4xl md:text-5xl font-bold">
          {formatBytes(volume)}
        </span>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="icon-container icon-container-orange">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">{duration} Days</p>
            <p className="text-xs text-muted-foreground">Validity period</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="icon-container icon-container-teal">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">High-speed Data</p>
            <p className="text-xs text-muted-foreground">4G/5G networks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="icon-container" style={{ background: 'rgba(149, 225, 211, 0.1)', color: 'var(--simlak-mint)' }}>
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Instant Delivery</p>
            <p className="text-xs text-muted-foreground">QR code via email</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-5 pb-5 border-b border-border">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[var(--simlak-orange)]">
            {formatPrice(retailPrice)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatPrice(Math.round(pricePerDay))}/day · {formatPrice(Math.round(pricePerGB))}/GB
        </p>
      </div>

      {/* Add to cart button */}
      <Button
        className={`w-full h-12 text-base font-semibold rounded-xl ${
          recommended
            ? 'bg-[var(--simlak-orange)] hover:bg-[var(--simlak-orange)]/90 text-white'
            : 'bg-foreground hover:bg-foreground/90 text-background'
        }`}
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {added ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Added to Cart
          </>
        ) : isAdding ? (
          "Adding..."
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}

export function PackageCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl border border-border p-6 text-foreground">
      <div className="h-12 w-24 rounded shimmer mb-5" />
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer" />
          <div className="flex-1">
            <div className="h-4 w-20 rounded shimmer mb-1" />
            <div className="h-3 w-16 rounded shimmer" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded shimmer mb-1" />
            <div className="h-3 w-20 rounded shimmer" />
          </div>
        </div>
      </div>
      <div className="h-10 w-24 rounded shimmer mb-5" />
      <div className="h-12 w-full rounded-xl shimmer" />
    </div>
  );
}
