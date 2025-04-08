import React, { useEffect, useState } from "react";

type FloatingPopupProps = {
  x: number;
  y: number;
  text: string;
  duration?: number;
};

export const FloatingPopup: React.FC<FloatingPopupProps> = ({
  x,
  y,
  text,
  duration = 1000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration); // Use the duration here
    return () => clearTimeout(timer);
  }, [duration]);
  const animationClass = duration === 3000 ? "popupLong" : "popupShort";

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
        animation: `${animationClass} ${duration / 1000}s ease-out forwards`,
        pointerEvents: "none",
        zIndex: 999,
      }}
    >
      {text}
    </div>
  );
};
