"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import {
  FileText,
  CheckCircle,
  MapPin,
  Star,
  Shield,
  Scale,
  CreditCard,
  Ban,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: FileText,
    content:
      "Welcome to EkoSpot! These Terms of Service (\"Terms\") govern your access to and use of the EkoSpot platform, including our website, mobile applications, and all related services. EkoSpot is Lagos' premier hotspot discovery platform, connecting people with the best restaurants, nightlife, beaches, cultural centers, and more across Lagos State. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must discontinue use of the platform immediately.",
  },
  {
    id: "acceptance-of-terms",
    title: "Acceptance of Terms",
    icon: CheckCircle,
    content:
      "By creating an account on EkoSpot, browsing hotspot listings, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. These Terms apply to all users, including explorers, scouts, ambassadors, and visitors. If you are using the platform on behalf of a business, you represent and warrant that you have the authority to bind that business to these Terms. We reserve the right to update these Terms at any time, and continued use of the platform constitutes acceptance of any changes.",
  },
  {
    id: "user-obligations",
    title: "User Obligations",
    icon: MapPin,
    content:
      "As a user of EkoSpot, you are responsible for maintaining accurate and up-to-date account information. You must not submit false or misleading hotspot listings, reviews, or information. All reviews must be based on genuine experiences. Users are required to respect the intellectual property of hotspot owners and other users. You must not use the platform for any unlawful purpose, including but not limited to fraud, harassment, or spam. Failure to meet these obligations may result in account suspension or termination.",
  },
  {
    id: "business-listings",
    title: "Business Listings",
    icon: Star,
    content:
      "Business owners who list their establishments on EkoSpot (Ambassador plan) are responsible for maintaining accurate and up-to-date business information, including business name, contact information, hours of operation, and price ranges. All business descriptions and images must accurately represent the establishment. Business owners must respond to customer inquiries within a reasonable timeframe. EkoSpot reserves the right to remove listings that are found to contain false or misleading information.",
  },
  {
    id: "trust-verification",
    title: "Vibe Scores & Verification",
    icon: Shield,
    content:
      "EkoSpot's Vibe Score system is designed to provide an objective assessment of hotspot popularity and quality based on verified data including customer reviews, visit frequency, social media buzz, and listing completeness. Vibe Scores are calculated algorithmically and cannot be purchased or manipulated. Business owners may apply for verified status by submitting required documentation. Verification status is subject to periodic review and may be revoked if the business no longer meets our standards. EkoSpot makes no guarantees regarding the accuracy of Vibe Scores and encourages users to exercise their own judgment.",
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution",
    icon: Scale,
    content:
      "In the event of a dispute between a user and a business listed on EkoSpot, we provide a structured resolution process. Users may report issues through the hotspot listing page or contact our support team. Business owners have 72 hours to respond to reported issues. Our resolution team will review all evidence provided by both parties and issue a determination within 5 business days. Any disputes that cannot be resolved through our platform shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.",
  },
  {
    id: "payment-terms",
    title: "Payment Terms (Paystack)",
    icon: CreditCard,
    content:
      "All financial transactions on EkoSpot are processed securely through Paystack, our PCI-DSS compliant payment partner. We accept Visa, Mastercard, and Verve cards, bank transfers from all major Nigerian banks, and USSD payment codes. All transactions are denominated in Nigerian Naira (₦). Subscription fees (Scout: ₦2,999/month, Ambassador: ₦9,999/month) are billed automatically on the subscription anniversary date. Upgrades take effect immediately with prorated billing, while downgrades apply at the end of the current billing period. EkoSpot is not a bank and does not hold customer funds — all payments are processed directly through Paystack.",
  },
  {
    id: "account-termination",
    title: "Account Termination",
    icon: Ban,
    content:
      "EkoSpot reserves the right to suspend or terminate accounts that violate these Terms of Service, engage in fraudulent activity, or receive a significant number of verified complaints. We will provide notice of termination via email where possible, except in cases involving fraud or illegal activity where immediate termination may be necessary. Users may also terminate their own accounts at any time through their Dashboard settings or by contacting our support team. Upon account termination, your personal data will be handled in accordance with our Privacy Policy and the Nigeria Data Protection Regulation (NDPR).",
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    icon: AlertTriangle,
    content:
      "EkoSpot serves as a platform for discovering hotspots and is not a party to any transactions between users and businesses. We do not guarantee the quality, safety, or availability of services listed on the platform, nor do we guarantee the accuracy of all information provided by businesses. To the maximum extent permitted by Nigerian law, EkoSpot shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claim arising from these Terms shall not exceed the amount you have paid to EkoSpot in the twelve (12) months preceding the claim.",
  },
  {
    id: "changes-to-terms",
    title: "Changes to Terms",
    icon: RefreshCw,
    content:
      "EkoSpot reserves the right to modify these Terms of Service at any time. When we make material changes, we will notify users via email and through a prominent notice on the platform at least 14 days before the changes take effect. Continued use of the platform after the effective date of any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically to stay informed of any updates. If you do not agree with the revised Terms, you must stop using the platform and may request account deletion.",
  },
  {
    id: "contact",
    title: "Contact",
    icon: HelpCircle,
    content:
      "If you have any questions or concerns about these Terms of Service, please contact us at legal@ekospot.com or through our Help Center. You can also reach us by mail at: 234 Admiralty Way, Victoria Island, Lagos, Nigeria. For payment-related inquiries, please contact Paystack support at support@paystack.com. Our legal team is available Monday through Friday, 9 AM to 5 PM (WAT), and will respond to all inquiries within 5 business days.",
  },
];

export default function TermsOfServicePage() {
  const { navigate } = useRouter();
  const [activeSection, setActiveSection] = useState("introduction");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">EkoSpot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 text-muted-foreground">
          Last updated: January 15, 2025 · NDPR Compliant
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                  Table of Contents
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <section.icon className="h-3.5 w-3.5 shrink-0" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </section>
          ))}

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => navigate("home")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
