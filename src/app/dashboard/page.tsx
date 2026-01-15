"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Wifi,
  Signal,
  Clock,
  MapPin,
  ChevronRight,
  Package,
  QrCode,
  Smartphone,
  Globe,
  Globe2,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  Copy,
  Check,
  Activity,
  Timer,
  Database,
  Plane,
  Shield,
  Sparkles,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../../convex/_generated/dataModel";

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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusInfo(status: string): { color: string; bg: string; label: string; icon: typeof CheckCircle2 } {
  switch (status) {
    case "IN_USE":
      return { color: "text-[var(--simlak-teal)]", bg: "bg-[var(--simlak-teal)]/10", label: "Active", icon: Wifi };
    case "GOT_RESOURCE":
      return { color: "text-[var(--simlak-orange)]", bg: "bg-[var(--simlak-orange)]/10", label: "Ready to Install", icon: QrCode };
    case "PAID":
      return { color: "text-amber-600", bg: "bg-amber-50", label: "Processing", icon: Loader2 };
    case "USED_UP":
      return { color: "text-gray-500", bg: "bg-gray-100", label: "Data Used Up", icon: Database };
    case "USED_EXPIRED":
    case "UNUSED_EXPIRED":
      return { color: "text-gray-400", bg: "bg-gray-50", label: "Expired", icon: Clock };
    case "CANCEL":
      return { color: "text-red-500", bg: "bg-red-50", label: "Cancelled", icon: XCircle };
    case "REVOKED":
      return { color: "text-red-600", bg: "bg-red-100", label: "Revoked", icon: XCircle };
    default:
      return { color: "text-amber-600", bg: "bg-amber-50", label: "Pending", icon: Clock };
  }
}

function getTimeRemaining(expiresAt: number): { text: string; urgent: boolean } {
  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) return { text: "Expired", urgent: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return { text: `${days}d ${hours}h remaining`, urgent: days <= 2 };
  }
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${hours}h ${minutes}m remaining`, urgent: true };
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
   TYPE DEFINITIONS
   ============================================== */

interface EsimData {
  _id: Id<"esims">;
  iccid: string;
  packageName: string;
  locationName: string;
  status: string;
  dataTotal: number;
  dataUsed?: number;
  duration: number;
  activationCode: string;
  qrCodeUrl?: string;
  smdpAddress?: string;
  activatedAt?: number;
  expiresAt?: number;
  createdAt: number;
}

interface OrderData {
  _id: Id<"orders">;
  transactionId: string;
  status: string;
  totalAmount: number;
  items: Array<{
    packageName: string;
    locationName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: number;
}

/* ==============================================
   COMPONENTS
   ============================================== */

function ProgressBar({ percentage, urgent = false }: { percentage: number; urgent?: boolean }) {
  return (
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          urgent
            ? "bg-gradient-to-r from-red-400 to-red-500"
            : "bg-gradient-to-r from-[var(--simlak-teal)] to-[var(--simlak-mint)]"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function QRCodeModal({
  esim,
  onClose,
}: {
  esim: EsimData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(esim.activationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full max-w-lg transition-all duration-500 ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        <div className="relative bg-[var(--simlak-dark)] rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden text-white">
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Gradient orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--simlak-orange)] rounded-full blur-[80px] opacity-30" />

          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <XCircle className="w-5 h-5 text-white/60" />
          </button>

          <div className="relative text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-orange)]/20 text-[var(--simlak-orange)] mb-4">
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-semibold">Ready to Install</span>
            </div>
            <h3 className="text-3xl font-black mb-2">{esim.locationName}</h3>
            <p className="text-white/60">{esim.packageName}</p>
          </div>

          {/* QR Code */}
          <div className="relative mx-auto w-56 h-56 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--simlak-orange)]/20 to-[var(--simlak-teal)]/20 rounded-3xl" />
            <div className="relative bg-white rounded-2xl p-3 shadow-lg">
              {esim.qrCodeUrl ? (
                <img
                  src={esim.qrCodeUrl}
                  alt="eSIM QR Code"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Manual Installation */}
          <div className="relative space-y-4">
            <p className="text-center text-sm text-white/40 font-semibold uppercase tracking-wider">Manual Installation</p>

            {esim.smdpAddress && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-white/40 mb-2">SM-DP+ Address</p>
                <p className="text-sm font-mono break-all text-white/80">{esim.smdpAddress}</p>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/40">Activation Code</p>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-xs text-[var(--simlak-orange)] hover:text-[var(--simlak-coral)] transition-colors font-medium"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-sm font-mono break-all text-white/80">{esim.activationCode}</p>
            </div>

            <button
              onClick={copyCode}
              className="w-full py-4 rounded-2xl bg-[var(--simlak-orange)] text-white font-bold text-lg hover:bg-[var(--simlak-coral)] transition-colors"
            >
              {copied ? "Copied to Clipboard!" : "Copy Activation Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EsimCard({
  esim,
  onShowQR,
  onRefresh,
  isRefreshing,
}: {
  esim: EsimData;
  onShowQR: (esim: EsimData) => void;
  onRefresh: (iccid: string) => void;
  isRefreshing: boolean;
}) {
  const usagePercent = esim.dataUsed
    ? Math.min((esim.dataUsed / esim.dataTotal) * 100, 100)
    : 0;
  const dataRemaining = esim.dataTotal - (esim.dataUsed || 0);
  const isActive = esim.status === "IN_USE";
  const isReady = esim.status === "GOT_RESOURCE" || esim.status === "PAID";
  const statusInfo = getStatusInfo(esim.status);
  const timeRemaining = esim.expiresAt ? getTimeRemaining(esim.expiresAt) : null;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="group h-full">
      <div
        className="relative h-full rounded-3xl overflow-hidden text-white"
        style={{
          background: isActive
            ? `linear-gradient(135deg, var(--simlak-teal) 0%, #2a9d8f 100%)`
            : `linear-gradient(135deg, var(--simlak-dark) 0%, #2a2a2a 100%)`,
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
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-30 pointer-events-none"
          style={{ background: isActive ? "var(--simlak-mint)" : "var(--simlak-orange)" }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{esim.locationName}</h3>
                <p className="text-sm text-white/60">{esim.packageName}</p>
              </div>
            </div>
            <button
              onClick={() => onRefresh(esim.iccid)}
              disabled={isRefreshing}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-5 ${
            isActive ? "bg-white/20 text-white" : `${statusInfo.bg} ${statusInfo.color}`
          }`}>
            <StatusIcon className={`w-4 h-4 ${statusInfo.label === "Processing" ? "animate-spin" : ""}`} />
            {statusInfo.label}
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
          </div>

          {/* Data Usage */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Data Usage</span>
              <span className="font-semibold">{formatBytes(esim.dataUsed || 0)} / {formatBytes(esim.dataTotal)}</span>
            </div>
            <ProgressBar percentage={usagePercent} urgent={usagePercent > 80} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Database className="w-4 h-4 mx-auto mb-1 text-white/60" />
              <p className="text-xs text-white/60">Remaining</p>
              <p className="font-semibold text-sm">{formatBytesShort(dataRemaining)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-white/60" />
              <p className="text-xs text-white/60">Duration</p>
              <p className="font-semibold text-sm">{esim.duration} days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Signal className="w-4 h-4 mx-auto mb-1 text-white/60" />
              <p className="text-xs text-white/60">Status</p>
              <p className={`font-semibold text-sm ${isActive ? "text-[var(--simlak-mint)]" : "text-white/60"}`}>
                {isActive ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Time Remaining */}
          {timeRemaining && (
            <div className={`flex items-center gap-2 text-sm mb-4 ${timeRemaining.urgent ? "text-red-300" : "text-white/60"}`}>
              <Timer className="w-4 h-4" />
              {timeRemaining.text}
            </div>
          )}

          {/* Action */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => onShowQR(esim)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-[var(--simlak-dark)] font-bold hover:bg-white/90 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {isReady ? "Install eSIM" : "View QR Code"}
            </button>
            <Link
              href={`/dashboard/esim/${esim._id}`}
              className="w-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderData }) {
  const statusColors: Record<string, string> = {
    fulfilled: "text-[var(--simlak-teal)] bg-[var(--simlak-teal)]/10",
    failed: "text-red-500 bg-red-50",
    refunded: "text-red-500 bg-red-50",
    processing: "text-amber-600 bg-amber-50",
    paid: "text-[var(--simlak-orange)] bg-[var(--simlak-orange)]/10",
    pending: "text-gray-500 bg-gray-100",
  };

  return (
    <div className="group bg-card rounded-2xl border border-border p-5 hover:border-[var(--simlak-teal)]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-sm font-semibold">{order.transactionId}</p>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <p className="text-xl font-bold">${(order.totalAmount / 100).toFixed(2)}</p>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm py-2 border-t border-border first:border-0 first:pt-0"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{item.locationName}</span>
              {item.quantity > 1 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">x{item.quantity}</span>
              )}
            </div>
            <span className="font-medium">${(item.price / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        statusColors[order.status] || statusColors.pending
      }`}>
        {order.status === "fulfilled" && <CheckCircle2 className="w-3 h-3" />}
        {order.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </div>
    </div>
  );
}

/* ==============================================
   MAIN DASHBOARD PAGE
   ============================================== */

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [selectedEsim, setSelectedEsim] = useState<EsimData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingIccid, setRefreshingIccid] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

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

  const esims = useQuery(
    api.orders.getUserEsimsByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  ) as EsimData[] | undefined;

  const orders = useQuery(
    api.orders.getUserOrdersByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  ) as OrderData[] | undefined;

  const refreshAllEsims = useAction(api.ordersActions.refreshAllUserEsims);
  const refreshSingleEsim = useAction(api.ordersActions.refreshEsimStatus);

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshAllEsims({ clerkId: user.id });
    } catch (error) {
      console.error("Failed to refresh eSIMs:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshSingle = async (iccid: string) => {
    if (refreshingIccid) return;
    setRefreshingIccid(iccid);
    try {
      await refreshSingleEsim({ iccid });
    } catch (error) {
      console.error("Failed to refresh eSIM:", error);
    } finally {
      setRefreshingIccid(null);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--simlak-orange)] mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen overflow-hidden">
        {/* Background */}
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
          <div
            className="absolute bottom-20 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] pointer-events-none"
            style={{ background: "var(--simlak-teal)" }}
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
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-[-0.03em]">
              Sign in to view your <span className="text-[var(--simlak-orange)]">eSIMs</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
              Access your dashboard to manage your eSIMs, view usage, and track order history.
            </p>
            <Link
              href="/sign-in"
              className="group inline-flex items-center gap-3 bg-[var(--simlak-dark)] text-white font-bold text-lg px-8 py-4 rounded-full hover:shadow-2xl transition-all"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeEsims = esims?.filter(
    (e) => e.status === "IN_USE" || e.status === "GOT_RESOURCE"
  );
  const totalDataUsed = esims?.reduce((sum, e) => sum + (e.dataUsed || 0), 0) || 0;
  const totalDataTotal = esims?.reduce((sum, e) => sum + e.dataTotal, 0) || 0;
  const hasEsims = esims && esims.length > 0;
  const hasOrders = orders && orders.length > 0;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[50vh] flex flex-col justify-end pt-24 pb-16"
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
          className="absolute bottom-0 -right-32 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-teal)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />

        <div className="container-wide relative z-10">
          {/* Eyebrow */}
          <div className="mb-6 overflow-hidden">
            <div
              className="flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="h-px w-12 bg-[var(--simlak-orange)]" />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--simlak-teal)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--simlak-teal)]"></span>
                </span>
                Dashboard
              </span>
            </div>
          </div>

          {/* Main Title */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-[-0.03em] mb-8 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            Welcome back,
            <br />
            <span className="text-[var(--simlak-orange)]">{user.firstName || "Traveler"}</span>
          </h1>

          {/* Stats Row */}
          <div
            className="flex flex-wrap gap-4 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-[var(--simlak-teal)]/10 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[var(--simlak-teal)]" />
              </div>
              <div>
                <p className="text-2xl font-black">{activeEsims?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Active eSIMs</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-[var(--simlak-orange)]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--simlak-orange)]" />
              </div>
              <div>
                <p className="text-2xl font-black">{formatBytesShort(totalDataUsed)}</p>
                <p className="text-xs text-muted-foreground">Data Used</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-[var(--simlak-yellow)]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[var(--simlak-yellow)]" />
              </div>
              <div>
                <p className="text-2xl font-black">{orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MY ESIMS SECTION
          ============================================ */}
      <section className="py-16 bg-[var(--simlak-dark)] text-white">
        <div className="container-wide">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <div>
                <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Your eSIMs
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  My <span className="text-[var(--simlak-teal)]">eSIMs</span>
                </h2>
                <p className="text-white/60 mt-3">
                  {hasEsims
                    ? `${esims.length} eSIM${esims.length > 1 ? "s" : ""} in your account`
                    : "No eSIMs yet - get your first one below!"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {hasEsims && (
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Syncing..." : "Sync All"}
                  </button>
                )}
                <Link
                  href="/destinations"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--simlak-orange)] text-white text-sm font-bold hover:bg-[var(--simlak-coral)] transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Get New eSIM
                </Link>
              </div>
            </div>
          </Reveal>

          {hasEsims ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {esims.map((esim, index) => (
                <Reveal key={esim._id} delay={index * 100}>
                  <EsimCard
                    esim={esim}
                    onShowQR={setSelectedEsim}
                    onRefresh={handleRefreshSingle}
                    isRefreshing={refreshingIccid === esim.iccid}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div
                className="relative rounded-3xl overflow-hidden p-16 text-center"
                style={{
                  background: `linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(78,205,196,0.1) 100%)`,
                }}
              >
                {/* Noise texture */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />

                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
                    }}
                  >
                    <Package className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">No eSIMs Yet</h3>
                  <p className="text-white/60 mb-8 max-w-md mx-auto text-lg">
                    Get your first eSIM and experience seamless connectivity wherever your travels take you.
                  </p>
                  <Link
                    href="/destinations"
                    className="group inline-flex items-center gap-3 bg-white text-[var(--simlak-dark)] font-bold text-lg px-8 py-4 rounded-full hover:shadow-2xl transition-all"
                  >
                    Browse Destinations
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ============================================
          ORDER HISTORY SECTION
          ============================================ */}
      <section className="py-20">
        <div className="container-wide">
          <Reveal>
            <div className="mb-10">
              <span className="text-[var(--simlak-teal)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Purchase History
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Order <span className="text-[var(--simlak-orange)]">History</span>
              </h2>
              <p className="text-muted-foreground mt-3">
                {hasOrders
                  ? `${orders.length} order${orders.length > 1 ? "s" : ""}`
                  : "No orders yet"}
              </p>
            </div>
          </Reveal>

          {hasOrders ? (
            <div className="grid md:grid-cols-2 gap-4">
              {orders.map((order, index) => (
                <Reveal key={order._id} delay={index * 100}>
                  <OrderCard order={order} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="relative rounded-2xl bg-card border border-border p-12 text-center">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Plane className="w-6 h-6" />
                  <p className="text-lg">Your order history will appear here once you make a purchase.</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ============================================
          QUICK LINKS SECTION
          ============================================ */}
      <section className="py-20 bg-card">
        <div className="container-wide">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Quick Actions
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Need <span className="text-[var(--simlak-teal)]">something?</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Globe2,
                title: "Browse Destinations",
                desc: "Find eSIMs for 190+ countries",
                href: "/destinations",
                color: "orange",
              },
              {
                icon: Sparkles,
                title: "Regional Bundles",
                desc: "Multi-country eSIM packages",
                href: "/bundles",
                color: "teal",
              },
              {
                icon: HelpCircle,
                title: "How It Works",
                desc: "Learn about eSIM technology",
                href: "/how-it-works",
                color: "yellow",
              },
              {
                icon: Shield,
                title: "Get Support",
                desc: "24/7 customer assistance",
                href: "/support",
                color: "coral",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 100}>
                <Link
                  href={item.href}
                  className="group block p-6 rounded-2xl border border-border hover:border-transparent hover:shadow-xl transition-all bg-background"
                >
                  <div
                    className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                      item.color === "orange"
                        ? "bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)]"
                        : item.color === "teal"
                        ? "bg-[var(--simlak-teal)]/10 text-[var(--simlak-teal)]"
                        : item.color === "yellow"
                        ? "bg-[var(--simlak-yellow)]/10 text-[var(--simlak-yellow)]"
                        : "bg-[var(--simlak-coral)]/10 text-[var(--simlak-coral)]"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--simlak-orange)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {selectedEsim && (
        <QRCodeModal esim={selectedEsim} onClose={() => setSelectedEsim(null)} />
      )}
    </div>
  );
}

// Missing import
function HelpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
