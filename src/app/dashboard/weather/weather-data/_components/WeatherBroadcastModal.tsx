"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapIcon } from "lucide-react";

interface WeatherBroadcastModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: {
    aiNotifications: boolean;
    region: string;
    district: string;
    message: string;
  }) => void;
}

export function WeatherBroadcastModal({
  isOpen,
  onOpenChange,
  onSend,
}: WeatherBroadcastModalProps) {
  const [aiNotifications, setAiNotifications] = useState(false);
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    onSend({ aiNotifications, region, district, message });
    // Reset form
    setAiNotifications(false);
    setRegion("");
    setDistrict("");
    setMessage("");
    onOpenChange(false);
  };

  if (!isOpen) {
    return (
      <AnimatePresence>
        {false && <></>}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl sm:w-[520px] lg:w-[720px]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex h-full flex-col px-8 py-8">
              <header className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Custom Weather BroadCast
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Send custom weather notifications to selected regions.
                </p>
              </header>

              <div className="flex-1 space-y-6">
                {/* AI Notifications Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#f8faf9] px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-gray-800">
                    <MapIcon className="h-4 w-4 text-emerald-700" />
                    AI Weather Notifications
                  </span>
                  <Switch
                    checked={aiNotifications}
                    onCheckedChange={setAiNotifications}
                  />
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-600">
                    Region
                  </span>
                  <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-1.5">
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="h-10 border-none bg-transparent px-0 text-sm focus:ring-0">
                        <SelectValue placeholder="Ashanti Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ashanti">Ashanti Region</SelectItem>
                        <SelectItem value="GreaterAccra">
                          Greater Accra
                        </SelectItem>
                        <SelectItem value="Eastern">Eastern Region</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-600">
                    District
                  </span>
                  <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-1.5">
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger className="h-10 border-none bg-transparent px-0 text-sm focus:ring-0">
                        <SelectValue placeholder="District Name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="District1">District 1</SelectItem>
                        <SelectItem value="District2">District 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Notifications */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-600">
                    Custom Notifications
                  </span>
                  <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] px-3 py-2">
                    <Textarea
                      placeholder="Type your custom notification here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl px-8 py-2 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSend}
                  className="rounded-xl bg-[#00594C] px-10 py-2 text-sm font-semibold text-white hover:bg-[#004437]"
                >
                  Send
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
