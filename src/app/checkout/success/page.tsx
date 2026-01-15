"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  QrCode,
  Mail,
  Smartphone,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  Globe,
} from "lucide-react";
import { useState, Suspense } from "react";

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return gb % 1 === 0 ? `${gb}GB` : `${gb.toFixed(1)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${Math.round(mb)}MB`;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const transactionId = searchParams.get("transactionId");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const order = useQuery(
    api.orders.getOrder,
    orderId ? { orderId: orderId as Id<"orders"> } : "skip"
  );

  const esims = useQuery(
    api.orders.getOrderEsims,
    orderId ? { orderId: orderId as Id<"orders"> } : "skip"
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link href="/destinations" className="btn-accent inline-block">
            Browse Destinations
          </Link>
        </div>
      </div>
    );
  }

  if (order === undefined || esims === undefined) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--simlak-orange)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container-tight">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your eSIM{esims && esims.length > 1 ? "s are" : " is"} ready to install
          </p>
          <p className="text-sm text-muted-foreground">
            Order #{transactionId}
          </p>
        </div>

        {/* eSIM Cards */}
        {esims && esims.length > 0 ? (
          <div className="space-y-6 mb-12">
            {esims.map((esim, index) => (
              <div
                key={esim._id}
                className="bg-card rounded-3xl border border-border overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      <div className="bg-white rounded-2xl p-4 w-48 h-48 mx-auto md:mx-0">
                        {esim.qrCodeUrl ? (
                          <img
                            src={esim.qrCodeUrl}
                            alt="eSIM QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                            <QrCode className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--simlak-orange)] to-[var(--simlak-coral)] flex items-center justify-center text-white">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{esim.locationName}</h3>
                              <p className="text-sm text-muted-foreground">{esim.packageName}</p>
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Ready to Install
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">Data</p>
                          <p className="font-semibold">{formatBytes(esim.dataTotal)}</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-xs text-muted-foreground mb-1">Duration</p>
                          <p className="font-semibold">{esim.duration} days</p>
                        </div>
                      </div>

                      {/* Activation Code */}
                      <div className="bg-muted rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">Activation Code</p>
                          <button
                            onClick={() => copyToClipboard(esim.activationCode, esim._id)}
                            className="text-[var(--simlak-orange)] hover:opacity-70 transition-opacity"
                          >
                            {copiedCode === esim._id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-mono break-all">{esim.activationCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border p-4 bg-muted/30 flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/esim/${esim._id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--simlak-orange)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <QrCode className="w-4 h-4" />
                    View Installation Guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border p-8 text-center mb-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--simlak-orange)] mx-auto mb-4" />
            <p className="text-muted-foreground">Preparing your eSIM...</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-[var(--simlak-orange)]/5 to-[var(--simlak-teal)]/5 rounded-3xl border border-border p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Next Steps</h2>
          <div className="space-y-4">
            {[
              {
                icon: Smartphone,
                title: "Open Settings on your device",
                desc: "Go to Settings > Cellular/Mobile Data > Add eSIM",
              },
              {
                icon: QrCode,
                title: "Scan the QR code",
                desc: "Use your camera to scan the QR code above",
              },
              {
                icon: CheckCircle,
                title: "Activate when you arrive",
                desc: "Turn on the eSIM when you reach your destination",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--simlak-orange)] text-white flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-muted rounded-2xl p-6 flex items-start gap-4 mb-8">
          <Mail className="w-6 h-6 text-[var(--simlak-teal)] shrink-0" />
          <div>
            <p className="font-medium mb-1">Confirmation email sent</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent your eSIM details to {order?.customerEmail}. Check your inbox for the QR code and installation instructions.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="btn-accent inline-flex items-center justify-center gap-2"
          >
            Go to My eSIMs
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/destinations"
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            Browse More Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--simlak-orange)]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
