import React, { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/router';

const ProtectedRoute = ({ children }) => {
const { user, loading } = useAuth();
const router = useRouter();

useEffect(() => {
    if (!loading && !user) {
     router.push('/signin');
    }
}, [loading, user, router]);

if (loading) {
    return <div>Loading...</div>; // Optional: Add a loading spinner or any other loading indicator.
}

return user ? <>{children}</> : null;
};

export default ProtectedRoute;