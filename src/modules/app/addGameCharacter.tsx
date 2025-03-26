import React, { useEffect, useState } from "react";
import { Feature, Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { LineString, Point } from "ol/geom";
import { Icon, Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";

export const playerStyle = (mirror: boolean = false) => {
  return new Style({
    image: new Icon({
      src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png",
      scale: mirror ? [-1, 1] : [1, 1],
      anchor: [0.5, 0.5],
    }),
  });
};
const backwardsPlayerStyle = () => {
  return new Style({
    image: new Icon({
      src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/132.png",
      scale: 1,
      anchor: [0.5, 0.5],
    }),
  });
};

export const source = new VectorSource({});
export const playerLayer = new VectorLayer({
  source: source,
  style: playerStyle(false),
});

const swordStyle = () => {
  return new Style({
    stroke: new Stroke({
      width: 3,
      color: "gold",
    }),
  });
};

interface SnakeButtonProps {
  map: Map;
  source: VectorSource;
}

export function GameButton({ map, source }: SnakeButtonProps) {
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);

  const speed = 0.002;

  function drawPoint() {
    source.clear();
    const draw = new Draw({ type: "Point", source });
    map.addInteraction(draw);
    source.once("addfeature", (e) => {
      map.removeInteraction(draw);
      setCurrentFeature(e.feature!);
    });
  }

  function swordSwing() {
    if (!currentFeature) return;

    const playerGeom = currentFeature.getGeometry() as Point;
    const playerCoords = playerGeom.getCoordinates();

    const swordLength = 0.015;
    const initialAngle = -2;
    const finalAngle = (Math.PI / 3) * 4;

    const swordCoords = [
      playerCoords,
      [
        playerCoords[0] + swordLength * Math.cos(initialAngle),
        playerCoords[1] + swordLength * Math.sin(initialAngle),
      ],
    ];

    const swordFeature = new Feature({
      geometry: new LineString(swordCoords),
    });

    source.addFeature(swordFeature);
    swordFeature.setStyle(swordStyle());
    let startTime: number | null = null;
    const animationDuration = 500;
    const animationStep = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / animationDuration;

      if (progress < 1) {
        const angle = initialAngle + progress * (finalAngle - initialAngle);

        const newSwordCoords = [
          playerCoords,
          [
            playerCoords[0] + swordLength * Math.cos(angle),
            playerCoords[1] + swordLength * Math.sin(angle),
          ],
        ];
        swordFeature.getGeometry()!.setCoordinates(newSwordCoords);

        requestAnimationFrame(animationStep);
      } else {
        swordFeature
          .getGeometry()!
          .setCoordinates([
            playerCoords,
            [
              playerCoords[0] + swordLength * Math.cos(finalAngle),
              playerCoords[1] + swordLength * Math.sin(finalAngle),
            ],
          ]);
        source.removeFeature(swordFeature);
      }
    };

    requestAnimationFrame(animationStep);
  }

  useEffect(() => {
    if (!currentFeature) return;

    const moveFeature = (xCord: number, yCord: number) => {
      const geom = currentFeature.getGeometry() as Point;
      const coord = geom.getCoordinates();
      const newCoord = [coord[0] + xCord, coord[1] + yCord];
      geom.setCoordinates(newCoord);
      map.getView().setCenter(newCoord);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const step = speed;
      switch (event.key) {
        case "w":
          currentFeature.setStyle(backwardsPlayerStyle);
          moveFeature(0, step);
          break;
        case "s":
          currentFeature.setStyle(playerStyle(false));
          moveFeature(0, -step);
          break;
        case "a":
          currentFeature.setStyle(playerStyle(false));
          moveFeature(-step, 0);
          break;
        case "d":
          currentFeature.setStyle(playerStyle(true));
          moveFeature(step, 0);
          break;
        case " ":
          swordSwing();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFeature]);

  return (
    <>
      <button onClick={drawPoint}>snake?</button>
    </>
  );
}
