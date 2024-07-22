import { useCallback, useState } from 'react';
import { Dialog } from '@headlessui/react';

const AddUserButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

 
  
  const handleAddUser = useCallback(async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/addinguser", formData);
      if (res.status === 201) {
        console.log('User added successfully');
        handleCloseModal();
      } else {
        console.error('Failed to add user');
      }
    } catch (err) {
      console.error('An error occurred while adding the user:', err);
    }
  }, [formData, handleCloseModal]);

  return (
    <div>
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
        onClick={handleOpenModal}
      >
        Add User
      </button>
      
      {isOpen && (
        <Dialog open={isOpen} onClose={handleCloseModal} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium flex justify-center leading-6 text-white">
                Add User
              </Dialog.Title>
              <div className="mt-2">
                <form onSubmit={handleAddUser}>
                  <div className="mb-4 text-white">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 text-white rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="password" className="block text-sm text-white font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="w-full p-3 text-white rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                      Add User
                    </button>
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AddUserButton;
