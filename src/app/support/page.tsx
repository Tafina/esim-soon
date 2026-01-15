"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Smartphone,
  CreditCard,
  Globe2,
  Wifi,
  QrCode,
  Shield,
  Zap,
  ArrowRight,
  Search,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "Getting Started",
    icon: Smartphone,
    questions: [
      {
        q: "What is an eSIM?",
        a: "An eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card. It's built into your device and can be programmed with your carrier information.",
      },
      {
        q: "How do I know if my device supports eSIM?",
        a: "Most smartphones from 2018 onwards support eSIM, including iPhone XS and newer, Samsung Galaxy S20+, Google Pixel 3+, and many more. Check your phone's settings for 'Add eSIM' or 'Add Cellular Plan' option.",
      },
      {
        q: "Can I use eSIM and my physical SIM at the same time?",
        a: "Yes! Most modern phones support Dual SIM functionality. You can keep your regular SIM for calls and texts while using the eSIM for data abroad.",
      },
    ],
  },
  {
    category: "Installation",
    icon: QrCode,
    questions: [
      {
        q: "How do I install my eSIM?",
        a: "After purchase, you'll receive a QR code via email. Go to Settings > Cellular > Add eSIM, then scan the QR code. The eSIM will be installed automatically.",
      },
      {
        q: "When should I install my eSIM?",
        a: "We recommend installing your eSIM before you travel. You can install it anytime after purchase - it won't start using data until you connect to a network in your destination.",
      },
      {
        q: "Can I install the eSIM on multiple devices?",
        a: "No, each eSIM QR code can only be installed on one device. If you need data for multiple devices, please purchase separate eSIMs.",
      },
    ],
  },
  {
    category: "Data & Usage",
    icon: Wifi,
    questions: [
      {
        q: "When does my data plan start?",
        a: "Your plan starts when you first connect to a mobile network in your destination country. The validity period begins from that moment.",
      },
      {
        q: "What happens if I run out of data?",
        a: "You can purchase additional data through our website. The new data will be added to your existing eSIM - no need to install a new one.",
      },
      {
        q: "Can I check my remaining data?",
        a: "Yes, you can check your data usage in your phone's settings under Cellular/Mobile Data. We also send email notifications when you're running low.",
      },
    ],
  },
  {
    category: "Billing & Refunds",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and Apple Pay/Google Pay through our secure Stripe payment system.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes, we offer a 7-day money-back guarantee for unused eSIMs. If you haven't activated your eSIM yet, contact us for a full refund.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use Stripe for payment processing with 256-bit SSL encryption. We never store your full card details on our servers.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start Chat",
    available: "Available 24/7",
    color: "orange",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@simlak.com",
    action: "Send Email",
    available: "Response within 2 hours",
    color: "teal",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "+1 (555) 123-4567",
    action: "Call Now",
    available: "Mon-Fri, 9am-6pm EST",
    color: "yellow",
  },
];

const quickLinks = [
  { icon: Smartphone, title: "Check Device Compatibility", href: "/compatibility" },
  { icon: QrCode, title: "Installation Guide", href: "/how-it-works" },
  { icon: Globe2, title: "Coverage Map", href: "/destinations" },
  { icon: Shield, title: "Refund Policy", href: "/refund" },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-teal)]/10 text-[var(--simlak-teal)] text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              <span>We&apos;re here to help</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              How can we
              <br />
              <span className="gradient-text">help you?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Get answers to your questions or reach out to our friendly support team.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-6 text-lg bg-card border-2 border-border rounded-2xl shadow-lg focus:border-[var(--simlak-teal)] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 md:py-16 bg-card border-y border-border">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="relative bg-background rounded-2xl p-6 border border-border hover:border-transparent hover:shadow-xl transition-all group overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity ${
                  method.color === 'orange' ? 'bg-[var(--simlak-orange)]' :
                  method.color === 'teal' ? 'bg-[var(--simlak-teal)]' :
                  'bg-[var(--simlak-yellow)]'
                }`} />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    method.color === 'orange' ? 'bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)]' :
                    method.color === 'teal' ? 'bg-[var(--simlak-teal)]/10 text-[var(--simlak-teal)]' :
                    'bg-[var(--simlak-yellow)]/10 text-[var(--simlak-yellow)]'
                  }`}>
                    <method.icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{method.title}</h3>
                  <p className="text-muted-foreground mb-4">{method.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {method.available}
                    </span>
                    <button className={`text-sm font-semibold flex items-center gap-1 ${
                      method.color === 'orange' ? 'text-[var(--simlak-orange)]' :
                      method.color === 'teal' ? 'text-[var(--simlak-teal)]' :
                      'text-[var(--simlak-yellow)]'
                    }`}>
                      {method.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 md:py-16">
        <div className="container-wide">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-[var(--simlak-orange)]/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[var(--simlak-orange)]/10 transition-colors">
                  <link.icon className="w-6 h-6 text-muted-foreground group-hover:text-[var(--simlak-orange)] transition-colors" />
                </div>
                <span className="font-medium">{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-card border-y border-border">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[var(--simlak-orange)]/10 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-[var(--simlak-orange)]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Find answers to common questions</p>
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {filteredFaqs.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center gap-2 mb-4">
                    <category.icon className="w-5 h-5 text-[var(--simlak-teal)]" />
                    <h3 className="text-lg font-semibold">{category.category}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.questions.map((faq, index) => {
                      const faqKey = `${category.category}-${index}`;
                      return (
                        <div
                          key={faqKey}
                          className="bg-background rounded-2xl border border-border overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenFaq(openFaq === faqKey ? null : faqKey)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                          >
                            <span className="font-medium pr-4">{faq.q}</span>
                            {openFaq === faqKey ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </button>
                          {openFaq === faqKey && (
                            <div className="px-5 pb-5">
                              <p className="text-muted-foreground">{faq.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn&apos;t find any FAQs matching &quot;{searchQuery}&quot;
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 md:py-16">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--simlak-teal)]/10 text-[var(--simlak-teal)] text-sm font-medium mb-4">
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Still need help?</h2>
              <p className="text-muted-foreground">Send us a message and we&apos;ll get back to you within 2 hours.</p>
            </div>

            {formSubmitted ? (
              <div className="bg-[var(--simlak-teal)]/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--simlak-teal)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We&apos;ll get back to you within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    type="text"
                    placeholder="How can we help?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Tell us more about your issue..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[var(--simlak-teal)] focus:border-transparent"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-[var(--simlak-orange)] hover:bg-[var(--simlak-orange)]/90 text-white text-lg font-semibold rounded-xl"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 md:py-16 bg-card border-t border-border">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--simlak-dark)] to-[#2a2a2a] p-8 md:p-12">
            <div className="absolute inset-0 globe-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--simlak-orange)] rounded-full blur-[100px] opacity-20" />

            <div className="relative z-10 text-center text-white">
              <Zap className="w-12 h-12 mx-auto mb-4 text-[var(--simlak-orange)]" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to get connected?
              </h2>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Browse our destinations and find the perfect eSIM for your next trip.
              </p>
              <Link href="/destinations">
                <button className="btn-accent inline-flex items-center gap-2">
                  Browse Destinations
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
