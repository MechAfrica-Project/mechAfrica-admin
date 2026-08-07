"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { api } from "@/lib/api/client";

interface UserOption {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface UserComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function UserCombobox({ value, onChange, placeholder = "Search user by name..." }: UserComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch users based on search term
  const fetchUsers = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      // Searching across all users is typically done via the main users endpoint
      // We'll use role=all or omit role, but our API client expects a role or we use getUsers
      const response = await api.getUsers({ search, limit: 10, page: 1 });
      
      const mappedOptions = response.data.map((u: any) => ({
        id: u.id,
        name: `${u.firstName || ""} ${u.otherNames || ""}`.trim() || "Unknown",
        phone: u.phone || "No phone",
        role: u.type || "user",
      }));
      setOptions(mappedOptions);
    } catch (error) {
      console.error("Failed to fetch users for combobox:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial selected user details if value is provided but selectedUser is null
  useEffect(() => {
    if (value && !selectedUser) {
      const fetchUserDetails = async () => {
        try {
          const res = await api.getUserDetails(value);
          const u = res.user;
          setSelectedUser({
            id: u.id,
            name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.business_name || "Unknown",
            phone: u.phone_number || "No phone",
            role: u.role || "user",
          });
        } catch (e) {
          console.error("Failed to fetch selected user details");
        }
      };
      fetchUserDetails();
    }
  }, [value, selectedUser]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers(debouncedSearch);
    }
  }, [debouncedSearch, isOpen, fetchUsers]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (user: UserOption) => {
    setSelectedUser(user);
    onChange(user.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(null);
    onChange("");
    setSearchTerm("");
    inputRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="flex min-h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors cursor-text focus-within:border-[#00594C] focus-within:ring-1 focus-within:ring-[#00594C]"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {selectedUser && !isOpen ? (
            <div className="flex items-center gap-2 w-full">
              <span className="truncate font-medium">{selectedUser.name}</span>
              <span className="text-xs text-gray-400 truncate">({selectedUser.phone})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent outline-none placeholder:text-gray-400"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedUser && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronsUpDown className="h-4 w-4 text-gray-400 opacity-50" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#00594C]" />
              Searching users...
            </div>
          ) : options.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No users found.
            </div>
          ) : (
            <ul role="listbox" className="w-full">
              {options.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={value === option.id}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    value === option.id ? "bg-[#00594C]/5 text-[#00594C]" : "text-gray-900"
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 capitalize">{option.role.replace('_', ' ')}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{option.phone}</span>
                    </div>
                  </div>
                  {value === option.id && <Check className="h-4 w-4 text-[#00594C]" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
