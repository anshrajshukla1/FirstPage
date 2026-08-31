import { useCallback } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setLoading,
  setError,
  clearError,
  logout as logoutAction,
} from "@/store/slices/auth-slice";
import type { Role } from "@/types";

/** Codes Firebase reports when the visitor themselves dismissed the popup. */
const CANCELLED = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

function describe(err: unknown): string | null {
  if (err instanceof FirebaseError) {
    if (CANCELLED.has(err.code)) return null; // Deliberate — not worth a banner.
    if (err.code === "auth/popup-blocked")
      return "Your browser blocked the sign-in popup. Allow popups and try again.";
    if (err.code === "auth/network-request-failed")
      return "Couldn't reach the sign-in service. Check your connection.";
    if (err.code === "auth/unauthorized-domain")
      return "This domain isn't authorised in Firebase Authentication settings.";
  }
  return "Sign-in failed. Please try again.";
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth,
  );

  const signInWithGoogle = useCallback(async () => {
    dispatch(clearError());
    dispatch(setLoading(true));
    try {
      await signInWithPopup(auth, googleProvider);
      // `isLoading` stays true on purpose — the auth listener takes over and
      // clears it once the backend sync settles.
    } catch (err) {
      console.error("Google sign-in failed:", err);
      const message = describe(err);
      // Surfaced on the login page; silence means the user closed the popup.
      if (message) dispatch(setError(message));
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
