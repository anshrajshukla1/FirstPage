import { useEffect, useRef } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppDispatch } from "@/store/store";
import {
  setUser,
  setToken,
  setLoading,
  logout as logoutAction,
  syncUser,
} from "@/store/slices/auth-slice";

export function useInitializeAuth() {
  const dispatch = useAppDispatch();
  /** Last uid we synced to the backend — guards against re-syncing on refresh. */
  const syncedUid = useRef<string | null>(null);

  useEffect(() => {
    // `onIdTokenChanged` — not `onAuthStateChanged` — because Firebase silently
    // rotates the ID token roughly hourly. `onAuthStateChanged` only fires on
    // sign-in/sign-out, so the store would keep serving an expired token and
    // every API call would start 401-ing until a full reload.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        syncedUid.current = null;
        dispatch(setUser(null));
        dispatch(setToken(null));
        dispatch(setLoading(false));
        return;
      }

      try {
        dispatch(setToken(await firebaseUser.getIdToken()));
      } catch {
        // Token unavailable (offline, revoked session) — treat as signed out.
        dispatch(logoutAction());
        return;
      }

      // Only sync on a genuine sign-in; token rotations don't need a round trip.
      if (syncedUid.current === firebaseUser.uid) {
        dispatch(setLoading(false));
        return;
      }
      syncedUid.current = firebaseUser.uid;

      dispatch(
        syncUser({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          photoUrl: firebaseUser.photoURL,
        }),
      );
    });

    // Listen for 401 events from the API client
    const handleUnauthorized = () => {
      syncedUid.current = null;
      signOut(auth).catch(console.error);
      dispatch(logoutAction());
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      unsubscribe();
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [dispatch]);
}
