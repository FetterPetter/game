import React, { useEffect, useState } from "react";
import { FloatingPopup } from "./floatingPopUp";
import { registerPopupCallback } from "./popUpManager";

type Popup = {
  x: number;
  y: number;
  text: string;
  duration: number;
  id: number;
};

export const PopupLayer = () => {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    registerPopupCallback((x, y, text, duration = 1000) => {
      const id = Date.now();
      setPopups((prev) => [...prev, { x, y, text, duration, id }]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== id));
      }, duration);
    });
  }, []);

  return (
    <>
      {popups.map((popup) => (
        <FloatingPopup
          key={popup.id}
          x={popup.x}
          y={popup.y}
          text={popup.text}
          duration={popup.duration}
        />
      ))}
    </>
  );
};
