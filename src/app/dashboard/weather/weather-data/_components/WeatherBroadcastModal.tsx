"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Weather BroadCast</DialogTitle>
          <DialogDescription>
            Send custom weather notifications to selected regions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* AI Notifications Toggle */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              AI Weather Notifications
            </span>
            <Switch
              checked={aiNotifications}
              onCheckedChange={setAiNotifications}
            />
          </div>

          {/* Region */}
          <div className="space-y-1">
            <span className="text-sm font-medium">Region</span>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ashanti">Ashanti Region</SelectItem>
                <SelectItem value="GreaterAccra">Greater Accra</SelectItem>
                <SelectItem value="Eastern">Eastern Region</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div className="space-y-1">
            <span className="text-sm font-medium">District</span>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="District1">District 1</SelectItem>
                <SelectItem value="District2">District 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Notifications */}
          <div className="space-y-1">
            <span className="text-sm font-medium">Custom Notifications</span>
            <Textarea
              placeholder="Type your custom notification here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="destructive" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#00594C] hover:bg-[#004437]"
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
