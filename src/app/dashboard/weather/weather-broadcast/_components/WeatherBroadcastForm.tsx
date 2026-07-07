import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { MapIcon, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

interface LocationNode {
  id: string;
  name: string;
}

interface RegionNode extends LocationNode {
  districts: DistrictNode[];
}

interface DistrictNode extends LocationNode {
  communities: LocationNode[];
}

interface WeatherBroadcastFormProps {
  onSend: (data: {
    title: string;
    body: string;
    region_id?: string;
    district_id?: string;
    community_id?: string;
  }) => void;
  onCancel?: () => void;
}

function generateAiMessage(weather: any, locationStr: string): string {
  if (!weather || !weather.current) return "";
  
  const temp = Math.round(weather.current.temp);
  const condition = weather.current.weather?.[0]?.main || "Clear";
  const desc = weather.current.weather?.[0]?.description || "clear skies";
  const wind = weather.current.wind_speed;

  let advice = "";
  if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("storm") || condition.toLowerCase().includes("drizzle")) {
    advice = "Ensure proper field drainage and delay applying fertilizers or pesticides to prevent immediate runoff.";
  } else if (temp > 32) {
    advice = "Extremely high temperatures expected. Ensure adequate irrigation for heat-sensitive crops and provide protective shade for livestock where possible.";
  } else if (wind > 10) {
    advice = "Strong winds anticipated in your area. Secure loose farming equipment, lightweight structures, and delay any aerial spraying routines.";
  } else {
    advice = "Current weather conditions are highly favorable for standard farming operations, including planting, spraying, and harvesting tasks.";
  }

  return `🌾 Agri-Weather Alert (${locationStr}):\nCurrent temperature is ${temp}°C with ${desc}.\n\nRecommended Action:\n${advice}\n\nPlease stay safe and monitor local updates.`;
}

export function WeatherBroadcastForm({ onSend, onCancel }: WeatherBroadcastFormProps) {
  const [aiNotifications, setAiNotifications] = useState(false);
  
  const [regions, setRegions] = useState<RegionNode[]>([]);
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [communityId, setCommunityId] = useState("");
  
  const [message, setMessage] = useState("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.getLocations();
        if (res.data?.regions) {
          setRegions(res.data.regions);
        }
      } catch (err) {
        toast.error("Failed to load locations from database.");
      } finally {
        setIsLoadingLocations(false);
      }
    }
    loadLocations();
  }, []);

  const selectedRegion = regions.find(r => r.id === regionId);
  const availableDistricts = selectedRegion?.districts || [];
  const selectedDistrict = availableDistricts.find(d => d.id === districtId);
  const availableCommunities = selectedDistrict?.communities || [];

  const handleSend = () => {
    if (!regionId) {
      toast.error("Please select a region first.");
      return;
    }
    if (!message) {
      toast.error("Please provide a broadcast message.");
      return;
    }

    onSend({
      title: "Weather Broadcast",
      body: message,
      region_id: regionId,
      district_id: districtId || undefined,
      community_id: communityId || undefined,
    });
  };

  const handleFetchWeather = async () => {
    if (!regionId) {
      toast.error("Please select a region first.");
      return;
    }
    if (!districtId) {
      toast.error("Please select a district for accurate weather.");
      return;
    }

    setIsFetchingWeather(true);
    try {
      // In a real app, you might map district to coordinates. We'll use Kumasi coordinates as fallback for demo if real coordinates are missing.
      const weatherData: any = await api.getWeather(6.6885, -1.6244);
      
      const regionName = selectedRegion?.name || "";
      const distName = selectedDistrict?.name || "";
      const commName = availableCommunities.find(c => c.id === communityId)?.name || "";
      
      const locationParts = [commName, distName, regionName].filter(Boolean);
      const locationStr = locationParts.join(", ");

      const aiMsg = generateAiMessage(weatherData, locationStr);
      setMessage(aiMsg);
      toast.success("AI Weather alert generated successfully!");
    } catch (err) {
      toast.error("Failed to fetch weather data.");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  useEffect(() => {
    if (aiNotifications && regionId && districtId) {
      handleFetchWeather();
    }
  }, [aiNotifications, districtId]);

  return (
    <div className="flex flex-col space-y-6 text-foreground bg-background rounded-xl p-6 shadow-sm border border-border">
      
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center space-y-2 pb-4 border-b border-border">
        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
          <MapIcon className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Weather Broadcast</h2>
        <p className="text-sm text-muted-foreground text-center max-w-[280px]">
          Target farmers with location-specific weather alerts and actionable advice.
        </p>
      </div>

      {/* Target Location */}
      <div className="space-y-4 pt-2">
        <label className="text-sm font-medium tracking-wide text-muted-foreground uppercase text-xs">
          Target Location
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={regionId} onValueChange={(val) => {
            setRegionId(val);
            setDistrictId("");
            setCommunityId("");
          }} disabled={isLoadingLocations}>
            <SelectTrigger className="h-11 bg-muted/40 border-border">
              <SelectValue placeholder={isLoadingLocations ? "Loading..." : "Select Region"} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={districtId} onValueChange={(val) => {
            setDistrictId(val);
            setCommunityId("");
          }} disabled={!regionId || availableDistricts.length === 0}>
            <SelectTrigger className="h-11 bg-muted/40 border-border">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Community Dropdown */}
        <AnimatePresence>
          {districtId && availableCommunities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-1"
            >
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger className="h-11 bg-muted/40 border-border">
                  <SelectValue placeholder="Select Community (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_communities">All Communities</SelectItem>
                  {availableCommunities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Notifications Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium text-sm">AI Weather Generation</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-generate alerts based on real-time weather
          </p>
        </div>
        <Switch 
          checked={aiNotifications} 
          onCheckedChange={setAiNotifications} 
          disabled={isFetchingWeather}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>

      {/* Broadcast Message Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium tracking-wide text-muted-foreground uppercase text-xs">
            Broadcast Content
          </label>
          <AnimatePresence>
            {isFetchingWeather && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center text-xs text-blue-500 gap-2"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing weather...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <Textarea
          placeholder="e.g., Heavy rainfall expected in your district this afternoon. Please take necessary precautions."
          className="min-h-[140px] resize-none bg-muted/40 border-border focus-visible:ring-blue-500/30 p-4 leading-relaxed"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isFetchingWeather}
        />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} className="hover:bg-muted">
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSend}
          disabled={isFetchingWeather || !regionId || !message}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] transition-all"
        >
          {isFetchingWeather ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Send Broadcast"
          )}
        </Button>
      </div>
    </div>
  );
}
