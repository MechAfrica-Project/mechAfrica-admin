"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WeatherBroadcastForm } from "./WeatherBroadcastForm";

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
  const handleSend = (data: {
    aiNotifications: boolean;
    region: string;
    district: string;
    message: string;
  }) => {
    onSend(data);
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
            className="fixed inset-0 z-40 h-full bg-black/40"
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
              <WeatherBroadcastForm
                onSend={handleSend}
                onCancel={() => onOpenChange(false)}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


