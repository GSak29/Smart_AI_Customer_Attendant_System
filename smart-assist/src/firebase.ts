import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVIEGM5kR9bSING72kQhG0YDaUdwxkAig",
  authDomain: "smartretail-iot.firebaseapp.com",
  databaseURL: "https://smartretail-iot-default-rtdb.firebaseio.com",
  projectId: "smartretail-iot",
  storageBucket: "smartretail-iot.firebasestorage.app",
  messagingSenderId: "154269749406",
  appId: "1:154269749406:web:d8fca1550663cf50fcab8f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const realtimeDB = getDatabase(app);
export const auth = getAuth(app);
