"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, type UserTier, TIER_LABELS } from "@/lib/auth-store";
import { pricingPlans } from "@/data/mock-data";
import { Eye, EyeOff, Flame, Check, Compass, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tierIcons: Record<UserTier, React.ReactNode> = {
  explorer: <Compass className="h-5 w-5" />,
  scout: <Star className="h-5 w-5" />,
  ambassador: <Crown className="h-5 w-5" />,
};

const tierColors: Record<UserTier, string> = {
  explorer: "border-muted hover:border-muted-foreground/30",
  scout: "border-primary/20 hover:border-primary/50 data-[active=true]:border-primary",
  ambassador: "border-amber-200 hover:border-amber-400 data-[active=true]:border-amber-500",
};

const tierActiveBg: Record<UserTier, string> = {
  explorer: "bg-muted/50",
  scout: "bg-primary/5",
  ambassador: "bg-amber-50",
};

export default function RegisterPage() {
  const { navigate } = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const [selectedTier, setSelectedTier] = useState<UserTier>("explorer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = "Password must be at least 8 characters with one uppercase and one number";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      await signup({ email: email.trim(), password, name: fullName.trim() });
      navigate("dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
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
          <h1 className="text-2xl font-bold text-foreground">Join Lagos Hotspot</h1>
          <p className="text-muted-foreground text-sm">
            Start discovering the hottest spots in Lagos today.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose your plan</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TIER_LABELS) as UserTier[]).map((tier) => {
                const plan = pricingPlans.find(p => p.id === tier);
                const isActive = selectedTier === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    data-active={isActive}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center",
                      tierColors[tier],
                      isActive && tierActiveBg[tier],
                      isActive && "ring-1",
                      tier === "scout" && isActive && "ring-primary/30",
                      tier === "ambassador" && isActive && "ring-amber-300",
                    )}
                  >
                    {tier === "scout" && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className={cn(
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {tierIcons[tier]}
                    </div>
                    <span className={cn("text-xs font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {TIER_LABELS[tier]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {plan?.price || "Free"}{tier !== "explorer" ? "/mo" : ""}
                    </span>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Login */}
          <div>
            <Button variant="outline" className="w-full h-11" onClick={() => toast.info("Coming soon!")}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              Or
            </span>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors((prev) => ({ ...prev, fullName: undefined })); }}
                className="h-11"
                required
                autoComplete="name"
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                className="h-11"
                required
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  className="h-11 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters with one uppercase and one number</p>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: undefined })); }}
                  className="h-11 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("terms-of-service")}
                  className="text-primary hover:underline font-medium"
                >
                  Terms &amp; Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => navigate("privacy-policy")}
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </button>
              </Label>
            </div>

            {/* Sign Up Button */}
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? "Creating account…" : "Create Account"}
            </Button>
            {serverError ? (
              <p className="text-xs text-destructive text-center" role="alert">
                {serverError}
              </p>
            ) : null}
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("login")}
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
