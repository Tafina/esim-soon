import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { UserSync } from "@/components/providers/user-sync";
import { Navbar } from "@/components/navbar";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const montserratDisplay = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Simlak - Instant eSIM for Global Travel",
  description: "Get instant 5G mobile data in 200+ countries. No physical SIM needed. Activate in seconds and stay connected anywhere.",
  keywords: ["eSIM", "travel", "mobile data", "international roaming", "travel SIM", "5G", "global connectivity"],
  openGraph: {
    title: "Simlak - Instant eSIM for Global Travel",
    description: "Get instant 5G mobile data in 200+ countries. No physical SIM needed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${montserrat.variable} ${montserratDisplay.variable} antialiased min-h-screen`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <UserSync />
            <CartProvider>
              <Navbar />
              <main>
                {children}
              </main>
            </CartProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
