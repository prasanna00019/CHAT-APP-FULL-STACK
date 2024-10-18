import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { browserLocalPersistence, browserSessionPersistence, getAuth, setPersistence } from "firebase/auth";
// const firebaseConfig = {
//   apiKey: "AIzaSyCj1G6wwEmJwKRPZabivcuWacgtEBv60y0",
//   authDomain: "chat-app-f65de.firebaseapp.com",
//   projectId: "chat-app-f65de",
//   storageBucket: "chat-app-f65de.appspot.com",
//   messagingSenderId: "981332016370",
//   appId: "1:981332016370:web:962d505ba856bf8f69a46b",
//   measurementId: "G-G6T94Z0LYS"
// };
const firebaseConfig = {
  apiKey: "AIzaSyAOexYwqbBC4Ge3U77t7ZEP7BN-bMNFYGA",
  authDomain: "code-execution-engine.firebaseapp.com",
  projectId: "code-execution-engine",
  storageBucket: "code-execution-engine.appspot.com",
  messagingSenderId: "691206070364",
  appId: "1:691206070364:web:249c1649ac97fbd1cd4699",
  measurementId: "G-MBD2PWS28L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Persistence set to local.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
const storage =getStorage(app);
export { storage };  
export { auth };
export const db = getFirestore(app);

