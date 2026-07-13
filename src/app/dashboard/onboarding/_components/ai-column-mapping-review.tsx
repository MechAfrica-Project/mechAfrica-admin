"use client";

import React, { useState } from "react";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnAnalysisResult, ColumnMapping } from "@/lib/api/types";

// Human-readable field names
const FIELD_LABELS: Record<string, string> = {
  first_name: "Full / First Name",
  last_name: "Last Name",
  phone_number: "Phone Number",
  id_number: "National ID / Ghana Card",
  gender: "Gender",
  region_id: "Region",
  district_id: "District",
  community_name: "Community / Town",
  activity: "Farming Activity",
};

const REQUIRED_FIELDS = new Set([
  "first_name",
  "phone_number",
  "region_id",
  "activity",
]);

interface AIColumnMappingReviewProps {
  analysis: ColumnAnalysisResult;
  onConfirm: (mappings: ColumnMapping[]) => void;
  onCancel: () => void;
}

export function AIColumnMappingReview({
  analysis,
  onConfirm,
  onCancel,
}: AIColumnMappingReviewProps) {
  // Build initial mapping state from AI suggestions
  const buildInitialMappings = () => {
    const map: Record<string, string> = {};
    for (const m of analysis.mappings) {
      map[m.field_name] = m.mapped_to;
    }
    return map;
  };

  const [fieldToHeader, setFieldToHeader] = useState<Record<string, string>>(
    buildInitialMappings
  );

  const allFields = Object.keys(FIELD_LABELS);
  const missingRequired = REQUIRED_FIELDS
    ? [...REQUIRED_FIELDS].filter(
        (f) => !fieldToHeader[f] || fieldToHeader[f] === "__skip__"
      )
    : [];

  const handleFieldChange = (fieldName: string, header: string) => {
    setFieldToHeader((prev) => ({ ...prev, [fieldName]: header }));
  };

  const handleConfirm = () => {
    // Build final ColumnMapping array from the admin's confirmed selections
    const confirmedMappings: ColumnMapping[] = [];
    for (const [fieldName, header] of Object.entries(fieldToHeader)) {
      if (header && header !== "__skip__") {
        const originalMapping = analysis.mappings.find(
          (m) => m.field_name === fieldName && m.mapped_to === header
        );
        confirmedMappings.push({
          field_name: fieldName,
          mapped_to: header,
          confidence: originalMapping?.confidence ?? 0.9,
          reasoning: originalMapping?.reasoning ?? "Manually confirmed by admin",
        });
      }
    }
    onConfirm(confirmedMappings);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return "text-emerald-600";
    if (confidence >= 0.65) return "text-amber-500";
    return "text-red-500";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85)
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
          High
        </Badge>
      );
    if (confidence >= 0.65)
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
          Medium
        </Badge>
      );
    return (
      <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
        Low
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Banner */}
      <Card className="border-[#00594C]/30 bg-gradient-to-br from-[#00594C]/5 to-emerald-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00594C] flex items-center justify-center flex-shrink-0">
              {analysis.ai_powered ? (
                <Sparkles className="w-5 h-5 text-white" />
              ) : (
                <Brain className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {analysis.ai_powered
                    ? "AI Column Analysis Complete"
                    : "Column Analysis Complete (Keyword Matching)"}
                </h3>
                {analysis.ai_powered && (
                  <Badge className="bg-[#00594C]/10 text-[#00594C] border-[#00594C]/20 text-xs">
                    Gemini AI
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Analyzed{" "}
                <span className="font-medium">{analysis.headers.length}</span>{" "}
                columns from{" "}
                <span className="font-medium">
                  {analysis.file_name}
                </span>{" "}
                • Sheet:{" "}
                <span className="font-medium">{analysis.sheet_name}</span>
              </p>
              {analysis.missing_fields?.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Missing required fields:{" "}
                    <strong>
                      {analysis.missing_fields
                        .map((f) => FIELD_LABELS[f] || f)
                        .join(", ")}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapping Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#00594C]" />
            Review & Confirm Column Mappings
          </CardTitle>
          <p className="text-sm text-gray-500">
            The AI has suggested how to map your Excel columns to our database
            fields. Review and adjust any incorrect mappings.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allFields.map((fieldName) => {
              const isRequired = REQUIRED_FIELDS.has(fieldName);
              const selectedHeader = fieldToHeader[fieldName] || "";
              const originalMapping = analysis.mappings.find(
                (m) => m.field_name === fieldName
              );
              const isMapped =
                selectedHeader && selectedHeader !== "__skip__";
              const isRequiredMissing = isRequired && !isMapped;

              return (
                <div
                  key={fieldName}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                    isRequiredMissing
                      ? "border-red-200 bg-red-50/50"
                      : isMapped
                      ? "border-emerald-200/60 bg-emerald-50/20"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {isMapped ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isRequiredMissing ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>

                  {/* Field name */}
                  <div className="w-44 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900">
                        {FIELD_LABELS[fieldName] || fieldName}
                      </span>
                      {isRequired && (
                        <span className="text-red-500 text-xs font-medium">
                          *
                        </span>
                      )}
                    </div>
                    {originalMapping && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {getConfidenceBadge(originalMapping.confidence)}
                        <span
                          className={`text-xs ${getConfidenceColor(originalMapping.confidence)}`}
                        >
                          {Math.round(originalMapping.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column selector */}
                  <div className="flex-1">
                    <Select
                      value={selectedHeader || "__skip__"}
                      onValueChange={(val) =>
                        handleFieldChange(fieldName, val)
                      }
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${
                          isRequiredMissing
                            ? "border-red-300 focus:ring-red-200"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">
                          <span className="text-gray-400">— Skip this field —</span>
                        </SelectItem>
                        {analysis.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI reasoning tooltip */}
                  {originalMapping?.reasoning && (
                    <div
                      className="flex-shrink-0 group relative"
                      title={originalMapping.reasoning}
                    >
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unmapped Columns */}
          {analysis.unmapped_headers?.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400" />
                Unmapped Columns ({analysis.unmapped_headers.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.unmapped_headers.map((h, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-gray-500 bg-gray-50/50"
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Data Preview */}
      {analysis.sample_rows?.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-gray-500" />
              Sample Data Preview (first {analysis.sample_rows.length} rows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {analysis.headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap border-b border-gray-200"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.sample_rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                    >
                      {analysis.headers.map((_, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 text-gray-700 whitespace-nowrap"
                        >
                          {row[ci] || (
                            <span className="text-gray-300 italic">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Back to Upload
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={missingRequired.length > 0}
          className="flex-1 bg-[#00594C] hover:bg-[#00594C]/90 gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {missingRequired.length > 0
            ? `Missing: ${missingRequired
                .map((f) => FIELD_LABELS[f])
                .join(", ")}`
            : "Confirm Mapping & Start Import"}
        </Button>
      </div>
    </div>
  );
}
