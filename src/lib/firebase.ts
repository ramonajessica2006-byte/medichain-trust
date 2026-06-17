import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfig } from "./firebase-config.functions";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let initPromise: Promise<{ app: FirebaseApp; auth: Auth; db: Firestore }> | null = null;

export function initFirebase() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const cfg = await getFirebaseConfig();
    if (!cfg.apiKey) throw new Error("Firebase config missing. Add Firebase secrets in Project Settings.");
    app = getApps()[0] ?? initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  })();
  return initPromise;
}

export function getDb() {
  if (!db) throw new Error("Firebase not initialized — call initFirebase() first");
  return db;
}
export function getAuthInstance() {
  if (!auth) throw new Error("Firebase not initialized — call initFirebase() first");
  return auth;
}
