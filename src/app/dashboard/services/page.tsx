"use client";

import React, { useEffect, useState } from "react";
import { useCatalogStore, ServiceCatalog } from "@/stores/useCatalogStore";
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from "lucide-react";

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
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No services found.</td></tr>
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {service.image_url ? (
                      <img src={service.image_url} alt={service.name} className="h-10 w-10 rounded-full object-cover" />
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingService ? "Edit Service" : "Add Service"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                >
                  <X size={16} />
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
                  
                  <div className="col-span-1">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Default Rating</label>
                    <input type="number" step="0.1" value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#00594C] focus:border-[#00594C] block w-full p-2.5" />
                  </div>
                  
                  <div className="col-span-1 flex items-center mt-6">
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
                  {editingService ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
