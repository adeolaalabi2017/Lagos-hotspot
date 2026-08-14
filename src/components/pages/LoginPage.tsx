"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore, type User, type UserRole } from "@/lib/auth-store";
import { Eye, EyeOff, Flame, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex-api";

function makeLocalUser(email: string): User {
  const base = email.trim().toLowerCase();
  return {
    id: `local-${base}`,
    email: base,
    name: base.split("@")[0] || email.trim(),
    avatar: base.slice(0, 2).toUpperCase(),
    tier: "explorer",
    role: "user" as UserRole,
    suspendedAt: null,
  };
}

export default function LoginPage() {
  const { navigate } = useRouter();
  const setSessionUser = useAuthStore((s) => s.setSessionUser);
  const loginMutation = useMutation(api.auth.login);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const result = await loginMutation({ email: email.trim(), password });
      const rawUser = result?.user;
      const user: User = rawUser
        ? {
            id: String(rawUser.id),
            email: rawUser.email,
            name: rawUser.name ?? "",
            avatar: rawUser.avatar ?? "",
            tier: "explorer",
            role: (rawUser.role === "admin" ? "admin" : "user") as UserRole,
            suspendedAt: rawUser.suspendedAt != null ? String(rawUser.suspendedAt) : null,
          }
        : makeLocalUser(email.trim());
      setSessionUser(user);
      navigate("dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground">Welcome Back to Lagos Hotspot</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to discover the hottest spots in Lagos.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => toast.info("Google sign-in is not configured yet")}
              type="button"
            >
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
              Sign in with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              Or
            </span>
          </div>

          {/* Email & Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => navigate("forgot-password")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  className="h-11 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>

            {/* Sign In Button */}
            <Button type="submit" className="w-full h-11" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
            {serverError ? (
              <p className="text-xs text-destructive text-center" role="alert">
                {serverError}
              </p>
            ) : null}
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("register")}
              className="text-primary font-medium hover:underline"
            >
              Sign Up
            </button>
          </p>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Join the community discovering Lagos hotspots</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
