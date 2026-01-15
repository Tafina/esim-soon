"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import Link from "next/link";

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

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { sessionId, updateQuantity, removeFromCart } = useCart();

  const cart = useQuery(
    api.cart.getCart,
    sessionId ? { sessionId } : "skip"
  );

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 bg-[var(--simlak-cream)] border-l border-border">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border bg-white">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--simlak-orange)] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">Your Cart</span>
                {itemCount > 0 && (
                  <p className="text-sm text-muted-foreground font-normal">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6 py-12">
            <div className="w-28 h-28 rounded-full bg-white border-2 border-dashed border-border flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-bold text-xl mb-2">Your cart is empty</p>
              <p className="text-muted-foreground">
                Explore our destinations and find<br />the perfect eSIM for your trip
              </p>
            </div>
            <Link href="/destinations" onClick={() => onOpenChange(false)}>
              <button className="btn-primary flex items-center gap-2">
                Browse Destinations
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.packageCode}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-border/50"
                  >
                    {/* Top row: Flag, Name, Remove */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--simlak-orange)]/10 to-[var(--simlak-teal)]/10 flex items-center justify-center text-2xl shrink-0">
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
                        <p className="font-bold text-[15px] truncate">{item.package.locationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(item.package.volume)} · {item.package.duration} days
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.packageCode)}
                        className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom row: Quantity, Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.packageCode, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.packageCode, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-[var(--simlak-orange)]">
                          {formatPrice(item.subtotal)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.package.retailPrice)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-border px-6 py-5 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-[var(--simlak-teal)] font-medium">Instant (Free)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-[var(--simlak-orange)]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" onClick={() => onOpenChange(false)} className="block">
                <button className="w-full h-14 rounded-full bg-[var(--simlak-dark)] hover:bg-[var(--simlak-dark)]/90 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5">
                  <Sparkles className="w-5 h-5" />
                  Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Secure checkout · Instant delivery</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
