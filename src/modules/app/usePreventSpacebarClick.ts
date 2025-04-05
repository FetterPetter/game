import { useEffect } from "react";

export function usePreventSpacebarClick() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isButton = document.activeElement?.tagName === "BUTTON";
      if (isButton && e.code === "Space") {
        e.preventDefault(); // Prevents spacebar from "clicking" the button
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
