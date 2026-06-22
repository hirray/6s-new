import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAusD755bJm-CvnLtqOZaqdv77gyKt_usI",
  authDomain: "fir-edab9.firebaseapp.com",
  projectId: "fir-edab9",
  storageBucket: "fir-edab9.firebasestorage.app",
  messagingSenderId: "659444199187",
  appId: "1:659444199187:web:33eac3a950bf06453af4e6",
  measurementId: "G-HGR1KG7XTN"
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth, app };
