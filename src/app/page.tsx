"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Wifi,
  Zap,
  Shield,
  QrCode,
  MapPin,
  Sparkles,
  ChevronDown,
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
      { threshold: 0.15, rootMargin: "-50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Reveal wrapper component
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
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(60px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const popularCountries = useQuery(api.packages.getPopularCountries);
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

  return (
    <div className="overflow-hidden">
      {/* ============================================
          HERO SECTION - Full viewport, dramatic type
          ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-between pt-24 pb-8"
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
          className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-orange)",
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        />
        <div
          className="absolute bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-teal)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />

        {/* Main hero content */}
        <div className="container-wide relative z-10 flex-1 flex items-center">
          <div className="w-full">
            {/* Eyebrow */}
            <div className="mb-8 overflow-hidden">
              <div
                className="flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: "100ms" }}
              >
                <div className="h-px w-12 bg-[var(--simlak-orange)]" />
                <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                  Travel without limits
                </span>
              </div>
            </div>

            {/* Giant headline - editorial style */}
            <div className="relative mb-12">
              <h1 className="leading-[0.85] tracking-[-0.04em]">
                <span
                  className="block text-[clamp(3.5rem,12vw,11rem)] font-black animate-slide-up"
                  style={{ animationDelay: "200ms" }}
                >
                  Stay
                </span>
                <span
                  className="block text-[clamp(3.5rem,12vw,11rem)] font-black animate-slide-up"
                  style={{ animationDelay: "300ms" }}
                >
                  connected
                </span>
                <span
                  className="block text-[clamp(3.5rem,12vw,11rem)] font-black text-[var(--simlak-orange)] animate-slide-up"
                  style={{ animationDelay: "400ms" }}
                >
                  everywhere.
                </span>
              </h1>

              {/* Floating accent card */}
              <div
                className="absolute -right-4 -top-8 hidden lg:block animate-slide-left"
                style={{ animationDelay: "600ms" }}
              >
                <div className="relative">
                  <div className="bg-[var(--simlak-dark)] text-white rounded-3xl p-6 w-72 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--simlak-orange)] flex items-center justify-center">
                        <Wifi className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Active now</p>
                        <p className="font-bold">Tokyo, Japan</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Speed</span>
                      <span className="font-mono font-bold text-[var(--simlak-teal)]">
                        312 Mbps
                      </span>
                    </div>
                  </div>
                  {/* Decorative badge */}
                  <div className="absolute -top-3 -right-3 bg-[var(--simlak-yellow)] text-[var(--simlak-dark)] rounded-full px-4 py-2 text-sm font-bold transform -rotate-12">
                    5G
                  </div>
                </div>
              </div>
            </div>

            {/* Subheadline + CTA row */}
            <div
              className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
                Instant eSIM activation in 200+ countries.
                <br />
                <span className="text-foreground font-semibold">
                  No SIM cards. No roaming fees. Just go.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/destinations">
                  <button className="group relative bg-[var(--simlak-dark)] text-white font-bold text-lg px-10 py-5 rounded-full overflow-hidden transition-all hover:shadow-2xl hover:shadow-[var(--simlak-dark)]/20">
                    <span className="relative z-10 flex items-center gap-3">
                      Get Your eSIM
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-[var(--simlak-orange)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </Link>
                <Link href="#how">
                  <button className="font-semibold text-lg px-10 py-5 rounded-full border-2 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all">
                    How it works
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="container-wide relative z-10">
          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--simlak-teal)] animate-pulse" />
                200+ Countries
              </span>
              <span className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--simlak-orange)] animate-pulse" />
                Instant Activation
              </span>
              <span className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--simlak-yellow)]" />
                24/7 Support
              </span>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Scroll to explore
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED DESTINATIONS - Horizontal scroll
          ============================================ */}
      <section className="py-24 bg-[var(--simlak-dark)] text-white overflow-hidden">
        <div className="container-wide mb-12">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Top Destinations
                </span>
                <h2 className="text-4xl md:text-6xl font-bold">
                  Where to
                  <span className="text-[var(--simlak-teal)]"> next?</span>
                </h2>
              </div>
              <Link
                href="/destinations"
                className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <span className="font-medium">All destinations</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          <div className="flex gap-6 px-6 md:px-12 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {popularCountries === undefined
              ? // Skeleton loading
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[300px] md:w-[380px] h-[480px] rounded-3xl bg-white/5 animate-pulse"
                  />
                ))
              : popularCountries.slice(0, 8).map((country, index) => (
                  <Link
                    key={country._id}
                    href={`/destinations/${country.code.toLowerCase()}`}
                    className="group flex-shrink-0 snap-start"
                  >
                    <div
                      className="relative w-[300px] md:w-[380px] h-[480px] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(180deg,
                          ${index % 2 === 0 ? "var(--simlak-orange)" : "var(--simlak-teal)"} 0%,
                          ${index % 2 === 0 ? "var(--simlak-coral)" : "var(--simlak-mint)"} 100%
                        )`,
                      }}
                    >
                      {/* Noise texture overlay */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Giant flag emoji */}
                      <div className="absolute top-6 left-6 text-8xl opacity-90 transform group-hover:scale-110 transition-transform duration-500">
                        {country.flagEmoji}
                      </div>

                      {/* Popular badge */}
                      {country.popular && (
                        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          Popular
                        </div>
                      )}

                      {/* Content */}
                      <div className="absolute bottom-0 inset-x-0 p-8">
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {country.name}
                        </h3>
                        <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
                          <span>{country.packageCount} plans</span>
                          <span className="w-1 h-1 rounded-full bg-white/50" />
                          <span>Instant activation</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white/60 text-sm">From</span>
                            <p className="text-3xl font-bold text-white">
                              {country.minPrice
                                ? formatPrice(country.minPrice)
                                : "$4.99"}
                            </p>
                          </div>
                          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-45 transition-all duration-300">
                            <ArrowUpRight className="w-6 h-6 text-[var(--simlak-dark)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-[var(--simlak-dark)] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-[var(--simlak-dark)] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS - Magazine spread style
          ============================================ */}
      <section id="how" className="py-32 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--simlak-cream)] hidden lg:block" />

        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left - Content */}
            <div>
              <Reveal>
                <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-6 block">
                  Simple as 1-2-3
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="text-5xl md:text-7xl font-bold mb-12 leading-[0.9]">
                  Get online
                  <br />
                  <span className="text-[var(--simlak-teal)]">in minutes.</span>
                </h2>
              </Reveal>

              {/* Steps */}
              <div className="space-y-8">
                {[
                  {
                    num: "01",
                    title: "Choose your destination",
                    desc: "Browse 200+ countries and pick the perfect data plan for your trip.",
                    icon: MapPin,
                  },
                  {
                    num: "02",
                    title: "Get your QR code",
                    desc: "Receive your eSIM instantly via email. No waiting, no shipping.",
                    icon: QrCode,
                  },
                  {
                    num: "03",
                    title: "Scan & connect",
                    desc: "Open your camera, scan the code, and you're online. That simple.",
                    icon: Wifi,
                  },
                ].map((step, i) => (
                  <Reveal key={step.num} delay={200 + i * 100}>
                    <div className="group flex gap-6 p-6 rounded-2xl hover:bg-card transition-colors cursor-default">
                      <div className="flex-shrink-0">
                        <span className="block text-5xl font-black text-[var(--simlak-orange)]/20 group-hover:text-[var(--simlak-orange)]/40 transition-colors">
                          {step.num}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <step.icon className="w-5 h-5 text-[var(--simlak-orange)]" />
                          <h3 className="text-xl font-bold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={500}>
                <div className="mt-12">
                  <Link href="/destinations">
                    <button className="group bg-[var(--simlak-orange)] text-white font-bold text-lg px-10 py-5 rounded-full flex items-center gap-3 hover:shadow-2xl hover:shadow-[var(--simlak-orange)]/30 transition-all">
                      Get Started Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right - Visual */}
            <div className="relative hidden lg:block">
              <Reveal delay={300}>
                <div className="relative">
                  {/* Main phone mockup */}
                  <div className="relative w-80 h-[640px] mx-auto">
                    <div className="absolute inset-0 bg-[var(--simlak-dark)] rounded-[3rem] p-3 shadow-2xl">
                      {/* Dynamic island */}
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

                      {/* Screen */}
                      <div className="w-full h-full bg-background rounded-[2.4rem] overflow-hidden flex flex-col">
                        {/* Status bar */}
                        <div className="flex items-center justify-between px-8 py-4 pt-10">
                          <span className="text-sm font-semibold">9:41</span>
                          <div className="flex items-center gap-1">
                            <Wifi className="w-4 h-4" />
                            <span className="text-xs font-bold bg-[var(--simlak-teal)] text-white px-1.5 py-0.5 rounded">
                              5G
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 px-6 py-4">
                          <div className="text-center mb-8">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[var(--simlak-orange)] to-[var(--simlak-coral)] flex items-center justify-center">
                              <QrCode className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="font-bold text-lg mb-1">
                              Scan to Install
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Japan eSIM - 5GB
                            </p>
                          </div>

                          {/* Fake QR placeholder */}
                          <div className="aspect-square w-48 mx-auto bg-[var(--simlak-dark)] rounded-2xl p-4">
                            <div
                              className="w-full h-full rounded-lg"
                              style={{
                                backgroundImage: `
                                  linear-gradient(45deg, white 25%, transparent 25%),
                                  linear-gradient(-45deg, white 25%, transparent 25%),
                                  linear-gradient(45deg, transparent 75%, white 75%),
                                  linear-gradient(-45deg, transparent 75%, white 75%)
                                `,
                                backgroundSize: "16px 16px",
                                backgroundPosition:
                                  "0 0, 0 8px, 8px -8px, -8px 0px",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-8 -left-12 bg-card rounded-2xl p-4 shadow-xl border border-border animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--simlak-teal)]/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[var(--simlak-teal)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Activated!</p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -right-8 bg-[var(--simlak-orange)] text-white rounded-2xl p-5 shadow-xl animate-float-delay-1">
                    <p className="text-sm opacity-80 mb-1">Data remaining</p>
                    <p className="text-3xl font-bold">4.2 GB</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES GRID - Bento style
          ============================================ */}
      <section className="py-32 bg-card">
        <div className="container-wide">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[var(--simlak-teal)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Why Simlak
              </span>
              <h2 className="text-4xl md:text-6xl font-bold">
                Built for <span className="text-[var(--simlak-orange)]">modern</span> travelers
              </h2>
            </div>
          </Reveal>

          {/* Bento grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large feature card */}
            <Reveal delay={100}>
              <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[var(--simlak-dark)] to-[#2a2a2a] rounded-3xl p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--simlak-orange)] rounded-full blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative z-10">
                  <Globe2 className="w-12 h-12 text-[var(--simlak-orange)] mb-6" />
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    200+ Countries Covered
                  </h3>
                  <p className="text-white/70 text-lg max-w-lg leading-relaxed">
                    From Tokyo to Toronto, Paris to Perth. One eSIM gives you
                    premium local network access wherever you travel.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-8">
                    {["🇯🇵", "🇺🇸", "🇬🇧", "🇫🇷", "🇹🇭", "🇦🇺", "🇮🇹", "🇪🇸"].map(
                      (flag, i) => (
                        <span
                          key={i}
                          className="text-3xl transform hover:scale-125 transition-transform cursor-default"
                        >
                          {flag}
                        </span>
                      )
                    )}
                    <span className="text-lg text-white/50 flex items-center">
                      +192 more
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Speed card */}
            <Reveal delay={200}>
              <div className="bg-background rounded-3xl p-8 border border-border group hover:border-[var(--simlak-teal)]/30 transition-colors">
                <Zap className="w-10 h-10 text-[var(--simlak-orange)] mb-6" />
                <h3 className="text-2xl font-bold mb-3">Instant Activation</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Get connected in seconds, not days. No waiting for shipping or
                  visiting stores.
                </p>
                <div className="flex items-center gap-2 text-[var(--simlak-teal)] font-mono font-bold text-xl">
                  <span className="w-2 h-2 rounded-full bg-[var(--simlak-teal)] animate-pulse" />
                  ~30 seconds
                </div>
              </div>
            </Reveal>

            {/* Security card */}
            <Reveal delay={300}>
              <div className="bg-background rounded-3xl p-8 border border-border group hover:border-[var(--simlak-orange)]/30 transition-colors">
                <Shield className="w-10 h-10 text-[var(--simlak-teal)] mb-6" />
                <h3 className="text-2xl font-bold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade encryption protects your data. Browse safely
                  on any network worldwide.
                </p>
              </div>
            </Reveal>

            {/* Pricing card */}
            <Reveal delay={400}>
              <div className="bg-[var(--simlak-yellow)] rounded-3xl p-8 group">
                <div className="text-[var(--simlak-dark)]">
                  <div className="text-6xl font-black mb-4">$0</div>
                  <h3 className="text-2xl font-bold mb-3">Roaming Fees</h3>
                  <p className="opacity-70 leading-relaxed">
                    Pay once for your data plan. No surprise charges, hidden
                    fees, or bill shock when you return home.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Support card */}
            <Reveal delay={500}>
              <div className="bg-background rounded-3xl p-8 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-3">
                    {["SC", "MR", "PS"].map((initials, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--simlak-orange)] to-[var(--simlak-coral)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-background"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Support team
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">24/7 Human Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real people ready to help whenever you need assistance. No
                  bots, no wait times.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================
          SOCIAL PROOF - Trust strip
          ============================================ */}
      <section className="py-20 border-y border-border">
        <div className="container-wide">
          <Reveal>
            <div className="grid md:grid-cols-4 gap-12 text-center">
              {[
                { value: "2M+", label: "Happy Travelers" },
                { value: "200+", label: "Countries" },
                { value: "4.9", label: "App Store Rating" },
                { value: "30s", label: "Avg. Setup Time" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-5xl md:text-6xl font-black text-[var(--simlak-orange)] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================
          FINAL CTA - Full bleed gradient
          ============================================ */}
      <section className="py-32 bg-gradient-to-br from-[var(--simlak-orange)] to-[var(--simlak-coral)] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--simlak-yellow)] rounded-full blur-[150px] opacity-20" />

        <div className="container-wide relative z-10 text-center">
          <Reveal>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9]">
              Ready to go
              <br />
              anywhere?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Join 2 million+ travelers who never worry about connectivity.
              Your next adventure starts with a single scan.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/destinations">
                <button className="group bg-white text-[var(--simlak-dark)] font-bold text-xl px-12 py-6 rounded-full flex items-center justify-center gap-3 hover:shadow-2xl transition-all">
                  Get Your eSIM
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/support">
                <button className="font-bold text-xl px-12 py-6 rounded-full border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all">
                  Contact Us
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================
          FOOTER - Minimal, refined
          ============================================ */}
      <footer className="py-16 bg-[var(--simlak-dark)] text-white">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--simlak-orange)] flex items-center justify-center">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Simlak</span>
              </div>
              <p className="text-white/60 leading-relaxed max-w-sm mb-6">
                Instant eSIM connectivity for the modern traveler. Stay
                connected in 200+ countries without the hassle.
              </p>
              <div className="flex gap-4">
                {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--simlak-orange)] transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <Globe2 className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-white/60">
                <li>
                  <Link
                    href="/destinations"
                    className="hover:text-white transition-colors"
                  >
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-white/60">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-white/60">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Refunds
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-white/40 text-sm">
            <p>&copy; {new Date().getFullYear()} Simlak. All rights reserved.</p>
            <p>Made for travelers, by travelers.</p>
          </div>
        </div>
      </footer>

      {/* Hide scrollbar utility */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
