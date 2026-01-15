"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Globe2,
  ArrowRight,
  ArrowUpRight,
  Plane,
  Zap,
  Layers,
  ChevronDown,
  MapPin,
} from "lucide-react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// Intersection Observer hook for reveal animations
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "-30px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Bundle icons based on name
function getBundleEmoji(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("europe")) return "🇪🇺";
  if (lowerName.includes("asia")) return "🌏";
  if (lowerName.includes("america") || lowerName.includes("usa")) return "🌎";
  if (lowerName.includes("africa")) return "🌍";
  if (lowerName.includes("middle east")) return "🕌";
  if (lowerName.includes("oceania") || lowerName.includes("australia")) return "🦘";
  if (lowerName.includes("caribbean")) return "🏝️";
  if (lowerName.includes("global") || lowerName.includes("world")) return "🌐";
  return "📦";
}

export default function BundlesPage() {
  const bundles = useQuery(api.packages.getBundles);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  // Track mouse for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isLoading = bundles === undefined;

  const sortedBundles = useMemo(() => {
    if (!bundles) return [];
    return [...bundles].sort((a, b) => a.name.localeCompare(b.name));
  }, [bundles]);

  // Featured bundles (top 4 by package count or popularity)
  const featuredBundles = useMemo(() => {
    if (!sortedBundles.length) return [];
    return [...sortedBundles]
      .sort((a, b) => (b.packageCount || 0) - (a.packageCount || 0))
      .slice(0, 4);
  }, [sortedBundles]);

  return (
    <div className="overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex flex-col justify-center pt-24 pb-16"
      >
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, var(--simlak-dark) 1px, transparent 1px),
                linear-gradient(var(--simlak-dark) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Gradient orbs with mouse parallax */}
        <div
          className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-orange)",
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        />
        <div
          className="absolute bottom-0 -left-32 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-teal)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />

        <div className="container-wide relative z-10">
          {/* Eyebrow */}
          <div className="mb-8 overflow-hidden">
            <div
              className="flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="h-px w-12 bg-[var(--simlak-orange)]" />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Multi-Country Coverage
              </span>
            </div>
          </div>

          {/* Giant headline */}
          <div className="max-w-4xl mb-12">
            <h1 className="leading-[0.9] tracking-[-0.04em]">
              <span
                className="block text-[clamp(3rem,10vw,8rem)] font-black animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                One eSIM,
              </span>
              <span
                className="block text-[clamp(3rem,10vw,8rem)] font-black text-[var(--simlak-teal)] animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                many countries.
              </span>
            </h1>
          </div>

          {/* Subheadline + CTA */}
          <div
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
              Perfect for multi-destination trips.
              <br />
              <span className="text-foreground font-semibold">
                Save up to 40% with regional bundles.
              </span>
            </p>

            <Link href="/destinations">
              <button className="group font-semibold text-lg px-10 py-5 rounded-full border-2 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all flex items-center gap-3">
                Or browse single countries
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-sm font-medium">Explore bundles</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ============================================
          FEATURED BUNDLES - Large cards
          ============================================ */}
      {featuredBundles.length > 0 && (
        <section className="py-20 bg-[var(--simlak-dark)] text-white">
          <div className="container-wide">
            <Reveal>
              <div className="mb-12">
                <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Most Popular
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Featured <span className="text-[var(--simlak-teal)]">bundles</span>
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {featuredBundles.map((bundle, index) => (
                <Reveal key={bundle.code} delay={index * 100}>
                  <Link
                    href={`/bundles/${encodeURIComponent(bundle.slug || bundle.code)}`}
                    className="group block"
                  >
                    <div
                      className="relative h-[320px] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg,
                          ${index % 2 === 0 ? "var(--simlak-orange)" : "var(--simlak-teal)"} 0%,
                          ${index % 2 === 0 ? "var(--simlak-coral)" : "var(--simlak-mint)"} 100%
                        )`,
                      }}
                    >
                      {/* Noise texture */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Large emoji */}
                      <div className="absolute top-8 right-8 text-8xl opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                        {getBundleEmoji(bundle.customName || bundle.name)}
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 inset-x-0 p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Layers className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-white/80 text-sm font-medium">
                            {bundle.packageCount || 0} plans available
                          </span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                          {bundle.customName || bundle.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white/60 text-sm">From</span>
                            <p className="text-3xl font-bold text-white">
                              {bundle.minPrice ? formatPrice(bundle.minPrice) : "N/A"}
                            </p>
                          </div>
                          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-45 transition-all duration-300">
                            <ArrowUpRight className="w-6 h-6 text-[var(--simlak-dark)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          ALL BUNDLES SECTION
          ============================================ */}
      <section className="py-20">
        <div className="container-wide">
          {/* Section header */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <span className="text-[var(--simlak-teal)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Browse All
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  All <span className="text-[var(--simlak-orange)]">bundles</span>
                </h2>
                <p className="text-muted-foreground mt-2">
                  {isLoading
                    ? "Loading..."
                    : `${sortedBundles.length} bundle${sortedBundles.length !== 1 ? "s" : ""} available`}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--simlak-orange)]" />
                  Instant activation
                </span>
                <span className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[var(--simlak-teal)]" />
                  Multi-country
                </span>
              </div>
            </div>
          </Reveal>

          {/* Bundles grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-6 border border-border h-52 animate-pulse"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted mb-4" />
                  <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded mb-4" />
                  <div className="h-8 w-1/3 bg-muted rounded" />
                </div>
              ))
            ) : sortedBundles.length > 0 ? (
              sortedBundles.map((bundle, index) => (
                <Reveal key={bundle.code} delay={Math.min(index * 50, 300)}>
                  <Link
                    href={`/bundles/${encodeURIComponent(bundle.slug || bundle.code)}`}
                    className="group block h-full"
                  >
                    <div className="relative bg-card rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-[var(--simlak-orange)]/30 h-full">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--simlak-orange)]/5 to-[var(--simlak-teal)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-[var(--simlak-orange)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--simlak-orange)] transition-colors">
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {getBundleEmoji(bundle.customName || bundle.name)}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-xl mb-2 group-hover:text-[var(--simlak-orange)] transition-colors">
                          {bundle.customName || bundle.name}
                        </h3>

                        {/* Package count */}
                        <p className="text-sm text-muted-foreground mb-4">
                          {bundle.packageCount || 0} plan
                          {bundle.packageCount !== 1 ? "s" : ""} available
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">From</span>
                            <p className="text-2xl font-bold text-[var(--simlak-orange)]">
                              {bundle.minPrice ? formatPrice(bundle.minPrice) : "N/A"}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-[var(--simlak-orange)] transition-all">
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-20 px-6 bg-card rounded-3xl border border-border">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                    <Layers className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No bundles available</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Multi-country bundles will appear here once they are synced.
                  </p>
                  <Link href="/destinations">
                    <button className="bg-[var(--simlak-orange)] text-white font-bold px-8 py-4 rounded-full hover:shadow-xl transition-all flex items-center gap-2 mx-auto">
                      Browse Countries
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          WHY BUNDLES SECTION - Bento style
          ============================================ */}
      <section className="py-20 bg-card">
        <div className="container-wide">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Why Choose Bundles
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Perfect for <span className="text-[var(--simlak-teal)]">travelers</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <Reveal delay={100}>
              <div className="bg-background rounded-3xl p-8 border border-border h-full">
                <div className="w-14 h-14 rounded-2xl bg-[var(--simlak-orange)]/10 flex items-center justify-center mb-6">
                  <Globe2 className="w-7 h-7 text-[var(--simlak-orange)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Multi-Country</h3>
                <p className="text-muted-foreground leading-relaxed">
                  One eSIM works seamlessly across multiple countries. No need to switch plans
                  as you cross borders.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-[var(--simlak-yellow)] rounded-3xl p-8 h-full">
                <div className="text-[var(--simlak-dark)]">
                  <div className="text-5xl font-black mb-4">40%</div>
                  <h3 className="text-2xl font-bold mb-3">Average Savings</h3>
                  <p className="opacity-70 leading-relaxed">
                    Bundles cost significantly less than buying individual country plans
                    separately.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="bg-background rounded-3xl p-8 border border-border h-full">
                <div className="w-14 h-14 rounded-2xl bg-[var(--simlak-teal)]/10 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-[var(--simlak-teal)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Instant Switch</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically connects to the best local network in each country. Zero
                  configuration needed.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================
          DESTINATIONS CTA
          ============================================ */}
      <section className="py-20">
        <div className="container-wide">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--simlak-dark)] to-[#2a2a2a] p-10 md:p-16">
              {/* Background effects */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--simlak-teal)] rounded-full blur-[150px] opacity-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--simlak-orange)] rounded-full blur-[150px] opacity-20" />

              <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--simlak-teal)] flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[var(--simlak-teal)] font-semibold">Single Country</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Need just one country?
                  </h2>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Browse our individual country eSIM plans. 200+ destinations with instant activation.
                  </p>
                  <Link href="/destinations">
                    <button className="group bg-white text-[var(--simlak-dark)] font-bold text-lg px-10 py-5 rounded-full flex items-center gap-3 hover:shadow-2xl transition-all">
                      <Plane className="w-5 h-5" />
                      Browse Destinations
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                <div className="hidden md:flex justify-center">
                  <div className="relative w-64 h-64">
                    {/* Floating country badges */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-3 shadow-lg animate-float">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="text-xl">🇯🇵</span> Japan
                      </span>
                    </div>
                    <div className="absolute bottom-8 left-0 bg-white rounded-full px-5 py-3 shadow-lg animate-float-delay-1">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="text-xl">🇺🇸</span> USA
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full px-5 py-3 shadow-lg animate-float-delay-2">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="text-xl">🇬🇧</span> UK
                      </span>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 bg-[var(--simlak-orange)] text-white rounded-full px-5 py-3 shadow-lg animate-float">
                      <span className="font-semibold">200+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
