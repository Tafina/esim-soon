"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Globe,
  Signal,
  Wifi,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Smartphone,
  Settings,
  HelpCircle,
  Loader2,
  MapPin,
  Calendar,
  Database,
  RefreshCw,
  Shield,
  Zap,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* ==============================================
   UTILITY FUNCTIONS
   ============================================== */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatBytesShort(bytes: number): string {
  if (bytes === 0) return "0";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return gb.toFixed(1) + " GB";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(0) + " MB";
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusInfo(status: string) {
  switch (status) {
    case "IN_USE":
      return {
        color: "text-[var(--simlak-teal)]",
        bg: "bg-[var(--simlak-teal)]/10",
        label: "Active",
        description: "Your eSIM is currently active and connected.",
      };
    case "GOT_RESOURCE":
      return {
        color: "text-[var(--simlak-orange)]",
        bg: "bg-[var(--simlak-orange)]/10",
        label: "Ready to Install",
        description: "Your eSIM is ready! Scan the QR code to install it on your device.",
      };
    case "PAID":
      return {
        color: "text-amber-600",
        bg: "bg-amber-50",
        label: "Processing",
        description: "Your payment was successful. We're preparing your eSIM.",
      };
    case "USED_UP":
      return {
        color: "text-gray-500",
        bg: "bg-gray-100",
        label: "Data Exhausted",
        description: "You've used all your data. Purchase a top-up to continue using this eSIM.",
      };
    case "USED_EXPIRED":
    case "UNUSED_EXPIRED":
      return {
        color: "text-gray-400",
        bg: "bg-gray-50",
        label: "Expired",
        description: "This eSIM has expired. Purchase a new one for your next trip.",
      };
    case "CANCEL":
      return {
        color: "text-red-500",
        bg: "bg-red-50",
        label: "Cancelled",
        description: "This eSIM has been cancelled.",
      };
    case "REVOKED":
      return {
        color: "text-red-600",
        bg: "bg-red-100",
        label: "Revoked",
        description: "This eSIM has been revoked by the provider.",
      };
    default:
      return {
        color: "text-amber-600",
        bg: "bg-amber-50",
        label: "Pending",
        description: "Your eSIM is being processed.",
      };
  }
}

/* ==============================================
   REVEAL ANIMATION HOOK
   ============================================== */

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

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, isVisible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ==============================================
   MAIN ESIM DETAIL PAGE
   ============================================== */

export default function EsimDetailPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const esimId = params.id as string;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const esim = useQuery(api.orders.getEsim, {
    esimId: esimId as Id<"esims">,
  });

  const refreshEsim = useAction(api.ordersActions.refreshEsimStatus);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefresh = async () => {
    if (!esim || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshEsim({ iccid: esim.iccid });
    } catch (error) {
      console.error("Failed to refresh eSIM:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--simlak-orange)] mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen overflow-hidden">
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

        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4">
          <div
            className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none"
            style={{ background: "var(--simlak-orange)" }}
          />

          <div className="relative text-center max-w-xl">
            <div
              className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
              }}
            >
              <Smartphone className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-black mb-6 tracking-[-0.03em]">
              Sign in required
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Please sign in to view your eSIM details.
            </p>
            <Link
              href="/sign-in"
              className="group inline-flex items-center gap-3 bg-[var(--simlak-dark)] text-white font-bold text-lg px-8 py-4 rounded-full"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading eSIM data
  if (esim === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--simlak-orange)] mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading eSIM details...</p>
        </div>
      </div>
    );
  }

  // eSIM not found
  if (esim === null) {
    return (
      <div className="min-h-screen overflow-hidden">
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

        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4">
          <div
            className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none"
            style={{ background: "var(--simlak-coral)" }}
          />

          <div className="relative text-center max-w-xl">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center bg-red-50 text-red-500">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-black mb-6 tracking-[-0.03em]">
              eSIM Not Found
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              We couldn't find the eSIM you're looking for.
            </p>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 bg-[var(--simlak-dark)] text-white font-bold text-lg px-8 py-4 rounded-full"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const usagePercent = esim.dataUsed
    ? Math.min((esim.dataUsed / esim.dataTotal) * 100, 100)
    : 0;
  const dataRemaining = esim.dataTotal - (esim.dataUsed || 0);
  const isReady = esim.status === "GOT_RESOURCE";
  const isActive = esim.status === "IN_USE";
  const statusInfo = getStatusInfo(esim.status);

  const installationSteps = [
    { num: "01", title: "Open Settings", desc: "Go to Settings > Cellular/Mobile Data" },
    { num: "02", title: "Add eSIM", desc: "Tap 'Add eSIM' or 'Add Cellular Plan'" },
    { num: "03", title: "Scan QR Code", desc: "Use your camera to scan the QR code" },
    { num: "04", title: "Activate", desc: "Follow prompts to complete installation" },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[45vh] flex flex-col justify-end pt-24 pb-12"
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
            background: isActive ? "var(--simlak-teal)" : "var(--simlak-orange)",
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        />
        <div
          className="absolute bottom-0 -right-32 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: isActive ? "var(--simlak-mint)" : "var(--simlak-teal)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />

        <div className="container-wide relative z-10">
          {/* Breadcrumb */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {/* Left - eSIM Info */}
            <div>
              {/* Eyebrow */}
              <div className="mb-6 overflow-hidden">
                <div
                  className="flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="h-px w-12 bg-[var(--simlak-orange)]" />
                  <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    eSIM Details
                  </span>
                </div>
              </div>

              {/* Icon + Name */}
              <div className="flex items-center gap-6 mb-6">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white animate-slide-up"
                  style={{
                    animationDelay: "200ms",
                    background: isActive
                      ? `linear-gradient(135deg, var(--simlak-teal) 0%, var(--simlak-mint) 100%)`
                      : `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
                  }}
                >
                  <Globe className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-[-0.03em] animate-slide-up"
                    style={{ animationDelay: "300ms" }}
                  >
                    {esim.locationName}
                  </h1>
                  <p
                    className="text-muted-foreground text-lg mt-2 animate-slide-up"
                    style={{ animationDelay: "350ms" }}
                  >
                    {esim.packageName}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div
                className="flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: "400ms" }}
              >
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                  {isActive ? <Wifi className="w-4 h-4" /> : isReady ? <QrCode className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  {statusInfo.label}
                  {isActive && (
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--simlak-teal)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--simlak-teal)]"></span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:bg-muted transition-all disabled:opacity-50 text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Syncing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Right - Quick Stats */}
            <div
              className="flex gap-4 animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              <div className="px-5 py-4 rounded-2xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Data Remaining</p>
                <p className="text-2xl font-black text-[var(--simlak-teal)]">{formatBytesShort(dataRemaining)}</p>
              </div>
              <div className="px-5 py-4 rounded-2xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="text-2xl font-black">{esim.duration} days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          STATUS ALERT
          ============================================ */}
      <section className="py-8">
        <div className="container-wide">
          <Reveal>
            <div
              className="relative rounded-2xl p-6 overflow-hidden"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, var(--simlak-teal) 0%, #2a9d8f 100%)`
                  : isReady
                  ? `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`
                  : `linear-gradient(135deg, #f5f5f5 0%, #ececec 100%)`,
              }}
            >
              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className={`relative flex items-start gap-4 ${isActive || isReady ? "text-white" : ""}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isActive || isReady ? "bg-white/20" : "bg-muted"
                }`}>
                  {isReady ? (
                    <QrCode className={`w-6 h-6 ${isActive || isReady ? "text-white" : "text-muted-foreground"}`} />
                  ) : isActive ? (
                    <Wifi className="w-6 h-6 text-white" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{statusInfo.label}</h3>
                  <p className={`${isActive || isReady ? "text-white/80" : "text-muted-foreground"}`}>
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT GRID
          ============================================ */}
      <section className="py-12">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - QR Code & Installation */}
            <div className="space-y-8">
              {/* QR Code Card */}
              <Reveal>
                <div
                  className="relative rounded-3xl overflow-hidden text-white"
                  style={{
                    background: `linear-gradient(135deg, var(--simlak-dark) 0%, #2a2a2a 100%)`,
                  }}
                >
                  {/* Noise texture */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Gradient orb */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--simlak-orange)] rounded-full blur-[80px] opacity-30" />

                  <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[var(--simlak-orange)]/20 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-[var(--simlak-orange)]" />
                      </div>
                      <h2 className="text-xl font-bold">Installation QR Code</h2>
                    </div>

                    <div className="bg-white rounded-2xl p-4 mb-6">
                      {esim.qrCodeUrl ? (
                        <img
                          src={esim.qrCodeUrl}
                          alt="eSIM QR Code"
                          className="w-full max-w-xs mx-auto aspect-square object-contain"
                        />
                      ) : (
                        <div className="w-full max-w-xs mx-auto aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                          <QrCode className="w-20 h-20 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">QR Code unavailable</p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-white/60 text-center mb-6">
                      Scan this QR code with your device's camera to install the eSIM
                    </p>

                    {/* Manual Entry */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                      <p className="text-sm font-semibold text-center text-white/40 uppercase tracking-wider">
                        Or enter manually
                      </p>

                      {esim.smdpAddress && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-white/40">SM-DP+ Address</p>
                            <button
                              onClick={() => copyToClipboard(esim.smdpAddress!, "smdp")}
                              className="flex items-center gap-1 text-xs text-[var(--simlak-orange)] hover:text-[var(--simlak-coral)] transition-colors font-medium"
                            >
                              {copiedField === "smdp" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedField === "smdp" ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <p className="text-sm font-mono break-all text-white/80">{esim.smdpAddress}</p>
                        </div>
                      )}

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-white/40">Activation Code</p>
                          <button
                            onClick={() => copyToClipboard(esim.activationCode, "activation")}
                            className="flex items-center gap-1 text-xs text-[var(--simlak-orange)] hover:text-[var(--simlak-coral)] transition-colors font-medium"
                          >
                            {copiedField === "activation" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedField === "activation" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <p className="text-sm font-mono break-all text-white/80">{esim.activationCode}</p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(esim.activationCode, "activation")}
                        className="w-full py-4 rounded-2xl bg-[var(--simlak-orange)] text-white font-bold text-lg hover:bg-[var(--simlak-coral)] transition-colors"
                      >
                        {copiedField === "activation" ? "Copied to Clipboard!" : "Copy Activation Code"}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Installation Guide */}
              <Reveal delay={100}>
                <div className="bg-card rounded-3xl border border-border p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[var(--simlak-teal)]/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-[var(--simlak-teal)]" />
                    </div>
                    <h2 className="text-xl font-bold">How to Install</h2>
                  </div>

                  <div className="space-y-4">
                    {installationSteps.map((step, i) => (
                      <div key={step.num} className="group flex gap-5 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
                        <div className="flex-shrink-0">
                          <span className="block text-3xl font-black text-[var(--simlak-teal)]/30 group-hover:text-[var(--simlak-teal)]/50 transition-colors">
                            {step.num}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-8">
              {/* Data Usage */}
              <Reveal delay={50}>
                <div className="bg-card rounded-3xl border border-border p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[var(--simlak-orange)]/10 flex items-center justify-center">
                      <Database className="w-5 h-5 text-[var(--simlak-orange)]" />
                    </div>
                    <h2 className="text-xl font-bold">Data Usage</h2>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-4xl font-black">{formatBytes(esim.dataUsed || 0)}</p>
                        <p className="text-sm text-muted-foreground">used</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-muted-foreground">{formatBytes(esim.dataTotal)}</p>
                        <p className="text-sm text-muted-foreground">total</p>
                      </div>
                    </div>

                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          usagePercent > 80
                            ? "bg-gradient-to-r from-red-400 to-red-500"
                            : "bg-gradient-to-r from-[var(--simlak-orange)] to-[var(--simlak-coral)]"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(dataRemaining)} remaining
                      </p>
                      <p className="text-sm font-semibold text-[var(--simlak-teal)]">
                        {(100 - usagePercent).toFixed(0)}% left
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* eSIM Details */}
              <Reveal delay={150}>
                <div className="bg-card rounded-3xl border border-border p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[var(--simlak-yellow)]/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-[var(--simlak-yellow)]" />
                    </div>
                    <h2 className="text-xl font-bold">eSIM Details</h2>
                  </div>

                  <div className="space-y-0">
                    {[
                      { icon: MapPin, label: "Coverage", value: esim.locationName },
                      { icon: Clock, label: "Duration", value: `${esim.duration} days` },
                      { icon: Signal, label: "ICCID", value: esim.iccid, mono: true },
                      { icon: Calendar, label: "Purchased", value: formatDate(esim.createdAt) },
                      ...(esim.expiresAt ? [{ icon: AlertCircle, label: "Expires", value: formatDate(esim.expiresAt) }] : []),
                    ].map((item, i, arr) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between py-4 ${
                          i < arr.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className={`font-medium ${item.mono ? "font-mono text-sm" : ""}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Help Card */}
              <Reveal delay={200}>
                <div
                  className="relative rounded-3xl overflow-hidden text-white"
                  style={{
                    background: `linear-gradient(135deg, var(--simlak-teal) 0%, #2a9d8f 100%)`,
                  }}
                >
                  {/* Noise texture */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Gradient orb */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--simlak-mint)] rounded-full blur-[80px] opacity-40" />

                  <div className="relative p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                        <p className="text-white/80 mb-4">
                          Having trouble with your eSIM? Our support team is here to help 24/7.
                        </p>
                        <Link
                          href="/support"
                          className="inline-flex items-center gap-2 bg-white text-[var(--simlak-dark)] font-bold px-5 py-3 rounded-xl hover:shadow-lg transition-all"
                        >
                          Contact Support
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
