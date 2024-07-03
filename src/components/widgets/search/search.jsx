import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "next-i18next";
import { FiMenu, FiSearch } from "react-icons/fi";
import { SiDuckduckgo, SiMicrosoftbing, SiGoogle, SiBaidu, SiBrave } from "react-icons/si";
import { Listbox, Transition, Combobox, Menu, Dialog } from "@headlessui/react";
import classNames from "classnames";

import ContainerForm from "../widget/container_form";
import Raw from "../widget/raw";

import { useRouter } from "next/router";
import { useAuth } from "pages/context/AuthContext";
import App from "next/app";
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
  const handleCloseModal = () => {
    setShowModal(false);
  };


  const [formData, setFormData] = useState({
  
    email:"",
    password:""
  })
  
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  const router= useRouter()
  const {logout} = useAuth()


 

    const handleAddUser = async (e) => {
      e.preventDefault();
      try {
        const res = await axios.post("http://localhost:8080/addinguser", formData);
        if (res.status === 201) {
          console.log('User added successfully');
          setShowModal(false);
          setFormData({ email: "", password: "" });
        } else {
          console.error('Failed to add user');
        }
      } catch (err) {
        console.error(err);
      }
    };

  return (
     <>
     {/* <div className=" w-full "> */}
    

     {/* <button className="mb-2 flex justify-end" onClick={() => setShowModal(true)}><IoMenu className='w-6 h-8' size={15} /></button> */}
      

   {/* {showModal && <AddUserModal onClose={handleCloseModal} />} */}
 {/* <Dropdown setShowModal={setShowModal} /> */}
        {/* {showModal && <Modal setShowModal={setShowModal} />} */}

      <div className=" text-white flex flex-col p-4 w-full">
      <div className="flex justify-end mb-4">
        <button
          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none"
          onClick={toggleSidebar}
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      <Transition show={showSidebar} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={toggleSidebar}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="fixed inset-y-0 right-0 flex max-w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="w-screen max-w-md">
                    <div className="h-full flex flex-col py-6 bg-gray-800 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">Menu</Dialog.Title>
                          <div className="ml-3 h-7 flex items-center">
                            <button
                              className="bg-gray-800 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={toggleSidebar}
                            >
                              <span className="sr-only">Close panel</span>
                              <FiMenu className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 relative flex-1 px-4 sm:px-6">
                        <button
                          onClick={() => setShowModal(true)}
                          className="block w-full text-left text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                          Add User
                        </button>
                        <button
                          onClick={()=>{
                            logout();
                            router.push('/')
                        }}
                          className="block w-full text-left text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {showModal && (
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
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 flex justify-center text-white">
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
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg mr-2"
                            onClick={() => setShowModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                          >
                            Add User
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
      )}

   
     


     <div className="w-full text-black ">

     
    <ContainerForm options={options} additionalClassNames="grow information-widget-search">
      <Raw>
        <div className=" relative h-8 my-4 min-w-fit z-20 text-black">
          <div className="flex text-black absolute inset-y-0 left-0 items-center pl-3 pointer-events-none w-full text-theme-800 dark:text-white text-black-800" />
          <Combobox value={query}>
            <Combobox.Input
              type="text"
              className="
              overflow-hidden w-full h-full rounded-md
              text-xs text-theme-900 dark:text-white
              placeholder-theme-900 dark:placeholder-white/80
              bg-white/50 dark:bg-white/10
              focus:ring-theme-500 dark:focus:ring-white/50
              focus:border-theme-500 dark:focus:border-white/50
              border border-theme-300 dark:border-theme-200/50 text-black"
              placeholder={t("search.placeholder")}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              required
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={options.focus}
              onBlur={(e) => e.preventDefault()}
              onKeyDown={handleSearchKeyDown}
            />
            <Listbox
              as="div"
              value={selectedProvider}
              onChange={onChangeProvider}
              className="relative text-left"
              disabled={availableProviderIds?.length === 1}
            >
              <div>
                <Listbox.Button
                  className="
                  absolute right-0.5 bottom-0.5 rounded-r-md px-4 py-2 border-1
                  text-white font-medium text-sm
                  bg-theme-600/40 dark:bg-white/10
                  focus:ring-theme-500 dark:focus:ring-white/50  text-black-800" 
                >
                  <selectedProvider.icon className="text-white w-3 h-3" />
                  <span className="sr-only">{t("search.search")}</span>
                </Listbox.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options
                  className="absolute right-0 z-10 mt-1 origin-top-right rounded-md
                  bg-theme-100 dark:bg-theme-600 shadow-lg
                  ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div className="flex flex-col">
                    {availableProviderIds.map((providerId) => {
                      const p = searchProviders[providerId];
                      return (
                        <Listbox.Option key={providerId} value={p} as={Fragment}>
                          {({ active }) => (
                            <li
                              className={classNames(
                                "rounded-md cursor-pointer",
                                active ? "bg-theme-600/10 dark:bg-white/10 dark:text-gray-900" : "dark:text-gray-100",
                              )}
                            >
                              <p.icon className="h-4 w-4 mx-4 my-2" />
                            </li>
                          )}
                        </Listbox.Option>
                      );
                    })}
                  </div>
                </Listbox.Options>
              </Transition>
            </Listbox>

            {searchSuggestions[1]?.length > 0 && (
              <Combobox.Options className="mt-1 rounded-md bg-theme-50 dark:bg-theme-800 border border-theme-300 text-black  dark:border-theme-200/30 cursor-pointer shadow-lg">
                <div className="p-1 bg-white/50 dark:bg-white/10 text-theme-900/90 dark:text-white/90 text-xs">
                  <Combobox.Option key={query} value={query} />
                  {searchSuggestions[1].map((suggestion) => (
                    <Combobox.Option
                      key={suggestion}
                      value={suggestion}
                      onClick={() => {
                        doSearch(suggestion);
                      }}
                      className="flex w-full"
                    >
                      {({ active }) => {
                        if (active) currentSuggestion = suggestion;
                        return (
                          <div
                            className={classNames(
                              "px-2 py-1 rounded-md w-full flex-nowrap",
                              active ? "bg-theme-300/20 dark:bg-white/10" : "",
                            )}
                          >
                            <span className="whitespace-pre">{suggestion.indexOf(query) === 0 ? query : ""}</span>
                            <span className="mr-4 whitespace-pre opacity-50">
                              {suggestion.indexOf(query) === 0 ? suggestion.substring(query.length) : suggestion}
                            </span>
                          </div>
                        );
                      }}
                    </Combobox.Option>
                  ))}
                </div>
              </Combobox.Options>
            )}
          </Combobox>
        </div>
      </Raw>
    </ContainerForm>
    </div>
      
    </div>
    </>
  );
}
