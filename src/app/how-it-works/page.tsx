"use client";

import Link from "next/link";
import {
  Smartphone,
  QrCode,
  Wifi,
  Globe2,
  Zap,
  Shield,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Play,
  Clock,
  Plane,
  Sparkles,
  Check,
  Star,
  Users,
  Award,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Your Destination",
    description: "Browse our 200+ destinations and select the data plan that fits your travel needs. Compare plans by data amount, validity, and price.",
    icon: Globe2,
    color: "orange",
    tips: [
      "Consider how long your trip will be",
      "Think about your data usage habits",
      "Check if you need coverage in multiple countries",
    ],
  },
  {
    number: "02",
    title: "Complete Your Purchase",
    description: "Add the eSIM to your cart and checkout securely. We accept all major credit cards, debit cards, and digital wallets.",
    icon: CreditCard,
    color: "teal",
    tips: [
      "Use the email you check regularly",
      "Your QR code arrives within seconds",
      "Keep your confirmation email safe",
    ],
  },
  {
    number: "03",
    title: "Receive Your QR Code",
    description: "Instantly receive your eSIM QR code via email. You can install it right away or save it for later - your data won't start until you connect.",
    icon: QrCode,
    color: "yellow",
    tips: [
      "Check your spam folder if you don't see the email",
      "Save the QR code as a screenshot",
      "Install before your flight for convenience",
    ],
  },
  {
    number: "04",
    title: "Install the eSIM",
    description: "Scan the QR code using your phone's camera or settings. The installation takes less than a minute and your regular SIM stays active.",
    icon: Smartphone,
    color: "orange",
    tips: [
      "Make sure you have WiFi for installation",
      "Go to Settings > Cellular > Add eSIM",
      "Label it with your destination name",
    ],
  },
  {
    number: "05",
    title: "Connect & Enjoy",
    description: "When you land at your destination, enable data roaming on your eSIM line. You'll be connected to the local network instantly!",
    icon: Wifi,
    color: "teal",
    tips: [
      "Turn on data roaming in settings",
      "Select your eSIM for cellular data",
      "Keep your regular SIM for calls/SMS",
    ],
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Activation",
    description: "No waiting in lines or visiting stores. Get connected in minutes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted with enterprise-grade security.",
  },
  {
    icon: Globe2,
    title: "Global Coverage",
    description: "Stay connected in 200+ countries with reliable networks.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our team is always ready to help, wherever you are.",
  },
];

const compatibleDevices = [
  {
    brand: "Apple",
    models: ["iPhone XS, XS Max, XR", "iPhone 11, 12, 13, 14, 15, 16 series", "iPad Pro, iPad Air (WiFi + Cellular)"],
    logo: "🍎",
  },
  {
    brand: "Samsung",
    models: ["Galaxy S20, S21, S22, S23, S24 series", "Galaxy Z Fold & Z Flip series", "Galaxy Note 20"],
    logo: "📱",
  },
  {
    brand: "Google",
    models: ["Pixel 3, 4, 5, 6, 7, 8, 9 series", "Pixel Fold"],
    logo: "🔷",
  },
  {
    brand: "Others",
    models: ["Motorola Razr", "OPPO Find X3 Pro", "Huawei P40, Mate 40", "Sony Xperia 1 III"],
    logo: "📲",
  },
];

const testimonials = [
  {
    name: "Jessica M.",
    location: "New York, USA",
    text: "So much easier than buying a local SIM. Had data the moment I landed in Tokyo!",
    rating: 5,
  },
  {
    name: "Thomas K.",
    location: "London, UK",
    text: "The setup was incredibly simple. Scanned the QR code and was online in 2 minutes.",
    rating: 5,
  },
  {
    name: "Maria S.",
    location: "Sydney, AU",
    text: "Used it across 5 European countries. Seamless switching, no issues at all.",
    rating: 5,
  },
];

const stats = [
  { value: "2M+", label: "Happy Travelers" },
  { value: "200+", label: "Countries" },
  { value: "4.9", label: "Star Rating" },
  { value: "<2min", label: "Setup Time" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--simlak-orange)] rounded-full blur-[180px] opacity-15" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--simlak-teal)] rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Simple 5-Step Process</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              How <span className="gradient-text">Simlak</span> Works
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Get connected anywhere in the world in just a few minutes. No physical SIM cards, no store visits, no hassle.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/destinations">
                <button className="btn-accent text-lg px-8 py-4 flex items-center gap-2">
                  Get Your eSIM
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-[var(--simlak-dark)] text-white">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-[var(--simlak-orange)]">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 md:left-12 top-32 bottom-0 w-0.5 bg-gradient-to-b from-border via-[var(--simlak-orange)]/30 to-border" />
                )}

                <div className="flex gap-6 md:gap-10 mb-16">
                  {/* Number badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white font-bold text-xl md:text-3xl shadow-lg ${
                      step.color === 'orange' ? 'bg-gradient-to-br from-[var(--simlak-orange)] to-[var(--simlak-coral)]' :
                      step.color === 'teal' ? 'bg-gradient-to-br from-[var(--simlak-teal)] to-[#3db8ab]' :
                      'bg-gradient-to-br from-[var(--simlak-yellow)] to-[#e6c200]'
                    }`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <step.icon className={`w-6 h-6 ${
                        step.color === 'orange' ? 'text-[var(--simlak-orange)]' :
                        step.color === 'teal' ? 'text-[var(--simlak-teal)]' :
                        'text-[var(--simlak-yellow)]'
                      }`} />
                      <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                    </div>

                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                      {step.description}
                    </p>

                    {/* Tips */}
                    <div className="bg-card rounded-2xl border border-border p-5">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--simlak-orange)]" />
                        Pro Tips
                      </p>
                      <ul className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-[var(--simlak-teal)] flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatible Devices */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-teal)]/10 text-[var(--simlak-teal)] text-sm font-medium mb-4">
              <Smartphone className="w-4 h-4" />
              <span>Device Compatibility</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Works With Your Phone</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Most smartphones from 2018 onwards support eSIM technology. Check if your device is compatible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {compatibleDevices.map((device) => (
              <div
                key={device.brand}
                className="bg-background rounded-2xl border border-border p-6 hover:shadow-lg hover:border-[var(--simlak-teal)]/30 transition-all"
              >
                <div className="text-4xl mb-4">{device.logo}</div>
                <h3 className="text-xl font-bold mb-3">{device.brand}</h3>
                <ul className="space-y-2">
                  {device.models.map((model, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-[var(--simlak-teal)] flex-shrink-0 mt-0.5" />
                      <span>{model}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Not sure if your device is compatible?
            </p>
            <Link href="/support">
              <button className="btn-secondary text-sm">
                Check Compatibility
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why eSIM Section */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                <span>Why Choose eSIM</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The smarter way to
                <br />
                <span className="gradient-text">stay connected</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Say goodbye to hunting for local SIM cards, expensive roaming charges, and unreliable pocket WiFi. eSIM is the future of travel connectivity.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="w-12 h-12 rounded-xl bg-[var(--simlak-orange)]/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-[var(--simlak-orange)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Comparison */}
            <div className="relative">
              <div className="bg-card rounded-3xl border border-border p-8 overflow-hidden">
                <h3 className="text-xl font-bold mb-6 text-center">eSIM vs Traditional Options</h3>

                <div className="space-y-4">
                  {[
                    { feature: "Setup Time", esim: "2 minutes", old: "30+ minutes" },
                    { feature: "Available 24/7", esim: true, old: false },
                    { feature: "No Physical Card", esim: true, old: false },
                    { feature: "Keep Your Number", esim: true, old: false },
                    { feature: "Instant Delivery", esim: true, old: false },
                    { feature: "Works Before Landing", esim: true, old: false },
                  ].map((row) => (
                    <div key={row.feature} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <span className="font-medium">{row.feature}</span>
                      <div className="flex items-center gap-8">
                        <div className="w-24 text-center">
                          {typeof row.esim === 'boolean' ? (
                            <CheckCircle2 className={`w-6 h-6 mx-auto ${row.esim ? 'text-[var(--simlak-teal)]' : 'text-muted-foreground/30'}`} />
                          ) : (
                            <span className="text-sm font-medium text-[var(--simlak-teal)]">{row.esim}</span>
                          )}
                        </div>
                        <div className="w-24 text-center">
                          {typeof row.old === 'boolean' ? (
                            <CheckCircle2 className={`w-6 h-6 mx-auto ${row.old ? 'text-[var(--simlak-teal)]' : 'text-muted-foreground/30'}`} />
                          ) : (
                            <span className="text-sm text-muted-foreground">{row.old}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-8 mt-4 pt-4 border-t border-border">
                  <span className="w-24 text-center text-sm font-semibold text-[var(--simlak-orange)]">eSIM</span>
                  <span className="w-24 text-center text-sm text-muted-foreground">Local SIM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-teal)]/10 text-[var(--simlak-teal)] text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>Loved by Travelers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-background rounded-2xl border border-border p-6 hover:shadow-lg transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[var(--simlak-yellow)] text-[var(--simlak-yellow)]" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--simlak-orange)] to-[var(--simlak-coral)] flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--simlak-dark)] to-[#2a2a2a] p-8 md:p-16">
            <div className="absolute inset-0 globe-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--simlak-orange)] rounded-full blur-[150px] opacity-20" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--simlak-teal)] rounded-full blur-[150px] opacity-20" />

            <div className="relative z-10 text-center text-white">
              <Plane className="w-16 h-16 mx-auto mb-6 text-[var(--simlak-orange)]" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready for your next
                <br />
                <span className="text-[var(--simlak-orange)]">adventure?</span>
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-xl mx-auto">
                Get instant eSIM data for 200+ destinations. Stay connected wherever you go.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/destinations">
                  <button className="btn-accent text-lg px-10 py-5 flex items-center gap-2">
                    Browse Destinations
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/support">
                  <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-10 py-5 rounded-full text-lg transition-colors">
                    Contact Support
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
