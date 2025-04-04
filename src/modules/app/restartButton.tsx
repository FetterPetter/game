import React, { useEffect } from "react";

const RestartButton = () => {
  useEffect(() => {
    setTimeout(() => {
      window.addEventListener("keydown", handleSpacebarPress);
    }, 1000);
    const handleSpacebarPress = (event: KeyboardEvent) => {
      if (event.key === " ") {
        window.location.reload();
      }
    };

    return () => {
      window.removeEventListener("keydown", handleSpacebarPress);
    };
  }, []);

  return (
    <div>
      <button onClick={() => window.location.reload()}>Restart</button>
    </div>
  );
};

export default RestartButton;
