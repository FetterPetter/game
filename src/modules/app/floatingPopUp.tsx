import React, { useEffect, useState } from "react";

type FloatingPopupProps = {
  x: number;
  y: number;
  text: string;
};

export const FloatingPopup: React.FC<FloatingPopupProps> = ({ x, y, text }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000); // fade out after 1s
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="floating-popup"
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        color: "#FFD700",
        fontWeight: "bold",
        animation: "popupFade 1s ease-out forwards",
        pointerEvents: "none",
        zIndex: 999,
      }}
    >
      {text}
    </div>
  );
};
