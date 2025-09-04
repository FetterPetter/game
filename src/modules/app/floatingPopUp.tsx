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
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);
  const animationClass =
    duration === 6000
      ? "popupLongest"
      : duration === 5000
        ? "popupLonger"
        : duration === 4000
          ? "popupMedium"
          : duration === 3000
            ? "popupLong"
            : "popupShort";
  const fontColor =
    duration === 6000
      ? "#FF6347"
      : duration === 5000
        ? "#FF4500"
        : duration === 4000
          ? "#FFD700"
          : duration === 3000
            ? "#32CD32"
            : "#FFD700";
  if (!visible) return null;

  return (
    <div
      className="floating-popup"
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        transform: "translateX(-50%)",
        color: fontColor,
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
