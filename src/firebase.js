// src/firebase.js

// This is the correct setup for our project.
// We are importing the functions we need: initializeApp, getAuth, and getFirestore.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is YOUR unique configuration object.
// It tells your app which Firebase project to connect to.
const firebaseConfig = {
  apiKey: "AIzaSyDnVFlfz9HnVBnYttxMJtT6ytx9BMjP8mM",
  authDomain: "flowstate-d4622.firebaseapp.com",
  projectId: "flowstate-d4622",
  storageBucket: "flowstate-d4622.appspot.com", // Note: I corrected this line for you from the original.
  messagingSenderId: "353235956441",
  appId: "1:353235956441:web:deb5c72ed257c0132484c8",
  measurementId: "G-PD2WMSBCJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Authentication service and export it for use in other files
export const auth = getAuth(app);

// Get a reference to the Firestore database service and export it for use in other files
export const db = getFirestore(app);