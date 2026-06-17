import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { initFirebase, getAuthInstance } from "./firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  ready: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    initFirebase()
      .then(({ auth }) => {
        setReady(true);
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      })
      .catch((e) => {
        console.error("Firebase init failed", e);
        setLoading(false);
      });
    return () => unsub?.();
  }, []);

  const login = async (email: string, password: string) => {
    await initFirebase();
    await signInWithEmailAndPassword(getAuthInstance(), email, password);
  };
  const logout = async () => {
    await signOut(getAuthInstance());
  };

  return <Ctx.Provider value={{ user, loading, ready, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
