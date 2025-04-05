import { useEffect } from "react";

export function usePreventSpacebarClick() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isButton = document.activeElement?.tagName === "BUTTON";
      if (isButton && e.code === "Space") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
