"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TestTube2,
  Users,
  Tractor,
  Wrench,
  ShieldCheck,
  Shuffle,
} from "lucide-react";
import type { RoleType } from "@/lib/api/types";

export interface UploadOptions {
  dryRun: boolean;
  skipDuplicates: boolean;
  onboardFarmers: boolean;
  onboardProviders: boolean;
  onboardMixedRoles: boolean;
  mixedRoleAsType: RoleType;
}

interface UploadOptionsFormProps {
  options: UploadOptions;
  onChange: (options: UploadOptions) => void;
  disabled?: boolean;
}

export function UploadOptionsForm({
  options,
  onChange,
  disabled = false,
}: UploadOptionsFormProps) {
  const handleChange = <K extends keyof UploadOptions>(
    key: K,
    value: UploadOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#00594C]" />
          Import Options
        </CardTitle>
        <CardDescription>
          Configure how the data should be processed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dry Run Option */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="dryRun"
            checked={options.dryRun}
            onCheckedChange={(checked) =>
              handleChange("dryRun", checked === true)
            }
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="dryRun"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <TestTube2 className="w-4 h-4 text-amber-600" />
              Dry Run Mode
            </Label>
            <p className="text-sm text-gray-500">
              Preview the import without making any changes. You can review and
              confirm before actual import.
            </p>
          </div>
        </div>

        {/* Skip Duplicates Option */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="skipDuplicates"
            checked={options.skipDuplicates}
            onCheckedChange={(checked) =>
              handleChange("skipDuplicates", checked === true)
            }
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="skipDuplicates"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <Users className="w-4 h-4 text-blue-600" />
              Skip Duplicates
            </Label>
            <p className="text-sm text-gray-500">
              Skip rows where the phone number or ID already exists in the system.
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Which records to process:
          </p>
        </div>

        {/* Onboard Farmers Option */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="onboardFarmers"
            checked={options.onboardFarmers}
            onCheckedChange={(checked) =>
              handleChange("onboardFarmers", checked === true)
            }
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="onboardFarmers"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <Tractor className="w-4 h-4 text-green-600" />
              Onboard Farmers
            </Label>
            <p className="text-sm text-gray-500">
              Process and create farmer records from the file.
            </p>
          </div>
        </div>

        {/* Onboard Providers Option */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="onboardProviders"
            checked={options.onboardProviders}
            onCheckedChange={(checked) =>
              handleChange("onboardProviders", checked === true)
            }
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="onboardProviders"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <Wrench className="w-4 h-4 text-blue-600" />
              Onboard Service Providers
            </Label>
            <p className="text-sm text-gray-500">
              Process and create service provider records from the file.
            </p>
          </div>
        </div>

        {/* Onboard Mixed Roles Option */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="onboardMixedRoles"
            checked={options.onboardMixedRoles}
            onCheckedChange={(checked) =>
              handleChange("onboardMixedRoles", checked === true)
            }
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="onboardMixedRoles"
              className="flex items-center gap-2 cursor-pointer font-medium"
            >
              <Shuffle className="w-4 h-4 text-purple-600" />
              Onboard Mixed Roles
            </Label>
            <p className="text-sm text-gray-500">
              Process records that are both farmers and service providers.
            </p>
          </div>
        </div>

        {/* Mixed Role Type Selection */}
        {options.onboardMixedRoles && (
          <div className="space-y-2 pl-7">
            <Label className="text-sm font-medium text-gray-700">
              Create mixed roles as:
            </Label>
            <Select
              value={options.mixedRoleAsType}
              onValueChange={(value) =>
                handleChange("mixedRoleAsType", value as RoleType)
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Farmer
                  </div>
                </SelectItem>
                <SelectItem value="provider">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Service Provider
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              When a record has activities indicating both farmer and provider roles,
              create them as this type.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
