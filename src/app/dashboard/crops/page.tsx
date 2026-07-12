"use client";

import React, { useEffect, useState } from "react";
import { useCatalogStore, CropCatalog } from "@/stores/useCatalogStore";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";

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
                      <img src={crop.image_url} alt={crop.name} className="h-10 w-10 rounded-full object-cover" />
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingCrop ? "Edit Crop" : "Add Crop"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                >
                  <Trash2 size={16} /> {/* Approximate X icon */}
                </button>
              </div>
              
              <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#00594C] focus:border-[#00594C] block w-full p-2.5" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-[#00594C] focus:border-[#00594C]"></textarea>
                  </div>
                  
                  <div className="col-span-2 flex items-center mt-2">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-[#00594C] bg-gray-100 border-gray-300 rounded focus:ring-[#00594C]" />
                    <label className="ml-2 text-sm font-medium text-gray-900">Is Active</label>
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Image</label>
                    <div className="flex items-center gap-4">
                      {imageUrl && (
                        <img src={imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" 
                      />
                    </div>
                    {isUploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isUploading}
                  className="text-white inline-flex w-full justify-center bg-[#00594C] hover:bg-[#004a3f] focus:ring-4 focus:outline-none focus:ring-[#00594C]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  {editingCrop ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
