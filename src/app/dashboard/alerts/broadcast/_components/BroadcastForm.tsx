"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/client";

export default function BroadcastForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [userId, setUserId] = useState("");

  const handleSend = async () => {
    if (title.length < 2) {
      toast.error("Title must be at least 2 characters.");
      return;
    }
    if (body.length < 5) {
      toast.error("Message body must be at least 5 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (targetAudience === "all") {
        await api.broadcastAdminPushNotification({
          title,
          body,
        });
      } else {
        const payload: Parameters<typeof api.sendAdminPushNotification>[0] = {
          title,
          body,
        };

        if (targetAudience === "farmers") {
          payload.target_role = "farmer";
        } else if (targetAudience === "service_providers") {
          payload.target_role = "service_provider";
        } else if (targetAudience === "specific_user") {
          if (!userId) {
            toast.error("User ID is required for specific user target.");
            setIsSubmitting(false);
            return;
          }
          payload.user_id = userId;
        }

        await api.sendAdminPushNotification(payload);
      }

      toast.success("Push notification sent successfully!");
      setTitle("");
      setBody("");
      setTargetAudience("all");
      setUserId("");
    } catch (error: unknown) {
      console.error("Failed to send notification:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-600">Notification Title</span>
          <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Update, Weather Alert"
              className="h-10 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="text-[10px] text-gray-400">
            This is the short, bold title that appears at the top of the notification.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-600">Message Body</span>
          <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type the full message content here..."
              rows={4}
              className="border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-600">Target Audience</span>
          <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-1.5">
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger className="h-10 border-none bg-transparent px-0 text-sm focus:ring-0">
                <SelectValue placeholder="Select who will receive this" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone (Broadcast)</SelectItem>
                <SelectItem value="farmers">All Farmers</SelectItem>
                <SelectItem value="service_providers">All Service Providers</SelectItem>
                <SelectItem value="specific_user">Specific User ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specific User ID */}
        {targetAudience === "specific_user" && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-600">User ID (UUID)</span>
            <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-1">
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                className="h-10 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#00594C] py-6 text-sm font-semibold text-white hover:bg-[#004437]"
          >
            {isSubmitting ? "Sending..." : "Send Notification"}
          </Button>
        </div>

      </div>
    </div>
  );
}
