"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PackageCard, PackageCardSkeleton } from "@/components/package-card";
import {
  ChevronLeft,
  Wifi,
  Globe2,
  Smartphone,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Signal,
  QrCode,
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Headphones,
  RefreshCw,
  Check,
  MapPin,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const installationSteps = [
  {
    num: "01",
    title: "Open Settings",
    description: "Go to Settings > Cellular/Mobile Data on your device",
  },
  {
    num: "02",
    title: "Add eSIM",
    description: "Tap 'Add eSIM' or 'Add Cellular Plan'",
  },
  {
    num: "03",
    title: "Scan QR Code",
    description: "Scan the QR code we send to your email",
  },
  {
    num: "04",
    title: "Activate & Go",
    description: "Enable data roaming when you arrive",
  },
];

const faqs = [
  {
    question: "Which countries are included in this bundle?",
    answer:
      "The bundle covers multiple countries as specified in the package details. Check the package description for the full list of included destinations.",
  },
  {
    question: "Can I use the same eSIM across all included countries?",
    answer:
      "Yes! Once installed, your eSIM will automatically connect to local networks in any of the covered countries. No need to change settings.",
  },
  {
    question: "When does my bundle plan start?",
    answer:
      "Your plan begins when you first connect to a network in any of the covered countries. You can install the eSIM before your trip and it will activate upon arrival.",
  },
  {
    question: "What happens if I run out of data?",
    answer:
      "You can easily purchase additional data through our website. Your new data will be added to your existing eSIM.",
  },
];

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

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// Bundle emoji based on name
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

export default function BundlePackagesPage() {
  const params = useParams();
  const bundleCode = decodeURIComponent(params.bundle as string);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const bundle = useQuery(api.packages.getBundleByCode, { code: bundleCode });
  const packages = useQuery(api.packages.getBundlePackages, { bundleCode });

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

  const isLoading = bundle === undefined || packages === undefined;

  const displayBundle = bundle || {
    name: bundleCode,
    flagEmoji: "🌐",
    region: "Bundle",
  };

  const bundleDisplayName = bundle?.customName || displayBundle.name;
  const bundleDescription = bundle?.description;
  const includedCountries = bundle?.includedCountries || [];

  const displayPackages = packages || [];
  const recommendedIndex = Math.floor(displayPackages.length / 2);
  const minPrice =
    displayPackages.length > 0
      ? Math.min(...displayPackages.map((p) => p.retailPrice))
      : 0;

  // If bundle not found after loading, show error
  if (bundle === null) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container-wide text-center">
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-8">
            <Layers className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-5xl font-black mb-4">Bundle Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            This bundle doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/bundles"
            className="inline-flex items-center gap-2 bg-[var(--simlak-orange)] text-white font-bold px-8 py-4 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Bundles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex flex-col justify-center pt-24 pb-16"
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
            background: "var(--simlak-teal)",
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        />
        <div
          className="absolute bottom-0 -left-32 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-orange)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />

        <div className="container-wide relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/bundles"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">All bundles</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Bundle Info */}
            <div>
              {/* Eyebrow */}
              <div className="mb-6 overflow-hidden">
                <div
                  className="flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="h-px w-12 bg-[var(--simlak-teal)]" />
                  <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2">
                    <Globe2 className="w-4 h-4" />
                    Multi-Country Bundle
                  </span>
                </div>
              </div>

              {/* Icon + Name */}
              <div className="flex items-center gap-6 mb-6">
                <div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-6xl animate-slide-up"
                  style={{
                    animationDelay: "200ms",
                    background: `linear-gradient(135deg, var(--simlak-teal) 0%, var(--simlak-mint) 100%)`,
                  }}
                >
                  {getBundleEmoji(bundleDisplayName)}
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] tracking-[-0.03em] animate-slide-up"
                    style={{ animationDelay: "300ms" }}
                  >
                    {bundleDisplayName}
                  </h1>
                  {bundleDescription && (
                    <p
                      className="text-muted-foreground mt-3 max-w-md animate-slide-up"
                      style={{ animationDelay: "350ms" }}
                    >
                      {bundleDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Included Countries */}
              {includedCountries.length > 0 && (
                <div
                  className="mb-8 animate-slide-up"
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Globe2 className="w-5 h-5 text-[var(--simlak-teal)]" />
                    <span className="font-semibold">
                      {includedCountries.length} Countries Included
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {includedCountries.slice(0, 12).map((country, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-card border border-border rounded-full text-sm"
                      >
                        {country}
                      </span>
                    ))}
                    {includedCountries.length > 12 && (
                      <span className="px-3 py-1.5 bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] rounded-full text-sm font-semibold">
                        +{includedCountries.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div
                className="flex flex-wrap gap-3 mb-8 animate-slide-up"
                style={{ animationDelay: "450ms" }}
              >
                {[
                  { icon: Signal, label: "4G/5G", color: "teal" },
                  { icon: Wifi, label: `${displayPackages.length} Plans`, color: "orange" },
                  { icon: Zap, label: "Instant", color: "yellow" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border"
                  >
                    <stat.icon
                      className={`w-4 h-4 ${
                        stat.color === "teal"
                          ? "text-[var(--simlak-teal)]"
                          : stat.color === "orange"
                          ? "text-[var(--simlak-orange)]"
                          : "text-[var(--simlak-yellow)]"
                      }`}
                    />
                    <span className="text-sm font-semibold">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              {displayPackages.length > 0 && (
                <div
                  className="flex flex-col sm:flex-row sm:items-end gap-6 animate-slide-up"
                  style={{ animationDelay: "500ms" }}
                >
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Plans starting from
                    </p>
                    <p className="text-5xl font-black text-[var(--simlak-orange)]">
                      {formatPrice(minPrice)}
                    </p>
                  </div>
                  <a href="#plans">
                    <button className="group relative bg-[var(--simlak-dark)] text-white font-bold text-lg px-8 py-4 rounded-full overflow-hidden transition-all hover:shadow-2xl">
                      <span className="relative z-10 flex items-center gap-2">
                        View Plans
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-[var(--simlak-teal)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </a>
                </div>
              )}
            </div>

            {/* Right - Preview Card */}
            {displayPackages.length > 0 && (
              <div className="hidden lg:block">
                <div
                  className="relative animate-slide-left"
                  style={{ animationDelay: "400ms" }}
                >
                  <div
                    className="relative rounded-3xl overflow-hidden p-8 text-white"
                    style={{
                      background: `linear-gradient(135deg, var(--simlak-teal) 0%, var(--simlak-mint) 100%)`,
                    }}
                  >
                    {/* Noise texture */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold">
                          Best Value
                        </div>
                      </div>

                      <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl mb-6">
                        {getBundleEmoji(bundleDisplayName)}
                      </div>

                      <h3 className="text-3xl font-bold mb-2">{bundleDisplayName}</h3>

                      {displayPackages[recommendedIndex] && (
                        <div className="flex items-center gap-4 mb-8 text-white/70">
                          <span className="flex items-center gap-1.5">
                            <Wifi className="w-4 h-4" />
                            {Math.round(
                              displayPackages[recommendedIndex].volume /
                                (1024 * 1024 * 1024)
                            )}
                            GB
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {displayPackages[recommendedIndex].duration} Days
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Globe2 className="w-4 h-4" />
                            {includedCountries.length}+ Countries
                          </span>
                        </div>
                      )}

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white/60 text-sm">From</p>
                          <p className="text-4xl font-black">{formatPrice(minPrice)}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                          <ArrowUpRight className="w-6 h-6 text-[var(--simlak-dark)]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-[var(--simlak-yellow)] text-[var(--simlak-dark)] rounded-full px-4 py-2 text-sm font-bold transform -rotate-12 shadow-lg">
                    Save 40%
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-xl border border-border">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[var(--simlak-teal)]" />
                      <span className="text-sm font-semibold">Multi-country</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST BADGES
          ============================================ */}
      <section className="py-8 border-y border-border bg-card">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Instant Delivery", desc: "QR code via email" },
              { icon: Shield, title: "Secure Payment", desc: "256-bit encryption" },
              { icon: RefreshCw, title: "Money Back", desc: "7-day guarantee" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--simlak-teal)]/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[var(--simlak-teal)]" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PLANS SECTION
          ============================================ */}
      <section id="plans" className="py-20 bg-[var(--simlak-dark)] text-white">
        <div className="container-wide">
          <Reveal>
            <div className="mb-12">
              <span className="text-[var(--simlak-teal)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Bundle Plans
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Choose your <span className="text-[var(--simlak-orange)]">plan</span>
              </h2>
              <p className="text-white/60 mt-3">
                Select the perfect bundle for your multi-country trip
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <PackageCardSkeleton key={i} />
              ))
            ) : displayPackages.length > 0 ? (
              displayPackages.map((pkg, index) => (
                <Reveal key={pkg.packageCode} delay={index * 50}>
                  <PackageCard
                    packageCode={pkg.packageCode}
                    name={pkg.name}
                    volume={pkg.volume}
                    duration={pkg.duration}
                    retailPrice={pkg.retailPrice}
                    locationName={bundleDisplayName}
                    activeType={pkg.activeType}
                    recommended={index === recommendedIndex}
                  />
                </Reveal>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <CreditCard className="w-16 h-16 mx-auto mb-6 text-white/30" />
                <p className="text-white/60 text-lg">
                  No packages available for this bundle
                </p>
                <Link
                  href="/bundles"
                  className="inline-block mt-6 bg-[var(--simlak-teal)] text-white font-bold px-8 py-4 rounded-full"
                >
                  Browse Bundles
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW TO INSTALL
          ============================================ */}
      <section className="py-20">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <span className="text-[var(--simlak-teal)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Quick Setup
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-10">
                Install in <span className="text-[var(--simlak-orange)]">minutes</span>
              </h2>
            </Reveal>

            <div className="space-y-4">
              {installationSteps.map((step, i) => (
                <Reveal key={step.num} delay={i * 100}>
                  <div className="group flex gap-5 p-5 rounded-2xl bg-card border border-border hover:border-[var(--simlak-teal)]/30 transition-all">
                    <div className="flex-shrink-0">
                      <span className="block text-4xl font-black text-[var(--simlak-teal)]/20 group-hover:text-[var(--simlak-teal)]/40 transition-colors">
                        {step.num}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION
          ============================================ */}
      <section className="py-20 bg-card">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                  FAQ
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Common <span className="text-[var(--simlak-teal)]">questions</span>
                </h2>
              </div>
            </Reveal>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Reveal key={index} delay={index * 50}>
                  <div className="bg-background rounded-2xl border border-border overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-bold text-lg pr-4">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SUPPORT CTA
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

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Need help with your purchase?
                  </h2>
                  <p className="text-white/70 text-lg max-w-lg">
                    Our support team is available 24/7 to assist you with any
                    questions.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/support">
                    <button className="group bg-white text-[var(--simlak-dark)] font-bold text-lg px-8 py-4 rounded-full flex items-center gap-2 hover:shadow-2xl transition-all">
                      <Headphones className="w-5 h-5" />
                      Contact Support
                    </button>
                  </Link>
                  <Link href="/bundles">
                    <button className="font-bold text-lg px-8 py-4 rounded-full border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      More Bundles
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
