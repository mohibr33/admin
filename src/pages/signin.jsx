
'use client'
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/router";


const SignIn = () => {
    const router = useRouter();
    const { login, loading} = useAuth();
    const [error, setError] = useState('')
  const [data, setData] = useState({
    email:"",
    password:""
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    // Handle sign-in logic
    
    try {
        await login(data.email, data.password)
        router.push('/')
    } catch (err){
        console.log(err,'Invaid email or password');
    }
  };

  





  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              value={data.email}
              onChange={(e) => setData({
                ...data, email:e.target.value ,
              })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
              value={data.password}
              onChange={(e) => setData({
                ...data, password: e.target.value,
              })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
