"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { Shield, FileText, Users, Bell, Lock, HelpCircle, Scale, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: FileText,
    content:
      "Welcome to Lagos Hotspot! This Privacy Policy describes how we collect, use, and protect your personal information when you use our platform. By accessing or using Lagos Hotspot, you agree to the terms outlined in this policy. We are committed to ensuring that your privacy is protected and that your personal data is handled responsibly in accordance with the Nigeria Data Protection Regulation (NDPR) and applicable Nigerian data protection laws.",
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    icon: Users,
    content:
      "We collect information that you provide directly to us, such as when you create an account, submit a hotspot listing, leave a review, or contact us for support. This includes your name, email address, phone number, WhatsApp number, profile photos, and payment information. We also collect certain information automatically when you use our platform, including your IP address, browser type, operating system, referring URLs, location data (with your consent), and information about how you interact with our services.",
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    icon: FileText,
    content:
      "We use the information we collect to provide, maintain, and improve our hotspot discovery services, process transactions and send related information including confirmations and invoices via Paystack, send technical notices, updates, security alerts, and administrative messages, respond to your comments, questions, and requests, and provide customer support, communicate with you about hotspots, events, and offers from Lagos Hotspot, calculate and display vibe scores, and monitor and analyze trends, usage, and activities on the platform.",
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    icon: Users,
    content:
      "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted third-party service providers who assist us in operating our platform (such as Paystack for payment processing), conducting our business, or serving you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with Nigerian law, enforce our site policies, or protect ours or others' rights, property, or safety.",
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: Lock,
    content:
      "We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. We use encryption technology to protect sensitive information transmitted online, and we also protect your information offline. All payment data is processed securely through Paystack, which is PCI-DSS compliant.",
  },
  {
    id: "ndpr-compliance",
    title: "NDPR Compliance",
    icon: Scale,
    content:
      "Lagos Hotspot is fully compliant with the Nigeria Data Protection Regulation (NDPR) issued by the National Information Technology Development Agency (NITDA). We have appointed a Data Protection Officer (DPO) and conduct regular data protection impact assessments. We ensure that all data processing activities are carried out in accordance with the principles of lawfulness, fairness, and transparency. You have the right to access, rectify, and erase your personal data, as well as the right to data portability under the NDPR.",
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    icon: Shield,
    content:
      "We use cookies to understand and save your preferences for future visits, keep track of advertisements, and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies through your browser settings. However, some features of our platform may not function properly without cookies.",
  },
  {
    id: "your-rights",
    title: "Your Rights",
    icon: Shield,
    content:
      "Under the NDPR, you have the right to access, update, or delete your personal information at any time through your account settings. You can opt out of receiving promotional emails from us by following the instructions in those emails. If you wish to delete your account, you can do so from your dashboard or by contacting our support team. Upon account deletion, we will remove your personal data from our active systems within 30 days, in compliance with NDPR requirements.",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    content:
      "We may send you notifications regarding your account activity, saved spot updates, new reviews, vibe score changes, and important platform announcements. You can manage your notification preferences through your account settings. We respect your choices and will not send you marketing communications if you have opted out, though we may still send you transactional or account-related messages that are necessary for the operation of our services.",
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: HelpCircle,
    content:
      "If you have any questions about this Privacy Policy or our NDPR compliance, please contact our Data Protection Officer at privacy@lagos-hotspot.com or through our Help Center. You can also write to us at: 234 Admiralty Way, Victoria Island, Lagos, Nigeria. We will respond to your inquiry within 30 days of receipt, as required by the NDPR.",
  },
];

export default function PrivacyPolicyPage() {
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
          <span className="text-lg font-bold text-foreground">Lagos Hotspot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Privacy Policy
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
