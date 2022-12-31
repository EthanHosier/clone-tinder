// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"

//TODO: PUT THESE IN A .env FILE
const firebaseConfig = {
  apiKey: "AIzaSyCsMzh5HSNrFsew0whrCA-bhE1ySFQ01BE",
  authDomain: "clone-tinder-9e7f5.firebaseapp.com",
  projectId: "clone-tinder-9e7f5",
  storageBucket: "clone-tinder-9e7f5.appspot.com",
  messagingSenderId: "1016340327758",
  appId: "1:1016340327758:web:e1251e65e677e23b89821f",
  measurementId: "G-GDLZ6JWH88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

export {auth, db}