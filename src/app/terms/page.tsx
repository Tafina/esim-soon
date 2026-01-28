import {
  FileText,
  Shield,
  CreditCard,
  Smartphone,
  RefreshCw,
  Scale,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Section {
  id: string;
  icon: LucideIcon;
  title: string;
  content: (string | { type: "bold"; text: string } | { type: "list"; items: string[] })[];
}

const sections: Section[] = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using Simlak's website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services.",
      "These terms apply to all visitors, users, and customers of our platform. We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the service after any changes constitutes acceptance of the new terms.",
    ],
  },
  {
    id: "services",
    icon: Smartphone,
    title: "2. eSIM Services",
    content: [
      "Simlak provides digital eSIM products that allow you to access mobile data services while traveling. Our services include:",
      {
        type: "list",
        items: [
          "Selling eSIM data packages for various destinations worldwide",
          "Delivering eSIM QR codes and activation codes via email",
          "Providing customer support for eSIM installation and usage",
          "Managing your eSIM purchases through your account dashboard",
        ],
      },
      "eSIM services are subject to network coverage and availability in your destination. We partner with local network operators to provide coverage, but cannot guarantee service in all areas.",
    ],
  },
  {
    id: "eligibility",
    icon: CheckCircle2,
    title: "3. Eligibility & Account",
    content: [
      "To use our services, you must:",
      {
        type: "list",
        items: [
          "Be at least 18 years old or have parental/guardian consent",
          "Have a compatible eSIM-enabled device",
          "Provide accurate and complete information during registration",
          "Maintain the security of your account credentials",
        ],
      },
      "You are responsible for all activities that occur under your account. Notify us immediately if you suspect unauthorized access to your account.",
    ],
  },
  {
    id: "purchases",
    icon: CreditCard,
    title: "4. Purchases & Payments",
    content: [
      "All purchases are processed securely through our payment partners. By making a purchase, you agree that:",
      {
        type: "list",
        items: [
          "All payment information provided is accurate and complete",
          "You are authorized to use the payment method",
          "Prices are displayed in USD and include applicable fees",
          "Payment is due at the time of purchase",
        ],
      },
      "We reserve the right to refuse or cancel orders at our discretion, including for suspected fraud or unauthorized transactions. If your order is cancelled, you will receive a full refund.",
    ],
  },
  {
    id: "activation",
    icon: Smartphone,
    title: "5. eSIM Activation & Usage",
    content: [
      "Upon successful purchase, you will receive your eSIM details via email. Please note:",
      {
        type: "list",
        items: [
          "Each eSIM QR code can only be installed on ONE device",
          "Once installed, an eSIM cannot be transferred to another device",
          "Data validity periods begin when you first connect to a network in your destination",
          "eSIMs provide data-only services unless otherwise specified",
          "You must enable data roaming on your eSIM line to use the service",
        ],
      },
      "It is your responsibility to ensure your device is compatible with eSIM technology before purchase. We recommend installing your eSIM before traveling while connected to WiFi.",
    ],
  },
  {
    id: "refunds",
    icon: RefreshCw,
    title: "6. Refunds & Cancellations",
    content: [
      "We offer refunds under the following conditions:",
      { type: "bold", text: "Eligible for refund:" },
      {
        type: "list",
        items: [
          "eSIM has not been installed or activated",
          "Request made within 7 days of purchase",
          "Technical issues preventing installation that cannot be resolved",
        ],
      },
      { type: "bold", text: "Not eligible for refund:" },
      {
        type: "list",
        items: [
          "eSIM has been installed on a device (even if not used)",
          "Data plan has been partially or fully consumed",
          "Validity period has expired",
          "Device incompatibility not verified before purchase",
        ],
      },
      "To request a refund, contact our support team with your order details. Refunds are processed within 5-10 business days to the original payment method.",
    ],
  },
  {
    id: "liability",
    icon: Scale,
    title: "7. Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, Simlak shall not be liable for:",
      {
        type: "list",
        items: [
          "Service interruptions due to network issues beyond our control",
          "Loss of data, revenue, or profits arising from use of our services",
          "Indirect, incidental, or consequential damages",
          "Issues caused by device incompatibility or user error",
          "Third-party actions or network operator limitations",
        ],
      },
      "Our total liability for any claim shall not exceed the amount paid for the specific eSIM product in question. Some jurisdictions do not allow limitations on liability, so these limitations may not apply to you.",
    ],
  },
  {
    id: "prohibited",
    icon: AlertCircle,
    title: "8. Prohibited Uses",
    content: [
      "You agree not to use our services for:",
      {
        type: "list",
        items: [
          "Any unlawful purpose or illegal activities",
          "Violating local laws or regulations in your destination country",
          "Attempting to resell or redistribute eSIM products",
          "Interfering with or disrupting our services or servers",
          "Attempting to gain unauthorized access to our systems",
          "Using automated systems to access our services without permission",
        ],
      },
      "Violation of these terms may result in immediate termination of your account and services without refund.",
    ],
  },
  {
    id: "intellectual",
    icon: Shield,
    title: "9. Intellectual Property",
    content: [
      "All content on the Simlak platform, including but not limited to text, graphics, logos, icons, images, and software, is the property of Simlak or its content suppliers and is protected by international copyright laws.",
      "You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission. The Simlak name, logo, and all related marks are trademarks of Simlak.",
    ],
  },
  {
    id: "privacy",
    icon: Shield,
    title: "10. Privacy & Data Protection",
    content: [
      "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. By using our services, you consent to:",
      {
        type: "list",
        items: [
          "Collection of necessary personal and payment information",
          "Processing of data to fulfill your orders",
          "Communication regarding your purchases and account",
          "Use of cookies and similar technologies",
        ],
      },
      "We do not sell your personal information to third parties. For complete details, please review our Privacy Policy.",
    ],
  },
  {
    id: "termination",
    icon: AlertCircle,
    title: "11. Termination",
    content: [
      "We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe:",
      {
        type: "list",
        items: [
          "Violates these Terms of Service",
          "Is harmful to other users or third parties",
          "Is fraudulent or illegal",
        ],
      },
      "Upon termination, your right to use our services ceases immediately. Any unused eSIM data may be forfeited without refund.",
    ],
  },
  {
    id: "governing",
    icon: Scale,
    title: "12. Governing Law",
    content: [
      "These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of our services shall be resolved through binding arbitration, except where prohibited by law.",
      "You agree to resolve any disputes individually and waive any right to participate in class action lawsuits or class-wide arbitration.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "13. Contact Information",
    content: [
      "If you have any questions about these Terms of Service, please contact us:",
      { type: "bold", text: "Email: support@simlak.net" },
      { type: "bold", text: "Support Hours: 24/7" },
      "We aim to respond to all inquiries within 24 hours.",
    ],
  },
];

function renderContent(content: Section["content"]) {
  return content.map((item, index) => {
    if (typeof item === "string") {
      return (
        <p key={index} className="text-muted-foreground mb-4">
          {item}
        </p>
      );
    }
    if (item.type === "bold") {
      return (
        <p key={index} className="font-semibold text-foreground mb-2">
          {item.text}
        </p>
      );
    }
    if (item.type === "list") {
      return (
        <ul key={index} className="mb-4 space-y-2">
          {item.items.map((listItem, listIndex) => (
            <li key={listIndex} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-(--simlak-teal) mt-1.5">•</span>
              <span>{listItem}</span>
            </li>
          ))}
        </ul>
      );
    }
    return null;
  });
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-(--simlak-orange) rounded-full blur-[180px] opacity-15" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-(--simlak-teal) rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--simlak-teal)/10 text-(--simlak-teal) text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              <span>Legal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Terms of <span className="gradient-text">Service</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto">
              Please read these terms carefully before using our eSIM services.
            </p>

            <p className="text-sm text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-3">
            {sections.slice(0, 6).map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-4 py-2 text-sm rounded-full bg-background border border-border hover:border-(--simlak-teal)/50 hover:text-(--simlak-teal) transition-colors"
              >
                {section.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 md:py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8">
              <p className="text-muted-foreground mb-4">
                Welcome to Simlak. These Terms of Service (&quot;Terms&quot;) govern your use of our website,
                mobile applications, and eSIM services (collectively, the &quot;Services&quot;). By accessing
                or using our Services, you agree to be bound by these Terms. Please read them carefully.
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Legal Entity:</span> These Terms constitute a legally binding agreement between you and Simlak (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-(--simlak-orange)/10 flex items-center justify-center shrink-0">
                      <section.icon className="w-6 h-6 text-(--simlak-orange)" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold pt-2">{section.title}</h2>
                  </div>

                  <div className="ml-0 md:ml-16">
                    {renderContent(section.content)}
                  </div>
                </div>
              ))}
            </div>

            {/* Agreement Notice */}
            <div className="mt-12 bg-(--simlak-teal)/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-(--simlak-teal) flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Your Agreement</h3>
                  <p className="text-muted-foreground">
                    By using Simlak&apos;s services, you acknowledge that you have read, understood, and agree
                    to be bound by these Terms of Service. If you do not agree to these terms, please do
                    not use our services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-12 md:py-16 bg-card border-t border-border">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Our support team is available 24/7 to help answer any questions about our terms or services.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/support">
                <button className="btn-accent flex items-center gap-2">
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/destinations">
                <button className="btn-secondary">
                  Browse Destinations
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
