"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import PageHero from "@/components/layout/PageHero";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: MapPin,
    title: "Our Address",
    detail: "234 Admiralty Way, Victoria Island, Lagos, Nigeria",
    sub: "Visit us at our office",
  },
  {
    icon: Phone,
    title: "Phone Number",
    detail: "+234 801 234 5678",
    sub: "Mon-Fri from 8:00 AM - 6:00 PM (WAT)",
  },
  {
    icon: Mail,
    title: "Email Address",
    detail: "hello@lagos-hotspot.com",
    sub: "We reply within 24 hours",
  },
];

export default function ContactUsPage() {
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; subject?: string; message?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!message.trim()) newErrors.message = "Message is required";
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    setFormErrors({});
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div>
      {/* Hero Section */}
      <PageHero title="Contact Us" subtitle="We'd love to hear from you. Get in touch with the Lagos Hotspot team." />

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((info) => (
            <Card
              key={info.title}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <info.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{info.title}</h3>
                <p className="text-sm font-medium text-primary mt-1">
                  {info.detail}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {info.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Send Us a Message
              </h2>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Message Sent!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Thank you for reaching out. We&apos;ll get back to you
                    within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setFormErrors((prev) => ({ ...prev, name: undefined })); }}
                        className="h-11"
                        required
                      />
                      {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFormErrors((prev) => ({ ...prev, email: undefined })); }}
                        className="h-11"
                        required
                      />
                      {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What is this about?"
                      value={subject}
                      onChange={(e) => { setSubject(e.target.value); setFormErrors((prev) => ({ ...prev, subject: undefined })); }}
                      className="h-11"
                      required
                    />
                    {formErrors.subject && <p className="text-xs text-destructive">{formErrors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); setFormErrors((prev) => ({ ...prev, message: undefined })); }}
                      rows={5}
                      required
                    />
                    {formErrors.message && <p className="text-xs text-destructive">{formErrors.message}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Map Placeholder + Info */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-64 bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Interactive Map
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    234 Admiralty Way, Victoria Island, Lagos
                  </p>
                </div>
              </div>
            </Card>

            {/* WhatsApp CTA */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Chat with us on WhatsApp
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get quick responses Mon-Fri, 8 AM - 6 PM (WAT)
                </p>
                <a
                  href="https://wa.me/2348012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start WhatsApp Chat
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Monday - Friday
                    </span>
                    <span className="font-medium">8:00 AM - 6:00 PM (WAT)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM (WAT)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium text-red-500">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
