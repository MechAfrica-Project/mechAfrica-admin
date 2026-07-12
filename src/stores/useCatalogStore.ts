import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ServiceCatalog {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CropCatalog {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CatalogState {
  services: ServiceCatalog[];
  crops: CropCatalog[];
  isLoading: boolean;
  error: string | null;

  fetchServices: () => Promise<void>;
  createService: (data: Partial<ServiceCatalog>) => Promise<boolean>;
  updateService: (id: string, data: Partial<ServiceCatalog>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  fetchCrops: () => Promise<void>;
  createCrop: (data: Partial<CropCatalog>) => Promise<boolean>;
  updateCrop: (id: string, data: Partial<CropCatalog>) => Promise<boolean>;
  deleteCrop: (id: string) => Promise<boolean>;

  uploadImage: (file: File) => Promise<string | null>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  services: [],
  crops: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        set({ services: data.data || [], isLoading: false });
      } else {
        throw new Error(data.error || "Failed to fetch services");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createService: async (serviceData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      });
      if (res.ok) {
        useCatalogStore.getState().fetchServices();
        return true;
      }
      const data = await res.json();
      throw new Error(data.error || "Failed to create service");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  updateService: async (id, serviceData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      });
      if (res.ok) {
        useCatalogStore.getState().fetchServices();
        return true;
      }
      const data = await res.json();
      throw new Error(data.error || "Failed to update service");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        useCatalogStore.getState().fetchServices();
        return true;
      }
      const data = await res.json();
      throw new Error(data.error || "Failed to delete service");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  fetchCrops: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/crops`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        set({ crops: data.data || [], isLoading: false });
      } else {
        throw new Error(data.error || "Failed to fetch crops");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createCrop: async (cropData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/crops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cropData),
      });
      if (res.ok) {
        useCatalogStore.getState().fetchCrops();
        return true;
      }
      const data = await res.json();
      throw new Error(data.error || "Failed to create crop");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  updateCrop: async (id, cropData) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/crops/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cropData),
      });
      if (res.ok) {
        useCatalogStore.getState().fetchCrops();
        return true;
      }
      const data = await res.json();
      throw new Error(data.error || "Failed to update crop");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  deleteCrop: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/admin/catalog/crops/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        useCatalogStore.getState().fetchCrops();
        return true;
      }
      const data = await res.json();
      throw new Error(data.error || "Failed to delete crop");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  uploadImage: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/admin/catalog/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.image_url) {
        set({ isLoading: false });
        return data.image_url;
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },
}));
