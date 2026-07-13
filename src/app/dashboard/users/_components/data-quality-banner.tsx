import { AlertTriangle } from "lucide-react";
import { DataQualitySummary } from "@/lib/api";

interface DataQualityBannerProps {
  data: DataQualitySummary | null;
  activeFilters?: string[];
  onFilter: (filterType: string) => void;
  onClearFilters?: () => void;
}

export function DataQualityBanner({ data, activeFilters = [], onFilter, onClearFilters }: DataQualityBannerProps) {
  if (!data || data.incomplete === 0) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] shadow-sm">
      <div className="flex items-start p-4 sm:p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/20">
          <AlertTriangle className="h-5 w-5 text-[#D97706]" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-base font-semibold text-[#92400E]">
            Data Quality Alert: {data.incomplete.toLocaleString()} Profiles Require Attention
          </h3>
          <p className="mt-1 text-sm text-[#B45309]">
            We&apos;ve identified user profiles with missing critical information. Please update them to ensure seamless operations and avoid data loss.
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {data.phone_missing > 0 && (
              <button 
                onClick={() => onFilter("missing_phone")}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border shadow-sm transition-all duration-200 ease-in-out ${
                  activeFilters.includes("missing_phone") 
                    ? "bg-[#D97706] text-white border-[#B45309] hover:bg-[#B45309] scale-[1.02]" 
                    : "bg-white text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7] hover:border-[#F59E0B]"
                }`}
              >
                {activeFilters.includes("missing_phone") && <X className="mr-1.5 h-3.5 w-3.5" />}
                Missing Phone: {data.phone_missing.toLocaleString()}
              </button>
            )}
            {data.first_name_missing > 0 && (
              <button 
                onClick={() => onFilter("missing_first_name")}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border shadow-sm transition-all duration-200 ease-in-out ${
                  activeFilters.includes("missing_first_name") 
                    ? "bg-[#D97706] text-white border-[#B45309] hover:bg-[#B45309] scale-[1.02]" 
                    : "bg-white text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7] hover:border-[#F59E0B]"
                }`}
              >
                {activeFilters.includes("missing_first_name") && <X className="mr-1.5 h-3.5 w-3.5" />}
                Missing First Name: {data.first_name_missing.toLocaleString()}
              </button>
            )}
            {data.last_name_missing > 0 && (
              <button 
                onClick={() => onFilter("missing_last_name")}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border shadow-sm transition-all duration-200 ease-in-out ${
                  activeFilters.includes("missing_last_name") 
                    ? "bg-[#D97706] text-white border-[#B45309] hover:bg-[#B45309] scale-[1.02]" 
                    : "bg-white text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7] hover:border-[#F59E0B]"
                }`}
              >
                {activeFilters.includes("missing_last_name") && <X className="mr-1.5 h-3.5 w-3.5" />}
                Missing Last Name: {data.last_name_missing.toLocaleString()}
              </button>
            )}
            {data.location_missing > 0 && (
              <button 
                onClick={() => onFilter("missing_location")}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border shadow-sm transition-all duration-200 ease-in-out ${
                  activeFilters.includes("missing_location") 
                    ? "bg-[#D97706] text-white border-[#B45309] hover:bg-[#B45309] scale-[1.02]" 
                    : "bg-white text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7] hover:border-[#F59E0B]"
                }`}
              >
                {activeFilters.includes("missing_location") && <X className="mr-1.5 h-3.5 w-3.5" />}
                Missing Geo-coords or Community: {data.location_missing.toLocaleString()}
              </button>
            )}
            {data.id_missing > 0 && (
              <button 
                onClick={() => onFilter("missing_id")}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border shadow-sm transition-all duration-200 ease-in-out ${
                  activeFilters.includes("missing_id") 
                    ? "bg-[#D97706] text-white border-[#B45309] hover:bg-[#B45309] scale-[1.02]" 
                    : "bg-white text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7] hover:border-[#F59E0B]"
                }`}
              >
                {activeFilters.includes("missing_id") && <X className="mr-1.5 h-3.5 w-3.5" />}
                Missing Ghana Card / ID: {data.id_missing.toLocaleString()}
              </button>
            )}
            
            {activeFilters.length > 0 && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-[#B45309] hover:text-[#92400E] underline transition-colors decoration-[#FCD34D] hover:decoration-[#D97706] underline-offset-2"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-[#FEF3C7] px-5 py-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-[#92400E]">
          <span>Overall Profile Completion: {data.completion_pct}%</span>
          <div className="w-48 h-2 rounded-full bg-[#FDE68A] overflow-hidden ml-4">
            <div 
              className="h-full bg-[#D97706] rounded-full" 
              style={{ width: `${data.completion_pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
