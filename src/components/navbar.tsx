"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  Wifi,
  User,
  LogOut,
  Settings,
  CreditCard,
  ChevronDown,
  Smartphone,
  Globe2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from "@clerk/nextjs";
import { useCart } from "@/components/providers/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";

const navLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/bundles", label: "Bundles" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/support", label: "Support" },
];

function UserDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!user) return null;

  const userInitials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.firstName
    ? user.firstName[0]
    : user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U";

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : "User";

  const menuItems = [
    { href: "/dashboard", label: "My eSIMs", icon: Smartphone },
    { href: "/dashboard", label: "Order History", icon: CreditCard },
    { href: "/support", label: "Get Support", icon: HelpCircle },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-card border border-border hover:border-[var(--simlak-orange)]/30 transition-all group"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
            }}
          >
            {userInitials}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-slide-up"
          style={{ animationDuration: "150ms" }}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
                  }}
                >
                  {userInitials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-border">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on certain pages
  const hideNavbarPaths = ["/terms", "/privacy"];
  if (hideNavbarPaths.includes(pathname)) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
                }}
              >
                <Wifi className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight">Simlak</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-full ${
                    pathname === link.href
                      ? "text-[var(--simlak-orange)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--simlak-orange)]" />
                  )}
                </Link>
              ))}
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-full ${
                    pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                      ? "text-[var(--simlak-orange)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  My eSIMs
                  {(pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--simlak-orange)]" />
                  )}
                </Link>
              </SignedIn>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative h-10 w-10 rounded-full bg-card border border-border hover:border-[var(--simlak-orange)]/30 flex items-center justify-center transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--simlak-orange)] text-white text-xs font-bold flex items-center justify-center animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hidden md:flex items-center gap-2 h-10 px-5 rounded-full bg-[var(--simlak-dark)] text-white text-sm font-bold hover:bg-[var(--simlak-dark)]/90 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="hidden md:block">
                  <UserDropdown />
                </div>
              </SignedIn>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-10 w-10 rounded-full bg-card border border-border hover:border-[var(--simlak-orange)]/30 flex items-center justify-center transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-slide-up">
            <div className="container-wide py-6">
              {/* User Info (Mobile) */}
              <SignedIn>
                {user && (
                  <div className="flex items-center gap-3 pb-6 mb-6 border-b border-border">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.firstName || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{
                          background: `linear-gradient(135deg, var(--simlak-orange) 0%, var(--simlak-coral) 100%)`,
                        }}
                      >
                        {user.firstName?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-bold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                )}
              </SignedIn>

              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl text-base font-semibold transition-colors ${
                      pathname === link.href
                        ? "text-[var(--simlak-orange)] bg-[var(--simlak-orange)]/10"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.href === "/destinations" && <Globe2 className="w-5 h-5" />}
                    {link.href === "/bundles" && <Sparkles className="w-5 h-5" />}
                    {link.href === "/how-it-works" && <HelpCircle className="w-5 h-5" />}
                    {link.href === "/support" && <Settings className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
                <SignedIn>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl text-base font-semibold transition-colors ${
                      pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                        ? "text-[var(--simlak-orange)] bg-[var(--simlak-orange)]/10"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    My eSIMs
                  </Link>
                </SignedIn>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 mt-6 border-t border-border space-y-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4 rounded-xl bg-[var(--simlak-dark)] text-white text-base font-bold"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/destinations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-4 rounded-xl bg-[var(--simlak-orange)] text-white text-center text-base font-bold"
                  >
                    Browse eSIMs
                  </Link>
                  <MobileSignOutButton onSignOut={() => setMobileMenuOpen(false)} />
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}

function MobileSignOutButton({ onSignOut }: { onSignOut: () => void }) {
  const { signOut } = useClerk();

  return (
    <button
      onClick={() => {
        onSignOut();
        signOut();
      }}
      className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-border text-base font-semibold text-muted-foreground hover:bg-muted transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
