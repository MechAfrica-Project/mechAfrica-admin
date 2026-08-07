"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Phone, MessageSquare, Plus, Trash2, Loader2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SystemSetting } from "@/lib/api/types";

type RoleType = "farmer" | "service_provider" | "agent";

type SmsTemplate = {
  id: string;
  target_role: RoleType;
  content: string;
};

const ROLES: { id: RoleType; label: string }[] = [
  { id: "farmer", label: "Farmer" },
  { id: "service_provider", label: "Service Provider" },
  { id: "agent", label: "Agent" },
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<RoleType>("farmer");
  
  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<string[]>([]);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<number>>(new Set());

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

  const activeTemplates = templates.filter((t) => t.target_role === activeTab);

  const addBlankTemplate = () => {
    setTemplates([
      ...templates,
      {
        id: Math.random().toString(36).substring(7),
        target_role: activeTab,
        content: "",
      },
    ]);
  };

  const updateTemplate = (id: string, val: string) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, content: val } : t)));
  };

  const removeTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const openAIModal = () => {
    setAiDrafts([]);
    setSelectedDrafts(new Set());
    setIsAIModalOpen(true);
    generateAIDrafts();
  };

  const generateAIDrafts = async () => {
    try {
      setIsGeneratingAI(true);
      const res = await api.generateWelcomeSMSTemplates(activeTab);

      if (res.success && res.data?.templates?.length) {
        setAiDrafts(res.data.templates);
      } else {
        throw new Error(res.message || "Failed to generate templates");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate templates");
      setIsAIModalOpen(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleDraftSelection = (index: number) => {
    const next = new Set(selectedDrafts);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedDrafts(next);
  };

  const addSelectedDraftsToTemplates = () => {
    if (selectedDrafts.size === 0) return;

    const newTemplates: SmsTemplate[] = Array.from(selectedDrafts).map((index) => ({
      id: Math.random().toString(36).substring(7),
      target_role: activeTab,
      content: aiDrafts[index],
    }));

    setTemplates([...templates, ...newTemplates]);
    setIsAIModalOpen(false);
    toast.success(`Added ${newTemplates.length} new template(s)`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00594C]" />
      </div>
    );
  }

  const roleLabel = ROLES.find((r) => r.id === activeTab)?.label || "Role";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#00594C]" />
            System Settings
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage global platform configurations.</p>
        </div>
        {isDirty && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#00594C] hover:bg-[#00473D] text-white transition-all duration-200 animate-in fade-in zoom-in w-full sm:w-auto shadow-md"
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
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Core Routing */}
        <Card className="lg:col-span-4 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-500" />
              Core Routing
            </CardTitle>
            <CardDescription className="text-xs">Global routing codes and IDs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ussd" className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Platform USSD Code</Label>
              <Input
                id="ussd"
                value={ussdCode}
                onChange={(e) => setUssdCode(e.target.value)}
                placeholder="*920*45#"
                className="bg-gray-50/50"
              />
              <p className="text-[11px] text-gray-500 leading-relaxed">
                This code is injected into SMS templates and shown in the apps.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SMS Templates */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#00594C]" />
                    Welcome SMS Templates
                  </CardTitle>
                  <CardDescription className="text-xs mt-1.5">
                    When a user signs up, the system randomly selects one template matching their role.
                  </CardDescription>
                </div>
              </div>
              
              {/* Segmented Control for Roles */}
              <div className="mt-5 p-1 bg-gray-100/80 rounded-lg inline-flex w-full sm:w-auto">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setActiveTab(role.id)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === role.id 
                        ? "bg-white text-[#00594C] shadow-sm ring-1 ring-gray-900/5" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing templates for <strong className="text-gray-900 font-semibold">{roleLabel}s</strong>
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={addBlankTemplate}
                    className="flex-1 sm:flex-none gap-2 bg-white h-9 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Add Blank</span>
                    <span className="sm:hidden">Blank</span>
                  </Button>
                  <Button
                    onClick={openAIModal}
                    className="flex-1 sm:flex-none gap-2 bg-[#00594C] hover:bg-[#00473D] text-white h-9 shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    Generate Ideas
                  </Button>
                </div>
              </div>

              <div className="p-5 space-y-4 bg-gray-50/40">
                {activeTemplates.map((template, idx) => {
                  const estimatedLength = template.content
                    .replace("{{NAME}}", "John Doe (Farmer)")
                    .replace("{{USSD_CODE}}", ussdCode || "*920*45#").length;

                  const isOverLimit = estimatedLength > 160;

                  return (
                    <div
                      key={template.id}
                      className="group relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
                    >
                      <button
                        onClick={() => removeTemplate(template.id)}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Remove template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="pr-10">
                        <Label className="mb-2 block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                          Message Content
                        </Label>
                        <Textarea
                          value={template.content}
                          onChange={(e) => updateTemplate(template.id, e.target.value)}
                          className={`min-h-[80px] bg-gray-50/50 resize-y border-transparent hover:border-gray-200 focus:bg-white focus:border-[#00594C] transition-colors shadow-none ${
                            isOverLimit ? "border-red-300 focus:border-red-500 bg-red-50/30" : ""
                          }`}
                          placeholder={`Welcome to MechAfrica, {{NAME}}! Dial {{USSD_CODE}} to get started.`}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                        <span className="text-xs font-medium text-gray-400">Template {idx + 1}</span>
                        <span
                          className={`text-[11px] font-semibold tracking-wide ${
                            isOverLimit ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          {estimatedLength} / 160 chars
                          {isOverLimit && " • MULTIPLE SMS"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {activeTemplates.length === 0 && (
                  <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center animate-in fade-in">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900">No {roleLabel} templates yet</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Create a blank template or use our AI to generate high-converting welcome messages instantly.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50 border-t border-gray-100 py-3 px-5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] text-gray-500">
                Variables: <code className="bg-gray-200/80 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[10px]">{"{{NAME}}"}</code> <code className="bg-gray-200/80 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[10px]">{"{{USSD_CODE}}"}</code>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* AI Draft Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={(open) => !isGeneratingAI && setIsAIModalOpen(open)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 bg-gray-50 border-gray-200">
          <div className="p-6 bg-white border-b border-gray-100">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-emerald-50 rounded-md ring-1 ring-emerald-100">
                  <Sparkles className="w-4 h-4 text-[#00594C]" />
                </div>
                <DialogTitle className="text-xl">Generate Ideas</DialogTitle>
              </div>
              <DialogDescription>
                AI is drafting welcome messages for <strong>{roleLabel}s</strong>. Select the ones you like.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6">
            {isGeneratingAI ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="p-3 bg-emerald-50 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00594C]" />
                </div>
                <p className="text-sm text-gray-500 font-medium animate-pulse">Drafting variations...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {aiDrafts.map((draft, idx) => {
                  const isSelected = selectedDrafts.has(idx);
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleDraftSelection(idx)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-[#00594C] bg-emerald-50/30 shadow-sm" 
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="absolute top-4 right-4 transition-transform active:scale-95">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00594C]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 pr-8 leading-relaxed">{draft}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsAIModalOpen(false)}
              disabled={isGeneratingAI}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={addSelectedDraftsToTemplates}
              disabled={isGeneratingAI || selectedDrafts.size === 0}
              className="bg-[#00594C] hover:bg-[#00473D] text-white shadow-sm transition-all"
            >
              {selectedDrafts.size > 0 ? (
                <>Add {selectedDrafts.size} Template{selectedDrafts.size > 1 ? "s" : ""}</>
              ) : (
                "Select Templates"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
