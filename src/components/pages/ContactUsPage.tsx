"use client";

import React, { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import PageHero from "@/components/layout/PageHero";
import { toast } from "sonner";

const CONTACT_EMAIL = "hello@lagos-hotspot.com";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    detail: CONTACT_EMAIL,
    sub: "The quickest way to reach the team",
  },
];

export default function ContactUsPage() {
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
    // No backend receives this form yet, so hand the message to the
    // visitor's email app rather than pretending it was sent.
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    toast.info("Opening your email app with your message.");
  };

  return (
    <div>
      {/* Hero Section */}
      <PageHero title="Contact Us" subtitle="We'd love to hear from you. Get in touch with the Lagos Hotspot team." />

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
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

      {/* Contact form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
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
                    Finish sending in your email app
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Your message is ready in a new email to {CONTACT_EMAIL}. Send it
                    from there and we&apos;ll get back to you. If nothing opened, email
                    us directly at that address.
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
                    Email us
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
}
