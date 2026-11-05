"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useAuthStore, TIER_LABELS, TIER_BG_COLORS } from "@/lib/auth-store";
import { api } from "@/lib/convex-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Flame, Bell, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn, initials } from "@/lib/utils";

const BIO_MAX = 500;

export default function DashboardProfile() {
  const { user, token, setSessionUser } = useAuthStore();
  const userTier = user?.tier || "explorer";
  const me = useQuery(api.auth.me, token ? { token } : "skip") as
    | { name: string | null; email: string; bio: string | null }
    | null
    | undefined;
  const updateProfile = useMutation(api.auth.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fill the form once from the server copy of the profile.
  useEffect(() => {
    if (me && !loaded) {
      setName(me.name ?? "");
      setBio(me.bio ?? "");
      setLoaded(true);
    }
  }, [me, loaded]);

  const dirty = loaded && (name.trim() !== (me?.name ?? "") || bio.trim() !== (me?.bio ?? ""));

  const handleSave = async () => {
    if (!token || !user) return;
    setSaving(true);
    try {
      const updated = (await updateProfile({ token, name, bio })) as { name: string | null };
      setSessionUser({ ...user, name: updated.name ?? "" }, token);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof ConvexError ? String(err.data) : "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-medium tracking-tight text-foreground">My profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          How you appear on reviews and messages.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials(name || user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{name || "Your name"}</h2>
              <p className="text-muted-foreground text-sm">{me?.email ?? user?.email}</p>
              <Badge
                variant="outline"
                className={cn("mt-2 text-xs font-medium", TIER_BG_COLORS[userTier])}
              >
                <Flame className="h-3 w-3 mr-1" aria-hidden="true" />
                {TIER_LABELS[userTier]}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                maxLength={80}
                disabled={!loaded}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={me?.email ?? user?.email ?? ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Contact us to change the email you sign in with.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={bio}
              maxLength={BIO_MAX}
              disabled={!loaded}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other Lagosians what you love about the city…"
            />
            <p className="text-xs text-muted-foreground text-right tabular-nums">
              {bio.length}/{BIO_MAX}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email notifications</p>
                <p className="text-xs text-muted-foreground">Updates about spots, reviews and messages</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Change the password you sign in with</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="min-w-[140px]" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}
