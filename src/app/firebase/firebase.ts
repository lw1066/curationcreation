import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrB58K6TNuDM0fpeTiZy3jKLSoZng43wM",
  authDomain: "curationcreation-8ea83.firebaseapp.com",
  projectId: "curationcreation-8ea83",
  storageBucket: "curationcreation-8ea83.appspot.com",
  messagingSenderId: "92317163765",
  appId: "1:92317163765:web:6cae9f8969a48abf0aa5bc",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
