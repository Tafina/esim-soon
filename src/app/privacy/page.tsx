import {
  FileText,
  Shield,
  Database,
  Lock,
  Eye,
  Share2,
  Cookie,
  Mail,
  CheckCircle2,
  Globe,
  UserCheck,
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
    id: "introduction",
    icon: Shield,
    title: "1. Introduction",
    content: [
      "Simlak (\"Company\", \"we\", \"us\", or \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our eSIM services.",
      "Please read this Privacy Policy carefully. By using our Services, you consent to the collection and use of your information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access our Services.",
    ],
  },
  {
    id: "collection",
    icon: Database,
    title: "2. Information We Collect",
    content: [
      { type: "bold", text: "Personal Information:" },
      "We may collect personal information that you voluntarily provide to us when you:",
      {
        type: "list",
        items: [
          "Register for an account",
          "Make a purchase",
          "Subscribe to our newsletter",
          "Contact our support team",
          "Participate in promotions or surveys",
        ],
      },
      { type: "bold", text: "Types of personal information collected:" },
      {
        type: "list",
        items: [
          "Name and email address",
          "Billing address and payment information",
          "Phone number (optional)",
          "Device information for eSIM compatibility",
          "Communication preferences",
        ],
      },
      { type: "bold", text: "Automatically Collected Information:" },
      "When you access our Services, we automatically collect certain information including:",
      {
        type: "list",
        items: [
          "IP address and browser type",
          "Device identifiers and operating system",
          "Pages visited and time spent on our website",
          "Referring website addresses",
          "Geographic location (country/region level)",
        ],
      },
    ],
  },
  {
    id: "use",
    icon: Eye,
    title: "3. How We Use Your Information",
    content: [
      "We use the information we collect for the following purposes:",
      {
        type: "list",
        items: [
          "Process and fulfill your eSIM orders",
          "Send order confirmations, QR codes, and activation instructions",
          "Provide customer support and respond to inquiries",
          "Send promotional communications (with your consent)",
          "Improve our website and services",
          "Detect and prevent fraud or unauthorized access",
          "Comply with legal obligations",
          "Analyze usage patterns to enhance user experience",
        ],
      },
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "4. Information Sharing",
    content: [
      "We do not sell your personal information to third parties. We may share your information only in the following circumstances:",
      { type: "bold", text: "Service Providers:" },
      {
        type: "list",
        items: [
          "Payment processors for secure transactions",
          "eSIM network providers to fulfill your orders",
          "Email service providers for communications",
          "Analytics providers to improve our services",
        ],
      },
      { type: "bold", text: "Legal Requirements:" },
      "We may disclose your information if required by law, court order, or government request, or to protect our rights, privacy, safety, or property.",
      { type: "bold", text: "Business Transfers:" },
      "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "5. Cookies & Tracking Technologies",
    content: [
      "We use cookies and similar tracking technologies to enhance your experience:",
      { type: "bold", text: "Essential Cookies:" },
      "Required for basic website functionality, including shopping cart and checkout processes.",
      { type: "bold", text: "Analytics Cookies:" },
      "Help us understand how visitors interact with our website to improve user experience.",
      { type: "bold", text: "Marketing Cookies:" },
      "Used to deliver relevant advertisements and track campaign effectiveness (only with your consent).",
      "You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.",
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "6. Data Security",
    content: [
      "We implement industry-standard security measures to protect your personal information:",
      {
        type: "list",
        items: [
          "SSL/TLS encryption for all data transmission",
          "Secure payment processing through PCI-compliant providers",
          "Regular security audits and vulnerability assessments",
          "Access controls and authentication requirements",
          "Employee training on data protection practices",
        ],
      },
      "While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.",
    ],
  },
  {
    id: "retention",
    icon: Database,
    title: "7. Data Retention",
    content: [
      "We retain your personal information for as long as necessary to:",
      {
        type: "list",
        items: [
          "Provide our services to you",
          "Comply with legal obligations",
          "Resolve disputes and enforce agreements",
          "Maintain accurate business records",
        ],
      },
      "Account information is retained for the duration of your account. Transaction records are kept for 7 years for tax and legal compliance. You may request deletion of your data at any time, subject to legal retention requirements.",
    ],
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "8. Your Privacy Rights",
    content: [
      "Depending on your location, you may have the following rights regarding your personal information:",
      {
        type: "list",
        items: [
          "Access: Request a copy of the personal information we hold about you",
          "Correction: Request correction of inaccurate or incomplete information",
          "Deletion: Request deletion of your personal information",
          "Portability: Receive your data in a structured, machine-readable format",
          "Opt-out: Unsubscribe from marketing communications at any time",
          "Restriction: Request limitation of processing in certain circumstances",
        ],
      },
      "To exercise any of these rights, please contact us at support@simlak.net. We will respond to your request within 30 days.",
    ],
  },
  {
    id: "international",
    icon: Globe,
    title: "9. International Data Transfers",
    content: [
      "Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.",
      "When we transfer data internationally, we implement appropriate safeguards including:",
      {
        type: "list",
        items: [
          "Standard contractual clauses approved by relevant authorities",
          "Data processing agreements with service providers",
          "Compliance with applicable data protection frameworks",
        ],
      },
    ],
  },
  {
    id: "children",
    icon: Shield,
    title: "10. Children's Privacy",
    content: [
      "Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.",
      "If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information promptly. If you believe we may have collected information from a child, please contact us immediately.",
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "11. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.",
      "When we make material changes, we will:",
      {
        type: "list",
        items: [
          "Update the \"Last updated\" date at the top of this policy",
          "Notify you via email or prominent notice on our website",
          "Obtain your consent where required by law",
        ],
      },
      "We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "12. Contact Us",
    content: [
      "If you have questions or concerns about this Privacy Policy or our data practices, please contact us:",
      { type: "bold", text: "Email: support@simlak.net" },
      { type: "bold", text: "Response Time: Within 48 hours" },
      "For data protection inquiries, please include \"Privacy\" in your subject line to ensure prompt handling.",
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

export default function PrivacyPage() {
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
              <Shield className="w-4 h-4" />
              <span>Legal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Privacy <span className="gradient-text">Policy</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto">
              How we collect, use, and protect your personal information.
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

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8">
              <p className="text-muted-foreground mb-4">
                At Simlak, we take your privacy seriously. This Privacy Policy describes how we handle your personal information when you use our website and eSIM services.
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Legal Entity:</span> This policy applies to Simlak (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) and all services provided through simlak.net.
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
                  <h3 className="text-lg font-bold mb-2">Your Privacy Matters</h3>
                  <p className="text-muted-foreground">
                    By using Simlak&apos;s services, you acknowledge that you have read and understood this Privacy Policy. We are committed to protecting your personal information and being transparent about our data practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
