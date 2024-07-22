import { useRouter } from 'next/router';
import axios from 'axios';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback( async (email, password) => {
    try {
      const res = await axios.post('http://192.168.123.186:8080/auth', { email, password });

      if (res.data) {
        const loggedInUser = { email };
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        router.replace('/'); // Navigate to dashboard upon successful login
        return true; // Successful login
      } else {
        return false; // Unsuccessful login
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return false;
    }
  }, []);



  const logout = useCallback( () => {
    sessionStorage.removeItem('user');
    setUser(null);
    router.push('/signin'); // Redirect to signin page
  }, [router])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
