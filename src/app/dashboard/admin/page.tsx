"use client";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useEffect } from "react";

export default function Admin() {
  const { setTitle } = useHeaderStore();

  useEffect(() => {
    setTitle("Admin");
  }, [setTitle]);

  return (
    <div className="p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">👥 Admin Panel</h3>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center text-gray-600">
          <p className="text-sm sm:text-base">Admin management tools will be displayed here...</p>
        </div>
      </div>
    </div>
  );
}
