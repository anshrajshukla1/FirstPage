import { useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setUser,
  setToken,
  setLoading,
  logout as logoutAction,
  syncUser,
} from "@/store/slices/auth-slice";
import { setTokenGetter } from "@/api/client";
import type { Role } from "@/types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth,
  );

  // Wire up the token getter for the API client
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  // Subscribe to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        dispatch(setToken(idToken));

        // Sync user to backend
        dispatch(
          syncUser({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? "",
            photoUrl: firebaseUser.photoURL,
          }),
        );
      } else {
        dispatch(setUser(null));
        dispatch(setToken(null));
        dispatch(setLoading(false));
      }
    });

    // Listen for 401 events from the API client
    const handleUnauthorized = () => {
      signOut(auth).catch(console.error);
      dispatch(logoutAction());
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      unsubscribe();
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [dispatch]);

  const signInWithGoogle = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google sign-in failed:", err);
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      dispatch(logoutAction());
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    role: user?.role as Role | undefined,
    signInWithGoogle,
    logout: handleLogout,
  };
}
