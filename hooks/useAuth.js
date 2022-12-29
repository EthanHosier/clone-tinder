import React, { createContext, useContext} from 'react'
import 'expo-dev-client';


const AuthContext = createContext({});

export const AuthProvider = ({children}) => {

  const signInWithGoogle = async() =>{
  }

  return (
    <AuthContext.Provider value={{
        user:null
    }}>
        {children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
    return useContext(AuthContext);
}