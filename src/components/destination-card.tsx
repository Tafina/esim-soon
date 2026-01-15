"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DestinationCardProps {
  code: string;
  name: string;
  flagEmoji: string;
  minPrice?: number;
  packageCount?: number;
  popular?: boolean;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function DestinationCard({
  code,
  name,
  flagEmoji,
  minPrice,
  packageCount,
  popular,
}: DestinationCardProps) {
  return (
    <Link href={`/destinations/${code.toLowerCase()}`}>
      <div className="country-card group cursor-pointer h-full bg-card">
        {/* Popular badge */}
        {popular && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 text-xs font-semibold bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] rounded-full">
              Popular
            </span>
          </div>
        )}

        <div className="p-5 md:p-6">
          {/* Flag */}
          <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {flagEmoji}
          </div>

          {/* Name */}
          <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--simlak-orange)] transition-colors">
            {name}
          </h3>

          {/* Package count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--simlak-teal)]" />
            <span>{packageCount || "Multiple"} plans</span>
          </div>

          {/* Price */}
          {minPrice && (
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-xl font-bold text-[var(--simlak-orange)]">
                  {formatPrice(minPrice)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-[var(--simlak-orange)] group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="w-12 h-12 rounded-lg shimmer mb-4" />
        <div className="h-6 w-3/4 rounded shimmer mb-2" />
        <div className="h-4 w-1/2 rounded shimmer mb-3" />
        <div className="h-6 w-1/3 rounded shimmer" />
      </div>
    </div>
  );
}
