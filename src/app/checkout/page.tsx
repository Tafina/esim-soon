"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/providers/cart-provider";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Loader2, Mail, ShoppingBag, CheckCircle, AlertCircle, LogIn, User } from "lucide-react";
import { useState } from "react";

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

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { sessionId } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"checkout" | "processing" | "fulfilling">("checkout");

  const cart = useQuery(
    api.cart.getCart,
    sessionId ? { sessionId } : "skip"
  );

  const createOrderFromCart = useMutation(api.orders.createOrderFromCart);
  const fulfillOrder = useAction(api.ordersActions.fulfillOrder);

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  // Get email from signed in user
  const customerEmail = user?.primaryEmailAddress?.emailAddress || "";

  const handleCheckout = async () => {
    if (!customerEmail) {
      setError("Please enter your email address");
      return;
    }

    if (!sessionId) {
      setError("Session not found");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStep("processing");

    try {
      // Create order from cart
      const orderResult = await createOrderFromCart({
        sessionId,
        customerEmail,
        clerkId: user?.id,
      });

      setStep("fulfilling");

      // Fulfill order (calls eSIM Access API)
      const fulfillResult = await fulfillOrder({
        orderId: orderResult.orderId,
      });

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderResult.orderId}&transactionId=${orderResult.transactionId}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during checkout");
      setIsProcessing(false);
      setStep("checkout");
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--simlak-orange)] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add an eSIM to get started</p>
          <Link href="/destinations">
            <button className="btn-accent text-base px-6 py-3">
              Browse Destinations
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Not signed in state - require login
  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-20">
        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute top-20 right-[10%] w-72 h-72 bg-[var(--simlak-orange)] rounded-full blur-[120px] opacity-10" />
          <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-[var(--simlak-teal)] rounded-full blur-[150px] opacity-10" />
        </div>

        <div className="container-tight relative z-10 py-8 md:py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl icon-container-orange mx-auto mb-6">
              <User className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Sign in to continue</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to your account to complete your purchase. Your cart items will be saved.
            </p>

            {/* Cart Preview */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Your Cart ({items.length} item{items.length > 1 ? "s" : ""})
              </h3>
              <div className="space-y-3">
                {items.slice(0, 3).map((item) => (
                  <div key={item.packageCode} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.package.locationName} · {formatBytes(item.package.volume)}
                    </span>
                    <span className="font-medium">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{items.length - 3} more items</p>
                )}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-[var(--simlak-orange)]">{formatPrice(total)}</span>
              </div>
            </div>

            <SignInButton mode="modal" forceRedirectUrl="/checkout">
              <button className="btn-accent w-full text-base py-4 flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In to Checkout
              </button>
            </SignInButton>

            <p className="text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up?redirect_url=/checkout" className="text-[var(--simlak-orange)] hover:underline font-medium">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--simlak-orange)]/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-[var(--simlak-orange)] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {step === "processing" ? "Processing your order..." : "Activating your eSIM..."}
          </h1>
          <p className="text-muted-foreground mb-6">
            {step === "processing"
              ? "Creating your order and preparing payment"
              : "Connecting to eSIM network and generating your QR code"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step === "processing" ? "bg-[var(--simlak-orange)]" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step === "fulfilling" ? "bg-[var(--simlak-orange)]" : "bg-muted"}`} />
            <div className="w-3 h-3 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-[var(--simlak-orange)] rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-[var(--simlak-teal)] rounded-full blur-[150px] opacity-10" />
      </div>

      <div className="container-wide relative z-10 py-8 md:py-12">
        {/* Header */}
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Checkout
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Form */}
          <div className="space-y-6">
            {/* Email */}
            <div className="feature-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-3">
                <div className="icon-container icon-container-orange">
                  <Mail className="w-5 h-5" />
                </div>
                Contact Information
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;ll send your eSIM QR code to this email address
              </p>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">{customerEmail}</p>
                  <p className="text-sm text-muted-foreground">Signed in as {user?.firstName || "User"}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="feature-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-3">
                <div className="icon-container icon-container-teal">
                  <Lock className="w-5 h-5" />
                </div>
                Payment
              </h2>
              <div className="bg-muted rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Demo Mode - No payment required
                </p>
                <p className="text-xs text-muted-foreground">
                  Your eSIM will be provisioned immediately
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-accent w-full text-base py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={!customerEmail || isProcessing}
            >
              <Lock className="w-4 h-4" />
              Complete Order - {formatPrice(total)}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              By completing your purchase, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div className="feature-card sticky top-24">
              <h2 className="text-lg font-semibold mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.packageCode} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                      {item.package.locationCode === "US" ? "🇺🇸" :
                       item.package.locationCode === "GB" ? "🇬🇧" :
                       item.package.locationCode === "JP" ? "🇯🇵" :
                       item.package.locationCode === "FR" ? "🇫🇷" :
                       item.package.locationCode === "DE" ? "🇩🇪" :
                       item.package.locationCode === "IT" ? "🇮🇹" :
                       item.package.locationCode === "ES" ? "🇪🇸" :
                       item.package.locationCode === "AU" ? "🇦🇺" :
                       item.package.locationCode === "CA" ? "🇨🇦" :
                       item.package.locationCode === "KR" ? "🇰🇷" :
                       item.package.locationCode === "TH" ? "🇹🇭" :
                       item.package.locationCode === "SG" ? "🇸🇬" : "🌍"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.package.locationName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(item.package.volume)} · {item.package.duration} days
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--simlak-orange)]">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing fee</span>
                  <span className="text-[var(--simlak-teal)]">Free</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-[var(--simlak-orange)]">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Instant delivery:</strong> Your eSIM QR code will be ready immediately after completing your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
