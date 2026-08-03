"use client";

import { useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StartConversationLinkProps {
  hotspotId: string;
  hotspotTitle: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function StartConversationLink({
  hotspotId,
  hotspotTitle,
  variant = "default",
  size = "default",
}: StartConversationLinkProps) {
  const { navigate } = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const startConversationMutation = useMutation((api as any).hotspots.startConversation);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function startConversation(e?: React.FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if (!text) {
      toast.error("Add a message first");
      return;
    }
    setSubmitting(true);
    try {
      const data = await startConversationMutation({
        listingId: hotspotId,
        userId: user?.id ?? "",
        body: text,
      });
      toast.success("Conversation started");
      setOpen(false);
      setBody("");
      navigate("dashboard-messages", { threadId: data.threadId });
    } catch {
      toast.error("Could not start conversation");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => navigate("login")}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Message host
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Message host
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message the host of {hotspotTitle}</DialogTitle>
          <DialogDescription>
            Ask a question, request a reservation, or share a recommendation.
            Your message will also appear in your Messages dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={startConversation} className="space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={`Hi! Is there a table for 2 available this Saturday?`}
            maxLength={2000}
            aria-label="Your message"
            autoFocus
          />
          <div className="text-xs text-muted-foreground text-right">
            {body.length}/2000 characters
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !body.trim()}>
              {submitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Send message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
