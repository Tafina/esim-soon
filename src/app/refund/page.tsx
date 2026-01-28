import {
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Mail,
  AlertCircle,
  HelpCircle,
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
    id: "overview",
    icon: RefreshCw,
    title: "1. Refund Policy Overview",
    content: [
      "At Simlak, we want you to be completely satisfied with your eSIM purchase. We understand that plans can change, and we offer a fair refund policy to accommodate reasonable requests.",
      "This policy outlines the conditions under which refunds are available and the process for requesting one. Please read carefully to understand your rights and our procedures.",
    ],
  },
  {
    id: "eligible",
    icon: CheckCircle2,
    title: "2. Eligible for Refund",
    content: [
      "You are eligible for a full refund if ALL of the following conditions are met:",
      {
        type: "list",
        items: [
          "The eSIM has NOT been installed on any device",
          "The eSIM QR code has NOT been scanned or activated",
          "The refund request is made within 7 days of purchase",
          "No data has been consumed on the eSIM",
        ],
      },
      { type: "bold", text: "Technical Issues:" },
      "If you experience technical issues that prevent installation and our support team cannot resolve them, you may be eligible for a refund even after scanning the QR code, provided:",
      {
        type: "list",
        items: [
          "You have contacted our support team and attempted troubleshooting",
          "The issue is confirmed to be on our end, not device incompatibility",
          "No data has been consumed on the eSIM",
        ],
      },
    ],
  },
  {
    id: "not-eligible",
    icon: XCircle,
    title: "3. Not Eligible for Refund",
    content: [
      "Refunds are NOT available in the following situations:",
      {
        type: "list",
        items: [
          "The eSIM has been installed on a device (even if data hasn't been used)",
          "The eSIM QR code has been scanned or the activation code has been entered",
          "Data has been partially or fully consumed",
          "The validity period of the eSIM has expired",
          "The refund request is made more than 7 days after purchase",
          "Device incompatibility that was not verified before purchase",
          "Change of travel plans after eSIM installation",
          "Network coverage issues in specific areas (coverage varies by location)",
          "Slow speeds due to network congestion (this is carrier-dependent)",
        ],
      },
      { type: "bold", text: "Why installed eSIMs cannot be refunded:" },
      "Once an eSIM is installed, the QR code becomes invalid and cannot be reused. The eSIM profile is permanently linked to your device, making it impossible to resell or transfer to another customer.",
    ],
  },
  {
    id: "process",
    icon: Clock,
    title: "4. Refund Process",
    content: [
      { type: "bold", text: "How to request a refund:" },
      {
        type: "list",
        items: [
          "Email us at support@simlak.net with the subject line \"Refund Request\"",
          "Include your order number or transaction ID",
          "Provide the email address used for the purchase",
          "Briefly explain the reason for your refund request",
        ],
      },
      { type: "bold", text: "What happens next:" },
      {
        type: "list",
        items: [
          "Our team will review your request within 24-48 hours",
          "We may ask for additional information to verify eligibility",
          "You will receive an email confirming approval or denial",
          "Approved refunds are processed within 5-10 business days",
        ],
      },
    ],
  },
  {
    id: "timeline",
    icon: CreditCard,
    title: "5. Refund Timeline & Method",
    content: [
      "Refunds are processed to the original payment method used for the purchase:",
      {
        type: "list",
        items: [
          "Credit/Debit Cards: 5-10 business days (may vary by bank)",
          "Apple Pay / Google Pay: 5-10 business days",
          "The refund will appear on your statement as a credit from Simlak",
        ],
      },
      { type: "bold", text: "Important notes:" },
      {
        type: "list",
        items: [
          "Refunds are issued in the original currency of purchase",
          "Exchange rate fluctuations may result in a slightly different amount",
          "We do not refund any bank fees or currency conversion charges",
          "Processing times depend on your financial institution",
        ],
      },
    ],
  },
  {
    id: "partial",
    icon: RefreshCw,
    title: "6. Partial Refunds",
    content: [
      "In some cases, we may offer partial refunds at our discretion:",
      {
        type: "list",
        items: [
          "Significant service outages affecting your entire trip",
          "Major discrepancies between advertised and actual coverage",
          "Extenuating circumstances (evaluated case-by-case)",
        ],
      },
      "Partial refunds are calculated based on the unused portion of your data plan and the specific circumstances of your case. Our support team will determine the appropriate refund amount.",
    ],
  },
  {
    id: "cancellation",
    icon: XCircle,
    title: "7. Order Cancellation",
    content: [
      "You may cancel your order and receive a full refund if:",
      {
        type: "list",
        items: [
          "The cancellation request is made before the eSIM is delivered",
          "You have not yet received your QR code via email",
        ],
      },
      "Since eSIM delivery is typically instant (within minutes of purchase), the window for cancellation is very short. We recommend carefully reviewing your order before completing the purchase.",
    ],
  },
  {
    id: "disputes",
    icon: AlertCircle,
    title: "8. Chargebacks & Disputes",
    content: [
      "We encourage you to contact us directly before initiating a chargeback with your bank or credit card company. We are committed to resolving issues fairly and promptly.",
      { type: "bold", text: "Please note:" },
      {
        type: "list",
        items: [
          "Filing a chargeback for an installed/used eSIM may be considered fraud",
          "Chargebacks result in automatic account suspension",
          "We provide transaction records and usage data to dispute fraudulent chargebacks",
          "Resolving issues directly with us is faster and preserves your account",
        ],
      },
    ],
  },
  {
    id: "exceptions",
    icon: HelpCircle,
    title: "9. Exceptions & Special Cases",
    content: [
      "We understand that exceptional circumstances may arise. The following situations will be evaluated on a case-by-case basis:",
      {
        type: "list",
        items: [
          "Medical emergencies requiring trip cancellation",
          "Natural disasters or government travel restrictions",
          "Death in the family or other serious personal emergencies",
          "Documented airline cancellations affecting your travel",
        ],
      },
      "For exceptional circumstances, please contact us with relevant documentation. We will do our best to accommodate reasonable requests within our policies.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "10. Contact Information",
    content: [
      "For refund requests or questions about this policy, please contact us:",
      { type: "bold", text: "Email: support@simlak.net" },
      { type: "bold", text: "Subject Line: \"Refund Request\" or \"Refund Question\"" },
      { type: "bold", text: "Response Time: 24-48 hours" },
      "Please include your order number in all communications to help us assist you faster.",
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

export default function RefundPage() {
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
              <RefreshCw className="w-4 h-4" />
              <span>Legal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Refund <span className="gradient-text">Policy</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto">
              Our commitment to fair and transparent refund practices.
            </p>

            <p className="text-sm text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">7-Day Window</p>
                  <p className="text-xs text-muted-foreground">For unused eSIMs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                <div className="w-10 h-10 rounded-full bg-(--simlak-orange)/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-(--simlak-orange)" />
                </div>
                <div>
                  <p className="font-semibold text-sm">5-10 Business Days</p>
                  <p className="text-xs text-muted-foreground">Refund processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                <div className="w-10 h-10 rounded-full bg-(--simlak-teal)/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-(--simlak-teal)" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Original Method</p>
                  <p className="text-xs text-muted-foreground">Refund destination</p>
                </div>
              </div>
            </div>
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
                We want you to have a positive experience with Simlak. If your purchase doesn&apos;t meet your expectations, we&apos;re here to help.
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Key Point:</span> eSIMs that have been installed or activated are not eligible for refunds because the QR code becomes permanently linked to your device and cannot be reused.
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
                  <h3 className="text-lg font-bold mb-2">Our Commitment</h3>
                  <p className="text-muted-foreground">
                    We strive to resolve all refund requests fairly and promptly. If you have any questions about this policy or believe you have a special circumstance, please don&apos;t hesitate to contact our support team.
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
