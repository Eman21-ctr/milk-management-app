import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PencilIcon, PlusIcon } from './icons/Icons';

const AddCoordinatorModal = ({ isOpen, onClose, onSave }) => {
    const initialFormState = { name: '', region: '', contactPerson: '', contactPhone: '' };
    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.region || !formData.contactPerson || !formData.contactPhone) {
            alert('Semua field harus diisi.');
            return;
        }
        onSave(formData);
        setFormData(initialFormState);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah Korwil Baru">
            <div className="space-y-4">
                 <div>
                    <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">Nama Korwil</label>
                    <input type="text" name="name" id="add-name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="add-region" className="block text-sm font-medium text-gray-700">Wilayah</label>
                    <input type="text" name="region" id="add-region" value={formData.region} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="add-contactPerson" className="block text-sm font-medium text-gray-700">Kontak Person</label>
                    <input type="text" name="contactPerson" id="add-contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="add-contactPhone" className="block text-sm font-medium text-gray-700">No. Telepon</label>
                    <input type="text" name="contactPhone" id="add-contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                </div>
            </div>
        </Modal>
    );
};


const EditCoordinatorModal = ({ isOpen, onClose, coordinator, allSPPGs, onSave }) => {
    const [formData, setFormData] = useState(coordinator);

    useEffect(() => {
        setFormData(coordinator);
    }, [coordinator]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSPPGToggle = (sppgId) => {
        setFormData(prev => {
            const sppgIds = prev.sppgIds.includes(sppgId)
                ? prev.sppgIds.filter(id => id !== sppgId)
                : [...prev.sppgIds, sppgId];
            return { ...prev, sppgIds };
        });
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${coordinator.name}`}>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Korwil</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">Wilayah</label>
                    <input type="text" name="region" id="region" value={formData.region} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Kontak Person</label>
                    <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">No. Telepon</label>
                    <input type="text" name="contactPhone" id="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">SPPG yang Ditangani</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {allSPPGs.map(sppg => (
                            <div key={sppg.id} className="flex items-center">
                                <input
                                    id={`sppg-${sppg.id}`}
                                    type="checkbox"
                                    checked={formData.sppgIds.includes(sppg.id)}
                                    onChange={() => handleSPPGToggle(sppg.id)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor={`sppg-${sppg.id}`} className="ml-2 block text-sm text-gray-900">{sppg.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                </div>
            </div>
        </Modal>
    );
};


const CoordinatorsPage = ({ coordinators, sppgs, updateCoordinator, addCoordinator }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState(null);

  const handleEditClick = (coordinator) => {
    setEditingCoordinator(coordinator);
    setIsEditModalOpen(true);
  };

  const handleSaveCoordinator = (updatedData) => {
    if (editingCoordinator) {
      updateCoordinator(editingCoordinator.id, updatedData);
    }
  };
  
  const getSPPGsForCoordinator = (coordinator) => {
    return coordinator.sppgIds.map(id => sppgs.find(k => k.id === id)).filter(Boolean);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Daftar Koordinator Wilayah (Korwil)</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-primary hover:bg-primary-light text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-colors text-sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Tambah Korwil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coordinators.map(coordinator => (
          <div key={coordinator.id} className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-secondary flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-primary-dark">{coordinator.name}</h3>
                        <p className="text-sm text-text-secondary">{coordinator.region}</p>
                    </div>
                    <button onClick={() => handleEditClick(coordinator)} className="text-gray-400 hover:text-primary-dark p-1">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t text-sm space-y-1">
                  <p><span className="font-semibold">Kontak:</span> {coordinator.contactPerson}</p>
                  <p><span className="font-semibold">Telepon:</span> {coordinator.contactPhone}</p>
                  <p><span className="font-semibold">Stok Tersedia:</span> <span className="font-bold text-primary-dark">{coordinator.stock.toLocaleString('id-ID')} Kartoon Box</span></p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Daftar SPPG:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-text-secondary">
                    {getSPPGsForCoordinator(coordinator).map(k => <li key={k.id}>{k.name}</li>)}
                    {getSPPGsForCoordinator(coordinator).length === 0 && <li className="text-gray-400">Belum ada SPPG</li>}
                  </ul>
                </div>
            </div>
          </div>
        ))}
      </div>
      {editingCoordinator && (
        <EditCoordinatorModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            coordinator={editingCoordinator}
            allSPPGs={sppgs}
            onSave={handleSaveCoordinator}
        />
      )}
       <AddCoordinatorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addCoordinator}
      />
    </div>
  );
};

export default CoordinatorsPage;