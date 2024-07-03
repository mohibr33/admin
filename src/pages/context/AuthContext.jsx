
import { useRouter } from 'next/router';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const { createContext, useContext, useState, useEffect } = require("react");


const AuthContext = createContext(null);


export const useAuth =()=> useContext(AuthContext)




// const cookie = new Cookies();

export const AuthContextProvider=({children})=>{
  const router = useRouter()
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // const users = {
     
    //   'Test@gmail.com': bcrypt.hashSync('Test@12345', 10),
   
    // };
    // const [loading,setLoading] = useState(true)
    
    //


    const login = async (email, password) => {
      axios.post("http://localhost:8080/auth/",{email,password}).then((res)=>{
    if(res.data) {
          const loggedInUser = { email };
          localStorage.setItem('user', 'successfully');
          setUser(loggedInUser);
          return true; // Successful login

    } else return false;
    
  }).catch((error) => { console.log(error)
  })


};
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    }, []);

 

// const signup = async (email, password) => {
//   try {
//     const res = await axios.post("http://localhost:8080/addinguser", { email, password });
//     if (res.data) {
//       const newUser = { email };
//       localStorage.setItem('user', 'successfully');
//       setUser(newUser);
//       return true; // Successful signup
//     } else {
//       return false; // Signup failed
//     }
//   } catch (err) {
//     console.error(err);
//     return false; // Error occurred
//   }
// };
    
      

  

    // const login = async (email, password) => {
    
    //   for (const [storedEmail, storedPassword] of Object.entries(users)) {
        
    //     if (email === storedEmail) {
    //       const passwordMatch = await bcrypt.compare(password, storedPassword);
    //       if (passwordMatch) {
         
    //         const loggedInUser = { email };
    //         localStorage.setItem('user', 'successfully');
    //         setUser(loggedInUser);
    //         return true; // Successful login
    //       } else {
         
    //         return false; // Incorrect password
    //       }
    //     }
    //   }
    //   console.log("User not found:", email);
    //   return false; // User not found
    // };
  




    const logout= ()=>{
      localStorage.removeItem('user'); 
      setUser(null); 
      router.push('/signin'); 
       
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
          {children}
          {/* { loading ? null : children} */}
        </AuthContext.Provider>
      );
}



