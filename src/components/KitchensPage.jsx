import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { PencilIcon, PlusIcon } from './icons/Icons.jsx';

const AddSPPGModal = ({ isOpen, onClose, onSave }) => {
    const initialFormState = { name: '', district: '', address: '', contactPerson: '', contactPhone: '' };
    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.district || !formData.address || !formData.contactPerson || !formData.contactPhone) {
            alert('Semua field harus diisi.');
            return;
        }
        onSave(formData);
        setFormData(initialFormState);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah SPPG Baru">
            <div className="space-y-4">
                <div>
                    <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">Nama SPPG</label>
                    <input type="text" name="name" id="add-name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="add-district" className="block text-sm font-medium text-gray-700">Kabupaten/Kota</label>
                    <input type="text" name="district" id="add-district" value={formData.district} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="add-address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                    <input type="text" name="address" id="add-address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="add-contactPerson" className="block text-sm font-medium text-gray-700">Penanggung Jawab</label>
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

const EditSPPGModal = ({ isOpen, onClose, sppg, onSave }) => {
    const [formData, setFormData] = useState(sppg);

    useEffect(() => {
        setFormData(sppg);
    }, [sppg]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${sppg.name}`}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama SPPG</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">Kabupaten/Kota</label>
                    <input type="text" name="district" id="district" value={formData.district} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Penanggung Jawab</label>
                    <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">No. Telepon</label>
                    <input type="text" name="contactPhone" id="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300">Batal</button>
                    <button onClick={handleSave} className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                </div>
            </div>
        </Modal>
    );
};

const SPPGsPage = ({ sppgs, updateSPPG, addSPPG }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSPPG, setEditingSPPG] = useState(null);

  const handleEditClick = (sppg) => {
    setEditingSPPG(sppg);
    setIsEditModalOpen(true);
  };

  const handleSaveSPPG = (updatedData) => {
    if (editingSPPG) {
        updateSPPG(editingSPPG.id, updatedData);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Daftar SPPG</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-primary hover:bg-primary-light text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md transition-colors text-sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Tambah SPPG
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sppgs.map((sppg) => (
          <div key={sppg.id} className="bg-surface rounded-xl shadow-md p-6 border-l-4 border-primary flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-primary-dark">{sppg.name}</h3>
                        <p className="text-sm text-text-secondary">{sppg.district}</p>
                    </div>
                    <button onClick={() => handleEditClick(sppg)} className="text-gray-400 hover:text-primary-dark p-1">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t space-y-1 text-sm">
                  <p className="text-text-primary">
                    <span className="font-semibold">Alamat:</span> {sppg.address}
                  </p>
                  <p className="text-text-primary">
                    <span className="font-semibold">Kontak:</span> {sppg.contactPerson}
                  </p>
                  <p className="text-text-primary">
                    <span className="font-semibold">Telepon:</span> {sppg.contactPhone}
                  </p>
                </div>
            </div>
          </div>
        ))}
      </div>
      {editingSPPG && (
        <EditSPPGModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            sppg={editingSPPG}
            onSave={handleSaveSPPG}
        />
      )}
      <AddSPPGModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addSPPG}
      />
    </div>
  );
};

export default SPPGsPage;