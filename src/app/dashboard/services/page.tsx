"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCatalogStore, ServiceCatalog } from "@/stores/useCatalogStore";
import { Plus, Edit2, Trash2, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesPage() {
  const { services, isLoading, fetchServices, createService, updateService, deleteService, uploadImage } = useCatalogStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalog | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number>(5.0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setRating(5.0);
    setIsActive(true);
    setImageUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceCatalog) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setRating(service.rating);
    setIsActive(service.is_active);
    setImageUrl(service.image_url);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const url = await uploadImage(file);
    if (url) setImageUrl(url);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name,
      description,
      rating,
      is_active: isActive,
      image_url: imageUrl,
    };

    if (editingService) {
      await updateService(editingService.id, data);
    } else {
      await createService(data);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      await deleteService(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services Catalog</h1>
          <p className="text-gray-500 text-sm">Manage dynamic services available to providers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#00594C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#004a3f]"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && services.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-10 w-10 rounded-full" /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-[150px] mb-2" />
                    <Skeleton className="h-3 w-[100px]" />
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-[250px]" /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-5 w-[60px] rounded-full" /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : services.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No services found.</td></tr>
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {service.image_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                        <Image src={service.image_url} alt={service.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-500">Rating: {service.rating}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md truncate">{service.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(service)} className="text-[#00594C] hover:text-[#004a3f] mr-4">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                  {editingService ? "Edit Service" : "Add Service"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <form className="px-6 pb-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00594C]/20 focus:border-[#00594C] transition-all" placeholder="e.g. Tractor Plowing" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00594C]/20 focus:border-[#00594C] transition-all resize-none" placeholder="Provide a brief description of the service..."></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Rating</label>
                      <input type="number" step="0.1" value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00594C]/20 focus:border-[#00594C] transition-all" placeholder="5.0" />
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center justify-between pt-6">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#00594C] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">{isActive ? "Active" : "Inactive"}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
                    <div className="relative group mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#00594C] transition-colors bg-gray-50/30 overflow-hidden">
                      {imageUrl ? (
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="relative h-24 w-24 overflow-hidden rounded-lg shadow-sm border border-gray-200">
                             <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="96px" />
                          </div>
                          <div className="mt-3 flex text-sm text-[#00594C] font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            <ImageIcon className="w-4 h-4 mr-1.5" />
                            Change Photo
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-center z-10">
                          <div className="mx-auto h-12 w-12 bg-[#00594C]/5 rounded-full flex items-center justify-center">
                            <UploadCloud className="h-6 w-6 text-[#00594C]" />
                          </div>
                          <div className="flex justify-center text-sm text-gray-600">
                            <span className="relative font-medium text-[#00594C] hover:text-[#004a3f]">
                              Upload a file
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                      />
                    </div>
                    {isUploading && <p className="text-sm text-[#00594C] font-medium mt-2 animate-pulse flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#00594C] border-t-transparent rounded-full animate-spin"></div> Uploading image...</p>}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full mt-8 py-3.5 px-4 bg-[#00594C] hover:bg-[#004a3f] text-white rounded-xl font-medium text-sm transition-transform active:scale-[0.98] flex justify-center items-center shadow-md shadow-[#00594C]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {editingService ? "Save Changes" : "Add Service"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
