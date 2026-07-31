"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { Lock, ArrowLeft, Flame, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setSent(true);
    toast.success("Reset link sent!");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <button
            onClick={() => navigate("home")}
            className="flex items-center justify-center gap-2 mx-auto mb-4"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Lagos Hotspot</span>
          </button>
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            {sent
              ? "We've sent a reset link to your email"
              : "Enter your email and we'll send you a reset link."}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {!sent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button className="w-full h-11" onClick={handleSubmit}>
                Send Reset Link
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-primary/5 rounded-lg p-4 text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>. Please
                check your inbox and follow the instructions.
              </div>
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => setSent(false)}
              >
                Didn&apos;t receive the email? Try again
              </Button>
            </div>
          )}

          <button
            onClick={() => navigate("login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Your data is protected & NDPR compliant</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
