import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toggleTheme, setTheme, type ThemeMode } from "@/store/slices/ui-slice";

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return {
    theme,
    isDark: theme === "dark",
    toggle: () => dispatch(toggleTheme()),
    set: (mode: ThemeMode) => dispatch(setTheme(mode)),
  };
}
