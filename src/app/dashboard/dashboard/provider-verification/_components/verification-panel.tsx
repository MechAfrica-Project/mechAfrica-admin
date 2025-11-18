"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Provider } from "../types";

interface Props {
  provider: Provider;
  onClose: () => void;
  onDecline: () => void;
  onVerify: () => void;
}

export function VerificationPanel({
  provider,
  onClose,
  onDecline,
  onVerify,
}: Props) {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.aside
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] lg:w-[720px] bg-white z-50 shadow-2xl overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-900">
              Document from Provider {provider.name.split(" ")[0]}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="">
            {/* Left: Document centered preview */}
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-[0_40px_80px_rgba(0,0,0,0.08)] p-6 max-w-[380px] w-full">
                {/* Replace Image source with screenshot path in /public or next/image import */}
                <div className="w-full h-[420px] flex items-center justify-center bg-gray-50 rounded">
                  <Image
                    src="/Screenshot-2025-11-18-011404.png"
                    alt="document"
                    width={320}
                    height={520}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center mx-18 gap-4 pt-4">
              <button
                onClick={onDecline}
                className="flex-1 rounded-xl bg-red-500 cursor-pointer hover:bg-red-600 text-white py-3 font-semibold"
              >
                Decline
              </button>
              <button
                onClick={onVerify}
                className="flex-1 rounded-xl bg-green-800 hover:bg-emerald-800 cursor-pointer text-white py-3 font-semibold"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
