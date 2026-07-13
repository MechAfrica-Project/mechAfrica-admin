"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCatalogStore, CropCatalog } from "@/stores/useCatalogStore";
import { Plus, Edit2, Trash2, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CropsPage() {
  const { crops, isLoading, fetchCrops, createCrop, updateCrop, deleteCrop, uploadImage } = useCatalogStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropCatalog | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const openCreateModal = () => {
    setEditingCrop(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setImageUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (crop: CropCatalog) => {
    setEditingCrop(crop);
    setName(crop.name);
    setDescription(crop.description);
    setIsActive(crop.is_active);
    setImageUrl(crop.image_url);
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
      is_active: isActive,
      image_url: imageUrl,
    };

    if (editingCrop) {
      await updateCrop(editingCrop.id, data);
    } else {
      await createCrop(data);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this crop?")) {
      await deleteCrop(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Crops Catalog</h1>
          <p className="text-gray-500 text-sm">Manage dynamic crops available to farmers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#00594C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#004a3f]"
        >
          <Plus size={18} />
          Add Crop
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
            {isLoading && crops.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : crops.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No crops found.</td></tr>
            ) : (
              crops.map((crop) => (
                <tr key={crop.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {crop.image_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                        <Image src={crop.image_url} alt={crop.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md truncate">{crop.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${crop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {crop.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(crop)} className="text-[#00594C] hover:text-[#004a3f] mr-4">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(crop.id)} className="text-red-600 hover:text-red-900">
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
                  {editingCrop ? "Edit Crop" : "Add Crop"}
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
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00594C]/20 focus:border-[#00594C] transition-all" placeholder="e.g. Tomato" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00594C]/20 focus:border-[#00594C] transition-all resize-none" placeholder="Provide a brief description of the crop..."></textarea>
                  </div>
                  
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#00594C] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{isActive ? "Active" : "Inactive"}</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
                    <div className="relative group mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#00594C] transition-colors bg-gray-50/30 overflow-hidden">
                      {imageUrl ? (
                        <div className="relative z-10 flex flex-col items-center">
                          <Image src={imageUrl} alt="Preview" width={96} height={96} className="h-24 w-24 object-cover rounded-lg shadow-sm border border-gray-200" />
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
                  {editingCrop ? "Save Changes" : "Add Crop"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
