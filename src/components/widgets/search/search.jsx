import { useState, useEffect, Fragment, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { FiSearch } from "react-icons/fi";
import { SiDuckduckgo, SiMicrosoftbing, SiGoogle, SiBaidu, SiBrave } from "react-icons/si";
import { Transition, Dialog } from "@headlessui/react";

import { useAuth } from "pages/context/AuthContext";
import { useRouter } from "next/router";
import { LiaUserEditSolid } from "react-icons/lia";
import { AiOutlineLogout } from "react-icons/ai";
import { IoPersonAddSharp } from "react-icons/io5";
import axios from "axios";


export const searchProviders = {
  google: {
    name: "Google",
    url: "https://www.google.com/search?q=",
    suggestionUrl: "https://www.google.com/complete/search?client=chrome&q=",
    icon: SiGoogle,
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    suggestionUrl: "https://duckduckgo.com/ac/?type=list&q=",
    icon: SiDuckduckgo,
  },
  bing: {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    suggestionUrl: "https://api.bing.com/osjson.aspx?query=",
    icon: SiMicrosoftbing,
  },
  baidu: {
    name: "Baidu",
    url: "https://www.baidu.com/s?wd=",
    suggestionUrl: "http://suggestion.baidu.com/su?&action=opensearch&ie=utf-8&wd=",
    icon: SiBaidu,
  },
  brave: {
    name: "Brave",
    url: "https://search.brave.com/search?q=",
    suggestionUrl: "https://search.brave.com/api/suggest?&rich=false&q=",
    icon: SiBrave,
  },
  custom: {
    name: "Custom",
    url: false,
    icon: FiSearch,
  },
};

function getAvailableProviderIds(options) {
  if (options.provider && Array.isArray(options.provider)) {
    return Object.keys(searchProviders).filter((value) => options.provider.includes(value));
  }
  if (options.provider && searchProviders[options.provider]) {
    return [options.provider];
  }
  return null;
}

const localStorageKey = "search-name";

export function getStoredProvider() {
  if (typeof window !== "undefined") {
    const storedName = localStorage.getItem(localStorageKey);
    if (storedName) {
      return Object.values(searchProviders).find((el) => el.name === storedName);
    }
  }
  return null;
}

export default function Search({ options }) {


  const { t } = useTranslation();

  const availableProviderIds = getAvailableProviderIds(options);

  const [query, setQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(
    searchProviders[availableProviderIds[0] ?? searchProviders.google],
  );
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  useEffect(() => {
    const storedProvider = getStoredProvider();
    let storedProviderKey = null;
    storedProviderKey = Object.keys(searchProviders).find((pkey) => searchProviders[pkey] === storedProvider);
    if (storedProvider && availableProviderIds.includes(storedProviderKey)) {
      setSelectedProvider(storedProvider);
    }
  }, [availableProviderIds]);

  useEffect(() => {
    const abortController = new AbortController();

    if (
      options.showSearchSuggestions &&
      (selectedProvider.suggestionUrl || options.suggestionUrl) && // custom providers pass url via options
      query.trim() !== searchSuggestions[0]
    ) {
      fetch(`/api/search/searchSuggestion?query=${encodeURIComponent(query)}&providerName=${selectedProvider.name}`, {
        signal: abortController.signal,
      })
        .then(async (searchSuggestionResult) => {
          const newSearchSuggestions = await searchSuggestionResult.json();

          if (newSearchSuggestions) {
            if (newSearchSuggestions[1].length > 4) {
              newSearchSuggestions[1] = newSearchSuggestions[1].splice(0, 4);
            }
            setSearchSuggestions(newSearchSuggestions);
          }
        })
        .catch(() => {
          // If there is an error, just ignore it. There just will be no search suggestions.
        });
    }

    return () => {
      abortController.abort();
    };
  }, [selectedProvider, options, query, searchSuggestions]);

  let currentSuggestion;

  function doSearch(value) {
    const q = encodeURIComponent(value);
    const { url } = selectedProvider;
    if (url) {
      window.open(`${url}${q}`, options.target || "_blank");
    } else {
      window.open(`${options.url}${q}`, options.target || "_blank");
    }

    setQuery("");
    currentSuggestion = null;
  }

  const handleSearchKeyDown = (event) => {
    const useSuggestion = searchSuggestions.length && currentSuggestion;
    if (event.key === "Enter") {
      doSearch(useSuggestion ? currentSuggestion : event.target.value);
    }
  };

  if (!availableProviderIds) {
    return null;
  }

  const onChangeProvider = (provider) => {
    setSelectedProvider(provider);
    localStorage.setItem(localStorageKey, provider.name);
  };





  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    role: "0",
    password: ""
  });

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: "", username: "", email: "", role: "0", password: "" });
    setEditingUser(null);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    // console.log("Event check" , e , {id, value})
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleAddUser = useCallback(async (e) => {
    e.preventDefault();
  
    if (editingUser) {
      try {
        const response = await fetch(`http://192.168.123.186:8080/update/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        // console.log("After hitting the API Form data in edit", formData);
  
        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.statusText}`);
        }
  
        const updatedUser = await response.json();
  
        // Create a new user array with the updated user
        const updatedUsers = users.map((user) =>
          user.id === editingUser.id ? updatedUser : user
        );
        setUsers(updatedUsers);
  
        setEditingUser(null);
        setShowUsersModal(true);
      } catch (error) {
        console.error("Failed to update user", error);
      }
    } else {
      try {
        // Check if the user already exists
        const existingUser = users.find(user => user.email === formData.email);
   
        if (existingUser) {
           alert('User already exists');
        } else {
           // Proceed to add the new user
           const { id, ...newUserFormData } = formData; // Remove 'id' from formData
           console.log('Sending new user data:', newUserFormData); // Log the data being sent
   
           const response = await fetch('http://192.168.123.186:8080/addinguser', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUserFormData),
           });
   
           if (!response.ok) {
            throw new Error(`Failed to add user: ${response.statusText}`);
           }
   
           const responseText = await response.text();
           console.log(responseText); // Log the server's plain text response
   
           // Optionally, refetch users to update the list
           await fetchUsers();
   
           // Optionally, show a success message or handle the response as needed
           alert(responseText);
        }
       } catch (error) {
        console.error("Failed to add user", error);
       }
    }
  
    handleCloseModal();
  }, [formData, editingUser, users, fetchUsers, handleCloseModal]);
  

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData(user);
    setShowModal(true);
    setShowUsersModal(false);
  };

  const handleDeleteUser = async (user) => {
    try {
      console.log(`Attempting to delete user with ID: ${user.id}`);
      const response = await fetch(`http://192.168.123.186:8080/deluser/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      const responseText = await response.text(); // Use text() instead of json()
      console.log('Server response:', responseText);
      setUsers(users.filter(u => u.id !== user.id));
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      // Handle error, e.g., show an error message to the user
    }
  };



  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://192.168.123.186:8080/allusers');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
      // console.log("users is here",data);
    } catch (error) {
      setError("Failed to fetch users");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [formData, editingUser, setUsers]);

  const sessionLoggedUser = sessionStorage.getItem('user');
  const user = JSON.parse(sessionLoggedUser);

  return (
    <>
      <div className="text-white flex flex-col p-4 w-full">
        <div className="flex justify-end mb-4 flex-wrap">


          {user['Role'] === 1 &&
            <>
              <button
                className="py-1 gap-1.5 flex justify-center items-center px-2 me-2 mb-2 text-xs font-small text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={handleOpenModal}
              >
                Add User
                <IoPersonAddSharp size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowUsersModal(true)}
                className="py-1 px-2 flex items-center justify-center gap-1.5 me-2 mb-2 text-xs font-small text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                View User
                <LiaUserEditSolid size={14} />
              </button>
            </>
          }

          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="py-1 px-2 me-2 flex  gap-1.5 items-center justify-center mb-2 text-xs font-small text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            Logout
            <AiOutlineLogout size={13} />
          </button>
        </div>

        {/* Add/Edit User Modal */}
        <Transition appear show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleCloseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                      {editingUser ? "Edit User" : "Add User"}
                    </Dialog.Title>
                    <div className="mt-2">
                      <form onSubmit={handleAddUser}>
                        <div className="mb-4 text-white">
                          <label htmlFor="username" className="block text-sm font-medium mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            className="w-full p-3 text-white rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                            value={formData.username}
                            onChange={handleChange}
                            required
                          />
                        </div>
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
                        <div className="mb-4 text-white">
                          <label htmlFor="role" className="block text-sm font-medium mb-2">
                            Role
                          </label>
                          <select
                            id="role"
                            className="w-full p-3 text-white rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                            value={formData.role}
                            onChange={handleChange}
                            required
                          >

                            <option value="0">User</option>
                            <option value="1">Admin</option>
                          </select>
                        </div>
                        <div className="mb-6">
                          <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            className="w-full p-3 text-white rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          >
                            {editingUser ? "Save Changes" : "Add User"}
                          </button>
                          <button
                            type="button"
                            className="ml-2 inline-flex justify-center rounded-md border border-gray-300 bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={handleCloseModal}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* View Users Modal */}
        <Transition appear show={showUsersModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setShowUsersModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                      User List
                    </Dialog.Title>
                    <div className="mt-2">
                      <table className="min-w-full bg-gray-800">
                        <thead>
                          <tr>
                            <th className="py-2 text-white">ID</th>
                            <th className="py-2 text-white">Username</th>
                            <th className="py-2 text-white">Email</th>
                            <th className="py-2 text-white">Role</th>
                            <th className="py-2 text-white">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="py-2 text-white">{user.id}</td>
                              <td className="py-2 text-white">{user.username}</td>
                              <td className="py-2 text-white">{user.email}</td>
                              <td className="py-2 text-white">{user.Role === 0 ? "User" : "Admin"}</td>
                              <td className="py-2 text-white">
                                <button
                                  className="bg-blue-500 text-white px-2 py-1 rounded-lg mr-2"
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="bg-red-500 text-white px-2 py-1 rounded-lg"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
}
