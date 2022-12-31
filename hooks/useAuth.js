import React, { createContext, useContext, useEffect, useState, useMemo} from 'react'
import 'expo-dev-client';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {FIREBASE_WEB_CLIENT_ID} from '@env'
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from 'firebase/auth';
import {auth} from "../firebase"

WebBrowser.maybeCompleteAuthSession();

const config = {
  clientId: FIREBASE_WEB_CLIENT_ID,
}


//TODO WHEN WAKE UP: USE OTHER METHOD OF CONNECTING TO GOOGLE, then from that connect to database
const AuthContext = createContext({});

export const AuthProvider = ({children}) => {

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(config)

  const [error,setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(
    () =>
    onAuthStateChanged(auth, (user) =>{ //as single line, unsub implemented for us TODO: more research on unsub
      if(user){
        setUser(user);
      } else {
        //not logged in
        setUser(null);
      }

      //only loading while fetching the user
      setLoadingInitial(false)
    }
    ), [])

  const logout = () =>{
    setLoading(true);

    signOut(auth).catch((error) => setError(error))
    .finally(setLoading(false))
  }

  const signInWithGoogle = async() =>{
    setLoading(true);

    promptAsync().then(async (loginResult) => {

        if(loginResult.type === "success"){
          const { id_token } = loginResult.params;
          const credential = GoogleAuthProvider.credential(id_token);
          await signInWithCredential(auth, credential);
        }

        return Promise.reject();
    }).catch(error => setError(error))
    .finally(() => setLoading(false))
      
  }
   
  //TODO: revise useMemo()
  const memoedValue = useMemo(() =>({
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  }), [user, loading, error])

  return (
    <AuthContext.Provider value={
        memoedValue
    }>
        {!loadingInitial&&children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
    return useContext(AuthContext);
}