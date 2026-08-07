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
import { UserCombobox } from "./UserCombobox";
import { Smartphone, Bell } from "lucide-react";

export default function BroadcastForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [userId, setUserId] = useState("");
  const [channel, setChannel] = useState<"push" | "sms">("push");

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
        if (channel === "push") {
          await api.broadcastAdminPushNotification({ title, body });
        } else {
          await api.broadcastAdminSMSNotification({ title, body });
        }
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
            toast.error("Please select a specific user.");
            setIsSubmitting(false);
            return;
          }
          payload.user_id = userId;
        }

        if (channel === "push") {
          await api.sendAdminPushNotification(payload);
        } else {
          await api.sendAdminSMSNotification(payload);
        }
      }

      toast.success(`${channel === 'push' ? 'Push notification' : 'SMS'} sent successfully!`);
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
        
        {/* Channel Selection */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Delivery Channel</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setChannel("push")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                channel === "push" 
                  ? "border-[#00594C] bg-[#00594C]/5 text-[#00594C]" 
                  : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
              }`}
            >
              <Bell className={`w-6 h-6 mb-2 ${channel === "push" ? "text-[#00594C]" : "text-gray-400"}`} />
              <span className="font-semibold text-sm">Push Notification</span>
              <span className="text-xs opacity-70 mt-1">Send to app</span>
            </button>
            
            <button
              type="button"
              onClick={() => setChannel("sms")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                channel === "sms" 
                  ? "border-[#00594C] bg-[#00594C]/5 text-[#00594C]" 
                  : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
              }`}
            >
              <Smartphone className={`w-6 h-6 mb-2 ${channel === "sms" ? "text-[#00594C]" : "text-gray-400"}`} />
              <span className="font-semibold text-sm">SMS Message</span>
              <span className="text-xs opacity-70 mt-1">Send to phone</span>
            </button>
          </div>
        </div>
        
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
                <SelectItem value="specific_user">Specific Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specific User ID */}
        {targetAudience === "specific_user" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-xs font-medium text-gray-600">Find User</span>
            <UserCombobox 
              value={userId} 
              onChange={setUserId} 
              placeholder="Search by name, business, or phone..." 
            />
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
