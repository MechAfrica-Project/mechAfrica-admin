"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Phone, MessageSquare, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SystemSetting } from "@/lib/api/types";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ussdCode, setUssdCode] = useState("");
  const [templates, setTemplates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSettings();
      if (res.success && res.data) {
        const ussdSetting = res.data.find((s: SystemSetting) => s.key === "ussd_code");
        if (ussdSetting) {
          setUssdCode(ussdSetting.value);
        }

        const templateSetting = res.data.find((s: SystemSetting) => s.key === "welcome_sms_templates");
        if (templateSetting) {
          try {
            const parsed = JSON.parse(templateSetting.value);
            if (Array.isArray(parsed)) {
              setTemplates(parsed);
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
      
      // Save USSD Code
      await api.updateSetting("ussd_code", {
        value: ussdCode,
        description: "The main USSD code for the platform.",
      });

      // Save Templates
      await api.updateSetting("welcome_sms_templates", {
        value: JSON.stringify(templates.filter(t => t.trim() !== "")),
        description: "JSON array of welcome SMS templates sent to new users. Use {{NAME}} and {{USSD_CODE}} variables.",
      });

      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const addTemplate = () => {
    setTemplates([...templates, ""]);
  };

  const updateTemplate = (index: number, val: string) => {
    const newTemplates = [...templates];
    newTemplates[index] = val;
    setTemplates(newTemplates);
  };

  const removeTemplate = (index: number) => {
    const newTemplates = [...templates];
    newTemplates.splice(index, 1);
    setTemplates(newTemplates);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#00594C]" />
            System Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage global platform configurations.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#00594C] hover:bg-[#00473D] text-white"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
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
                When a user signs up, the system randomly selects one of these templates to send.
                <br />
                Variables: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{{NAME}}"}</code> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{{USSD_CODE}}"}</code>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addTemplate} className="shrink-0 gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {templates.map((template, idx) => {
              // roughly estimating variable replacements, say name is 15 chars, ussd is 9
              const estimatedLength = template
                .replace("{{NAME}}", "John Doe (Farmer)")
                .replace("{{USSD_CODE}}", ussdCode || "*920*45#")
                .length;
                
              const isOverLimit = estimatedLength > 160;

              return (
                <div key={idx} className="relative bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => removeTemplate(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Label className="mb-2 block text-gray-700 font-medium">Variation {idx + 1}</Label>
                  <Textarea
                    value={template}
                    onChange={(e) => updateTemplate(idx, e.target.value)}
                    className={`min-h-[80px] bg-white ${isOverLimit ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                    placeholder="Welcome to MechAfrica, {{NAME}}! Dial {{USSD_CODE}} to easily request services."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Use simple language. Keep it brief.
                    </span>
                    <span className={`text-xs font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                      Est. {estimatedLength} / 160 chars {isOverLimit && "(Warning: Multiple SMS)"}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {templates.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No templates configured. Users won&apos;t receive a welcome SMS.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
