import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import {initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, browserPopupRedirectResolver, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import 'firebase/compat/analytics';
import { getStorage, ref } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const app = firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    databaseUrl: process.env.REACT_APP_FIREBASE_DATABASE_URL,
})
// window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
export const auth = app.auth()
export default app

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);