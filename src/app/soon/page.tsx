"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Mail,
  Check,
  Globe2,
  Zap,
  Shield,
  Sparkles,
  Clock,
  Bell,
} from "lucide-react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const joinWaitlist = useMutation(api.waitlist.join);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      await joinWaitlist({ email });
      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Globe2,
      title: "190+ Countries",
      description: "Global coverage for seamless connectivity",
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Get connected in minutes, not days",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data",
    },
    {
      icon: Sparkles,
      title: "Best Rates",
      description: "Competitive pricing, no hidden fees",
    },
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        ref={heroRef}
        className="relative flex-1 flex flex-col justify-center py-12"
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
          className="absolute top-20 -left-32 w-[600px] h-[600px] rounded-full opacity-25 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-orange)",
            transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`,
          }}
        />
        <div
          className="absolute bottom-20 -right-32 w-[700px] h-[700px] rounded-full opacity-20 blur-[140px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-teal)",
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[100px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-yellow)",
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          }}
        />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] mb-8 animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">Coming Soon</span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-[-0.03em] mb-8 animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              Stay connected
              <br />
              <span className="text-[var(--simlak-orange)]">everywhere</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-slide-up"
              style={{ animationDelay: "400ms" }}
            >
              The future of travel connectivity is almost here. Get instant eSIM
              access for 190+ countries with the best rates and seamless activation.
            </p>

            {/* Email Signup */}
            <div
              className="max-w-md mx-auto mb-16 animate-slide-up"
              style={{ animationDelay: "500ms" }}
            >
              {isSubmitted ? (
                <div
                  className="relative rounded-2xl p-6 text-white overflow-hidden"
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
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">You&apos;re on the list!</p>
                      <p className="text-white/80 text-sm">
                        We&apos;ll notify you when we launch.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative">
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full h-14 pl-14 pr-36 rounded-full bg-card border border-border text-base placeholder:text-muted-foreground focus:outline-none focus:border-[var(--simlak-orange)] focus:ring-2 focus:ring-[var(--simlak-orange)]/20 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-full bg-[var(--simlak-orange)] text-white text-sm font-bold hover:bg-[var(--simlak-coral)] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        "Joining..."
                      ) : (
                        <>
                          Notify Me
                          <Bell className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 mt-3">{error}</p>
                  )}
                  {!error && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Be the first to know when we launch. No spam, we promise.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Feature Pills */}
            <div
              className="flex flex-wrap justify-center gap-3 animate-slide-up"
              style={{ animationDelay: "600ms" }}
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border"
                >
                  <feature.icon className="w-4 h-4 text-[var(--simlak-teal)]" />
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Cards */}
        <div className="absolute top-1/4 -left-20 rotate-[-15deg] opacity-60 hidden xl:block animate-float">
          <div
            className="w-64 h-40 rounded-3xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, var(--simlak-dark) 0%, #2a2a2a 100%)`,
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--simlak-orange)] flex items-center justify-center">
                  <Globe2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold">Japan</span>
              </div>
              <p className="text-2xl font-black">10 GB</p>
              <p className="text-xs text-white/60">30 days validity</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/3 -right-16 rotate-[12deg] opacity-60 hidden xl:block animate-float" style={{ animationDelay: "1s" }}>
          <div
            className="w-64 h-40 rounded-3xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, var(--simlak-teal) 0%, #2a9d8f 100%)`,
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold">Europe Bundle</span>
              </div>
              <p className="text-2xl font-black">20 GB</p>
              <p className="text-xs text-white/60">42 countries included</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-1/4 -translate-x-1/2 rotate-[8deg] opacity-50 hidden xl:block animate-float" style={{ animationDelay: "2s" }}>
          <div
            className="w-56 h-36 rounded-3xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold">USA</span>
              </div>
              <p className="text-2xl font-black">5 GB</p>
              <p className="text-xs text-white/60">7 days validity</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="relative py-8 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Simlak. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/refund"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
