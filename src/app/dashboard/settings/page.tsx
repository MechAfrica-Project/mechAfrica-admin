"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Phone, MessageSquare, Plus, Trash2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SystemSetting } from "@/lib/api/types";

type SmsTemplate = {
  id: string;
  target_role: "farmer" | "service_provider" | "agent";
  content: string;
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<number | null>(null);

  // Baseline state for dirty-checking
  const [initialUssdCode, setInitialUssdCode] = useState("");
  const [initialTemplates, setInitialTemplates] = useState<string>("[]");

  const [ussdCode, setUssdCode] = useState("");
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    ussdCode !== initialUssdCode || JSON.stringify(templates) !== initialTemplates;

  // Page load
  useEffect(() => {
    fetchSettings();
  }, []);

  // Navigation guard – warn on tab close / refresh when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSettings();
      if (res.success && res.data) {
        const ussdSetting = res.data.find((s: SystemSetting) => s.key === "ussd_code");
        if (ussdSetting) {
          setUssdCode(ussdSetting.value);
          setInitialUssdCode(ussdSetting.value);
        }

        const templateSetting = res.data.find(
          (s: SystemSetting) => s.key === "welcome_sms_templates"
        );
        if (templateSetting) {
          try {
            const parsed = JSON.parse(templateSetting.value);
            if (Array.isArray(parsed)) {
              // Backward-compat: old format was string[], new format is SmsTemplate[]
              const normalized: SmsTemplate[] = parsed.map((t) => {
                if (typeof t === "string") {
                  return {
                    id: Math.random().toString(36).substring(7),
                    target_role: "farmer" as const,
                    content: t,
                  };
                }
                return { id: t.id ?? Math.random().toString(36).substring(7), ...t };
              });
              setTemplates(normalized);
              setInitialTemplates(JSON.stringify(normalized));
            }
          } catch {
            console.error("Failed to parse templates JSON");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await api.updateSetting("ussd_code", {
        value: ussdCode,
        description: "The main USSD code for the platform.",
      });

      const validTemplates = templates.filter((t) => t.content.trim() !== "");
      await api.updateSetting("welcome_sms_templates", {
        value: JSON.stringify(validTemplates),
        description:
          "JSON array of welcome SMS templates sent to new users. Each item has target_role and content.",
      });

      // Sync baseline so isDirty resets to false
      setInitialUssdCode(ussdCode);
      setInitialTemplates(JSON.stringify(validTemplates));
      setTemplates(validTemplates);

      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const addTemplate = () => {
    setTemplates([
      ...templates,
      {
        id: Math.random().toString(36).substring(7),
        target_role: "farmer",
        content: "",
      },
    ]);
  };

  const updateTemplate = (index: number, field: keyof SmsTemplate, val: string) => {
    const next = [...templates];
    next[index] = { ...next[index], [field]: val };
    setTemplates(next);
  };

  const removeTemplate = (index: number) => {
    const next = [...templates];
    next.splice(index, 1);
    setTemplates(next);
  };

  /**
   * Calls the backend AI endpoint.
   * If the current card is empty, replaces it with the 3 generated variants.
   * If not empty, inserts the 3 variants directly after this card.
   */
  const handleAIGenerate = async (index: number) => {
    const template = templates[index];
    try {
      setIsGeneratingAI(index);
      const res = await api.generateWelcomeSMSTemplates(template.target_role);

      if (res.success && res.data?.templates?.length) {
        const generated: SmsTemplate[] = res.data.templates.map((content) => ({
          id: Math.random().toString(36).substring(7),
          target_role: template.target_role,
          content,
        }));

        const next = [...templates];
        if (!template.content.trim()) {
          // Replace empty card with the 3 generated
          next.splice(index, 1, ...generated);
        } else {
          // Insert after this card
          next.splice(index + 1, 0, ...generated);
        }
        setTemplates(next);
        toast.success(`Generated ${generated.length} variations!`);
      } else {
        throw new Error(res.message || "Failed to generate templates");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate template");
    } finally {
      setIsGeneratingAI(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00594C]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#00594C]" />
            System Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage global platform configurations.</p>
        </div>
        {isDirty && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#00594C] hover:bg-[#00473D] text-white transition-all duration-200 animate-in fade-in zoom-in"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-500" />
              Core Routing
            </CardTitle>
            <CardDescription>Global routing codes and IDs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ussd">Platform USSD Code</Label>
              <Input
                id="ussd"
                value={ussdCode}
                onChange={(e) => setUssdCode(e.target.value)}
                placeholder="*920*45#"
              />
              <p className="text-xs text-gray-500">
                This code is injected into SMS templates and shown in the apps.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SMS Templates */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                Welcome SMS Templates
              </CardTitle>
              <CardDescription>
                When a user signs up, the system randomly selects one template matching their role.
                <br />
                Variables:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{{NAME}}"}</code>{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{{USSD_CODE}}"}</code>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addTemplate}
              className="shrink-0 gap-1"
            >
              <Plus className="w-4 h-4" /> Add Template
            </Button>
          </CardHeader>

          <CardContent className="space-y-5">
            {templates.map((template, idx) => {
              const estimatedLength = template.content
                .replace("{{NAME}}", "John Doe (Farmer)")
                .replace("{{USSD_CODE}}", ussdCode || "*920*45#").length;

              const isOverLimit = estimatedLength > 160;

              return (
                <div
                  key={template.id}
                  className="relative bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
                >
                  {/* Card actions */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                    <button
                      onClick={() => handleAIGenerate(idx)}
                      disabled={isGeneratingAI !== null}
                      className="flex items-center gap-1 text-xs font-medium text-[#00594C] bg-[#00594C]/10 px-2.5 py-1 rounded-full hover:bg-[#00594C]/20 disabled:opacity-40 transition-colors"
                      title="Generate 3 variations with AI"
                    >
                      {isGeneratingAI === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {isGeneratingAI === idx ? "Drafting…" : "AI Draft"}
                    </button>
                    <button
                      onClick={() => removeTemplate(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="space-y-3.5 mt-1 pr-28">
                    <div className="max-w-xs">
                      <Label className="mb-1.5 block text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        Target Audience
                      </Label>
                      <Select
                        value={template.target_role}
                        onValueChange={(val) => updateTemplate(idx, "target_role", val)}
                      >
                        <SelectTrigger className="bg-white h-9">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmer">Farmer</SelectItem>
                          <SelectItem value="service_provider">Service Provider</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        Message Content
                      </Label>
                      <Textarea
                        value={template.content}
                        onChange={(e) => updateTemplate(idx, "content", e.target.value)}
                        className={`min-h-[80px] bg-white resize-y ${
                          isOverLimit ? "border-red-300 focus-visible:ring-red-500" : ""
                        }`}
                        placeholder={`Welcome to MechAfrica, {{NAME}}! Dial {{USSD_CODE}} to ${
                          template.target_role === "farmer" ? "request" : "offer"
                        } services.`}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Variation {idx + 1}</span>
                    <span
                      className={`text-xs font-medium ${
                        isOverLimit ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      Est. {estimatedLength} / 160 chars{" "}
                      {isOverLimit && "(Warning: Multiple SMS)"}
                    </span>
                  </div>
                </div>
              );
            })}

            {templates.length === 0 && (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                <MessageSquare className="w-8 h-8 mb-2 text-gray-300" />
                <p className="font-medium">No templates configured.</p>
                <p className="text-sm mt-1">
                  Users won&apos;t receive a welcome SMS until you add one.
                </p>
                <Button variant="outline" size="sm" onClick={addTemplate} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" /> Create First Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
