import React, { useEffect, useState } from "react";
import { Feature, Map, View } from "ol";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { LineString, Point } from "ol/geom";
import { Icon, Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import { pointToLineDistance } from "./helpPointLineDistance";

export const playerStyle = (mirror: boolean = false) => {
  return new Style({
    image: new Icon({
      src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/94.png",
      scale: mirror ? [-1, 1] : [1, 1],
      anchor: [0.5, 0.5],
    }),
  });
};
const backwardsPlayerStyle = () => {
  return new Style({
    image: new Icon({
      src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/94.png",
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
export const enemySource = new VectorSource({});
export const enemyLayer = new VectorLayer({
  source: enemySource,
  style: new Style({
    image: new Icon({
      src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/350.png",
      scale: 1,
    }),
  }),
});
const swordStyle = () => {
  return new Style({
    stroke: new Stroke({
      width: 6,
      color: "crimson",
    }),
  });
};

interface GameButtonProps {
  map: Map;
  source: VectorSource;
}

export function GameButton({ map, source }: GameButtonProps) {
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [killCount, setKillCount] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("highScore") || "0", 10);
  });
  const speed = 0.002;
  function checkSwordHit(sword: Feature, enemy: Feature): boolean {
    const swordCoords = (sword.getGeometry() as LineString).getCoordinates();
    const enemyCoord = (enemy.getGeometry() as Point).getCoordinates();
    const hitRadius = 0.005;
    for (let i = 0; i < swordCoords.length - 1; i++) {
      const [x1, y1] = swordCoords[i];
      const [x2, y2] = swordCoords[i + 1];
      const [ex, ey] = enemyCoord;
      if (pointToLineDistance(ex, ey, x1, y1, x2, y2) < hitRadius) {
        return true;
      }
    }
    return false;
  }
  function spawnRandomEnemy() {
    if (gameOver) return;
    const view: View = map.getView();
    const extent = view.calculateExtent();
    const [minX, minY, maxX, maxY] = extent;
    let x, y;

    const edge = Math.floor(Math.random() * 4);

    switch (edge) {
      case 0:
        x = Math.random() * (maxX - minX) + minX;
        y = maxY;
        break;
      case 1:
        x = Math.random() * (maxX - minX) + minX;
        y = minY;
        break;
      case 2:
        x = minX;
        y = Math.random() * (maxY - minY) + minY;
        break;
      case 3:
        x = maxX;
        y = Math.random() * (maxY - minY) + minY;
        break;
    }
    const randomEnemyFeature = new Feature({
      geometry: new Point([x ? x : 0, y ? y : 0]),
    });
    enemySource.addFeature(randomEnemyFeature);
  }

  function drawPoint() {
    source.clear();
    const draw = new Draw({ type: "Point", source });
    map.addInteraction(draw);
    source.once("addfeature", (e) => {
      map.removeInteraction(draw);
      setCurrentFeature(e.feature!);
      startSpawningRandomEnemies();
    });
  }
  function startSpawningRandomEnemies() {
    if (intervalId || gameOver) return;

    const id = setInterval(() => {
      if (!gameOver) {
        spawnRandomEnemy();
      } else {
        clearInterval(id);
        setIntervalId(null);
      }
    }, 1000);

    setIntervalId(id);
  }
  function swordSwing() {
    if (!currentFeature || gameOver) return;
    const playerCoords = (
      currentFeature.getGeometry() as Point
    ).getCoordinates();
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
    const animationDuration = 300;
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
        enemySource.forEachFeature((enemyFeature) => {
          if (checkSwordHit(swordFeature, enemyFeature)) {
            enemySource.removeFeature(enemyFeature);
            setKillCount((prev) => {
              const newKillCount = prev + 1;
              if (newKillCount > highScore) {
                setHighScore(newKillCount);
                localStorage.setItem("highScore", newKillCount.toString());
              }

              return newKillCount;
            });
          }
        });
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
  const moveFeature = (xCord: number, yCord: number) => {
    const geom = currentFeature!.getGeometry() as Point;
    const coord = geom.getCoordinates();
    const newCoord = [coord[0] + xCord, coord[1] + yCord];
    geom.setCoordinates(newCoord);
    map.getView().setCenter(newCoord);
  };
  useEffect(() => {
    if (!currentFeature || gameOver) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "w":
          currentFeature.setStyle(backwardsPlayerStyle);
          moveFeature(0, speed);
          break;
        case "s":
          currentFeature.setStyle(playerStyle(false));
          moveFeature(0, -speed);
          break;
        case "a":
          currentFeature.setStyle(playerStyle(false));
          moveFeature(-speed, 0);
          break;
        case "d":
          currentFeature.setStyle(playerStyle(true));
          moveFeature(speed, 0);
          break;
        case " ":
          swordSwing();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentFeature]);
  useEffect(() => {
    if (!currentFeature || gameOver) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      return;
    }

    const moveEnemies = () => {
      const playerCoords = (
        currentFeature.getGeometry() as Point
      ).getCoordinates();
      const enemySpeed = 0.00112;

      enemySource.forEachFeature((enemyFeature) => {
        const enemyGeom = enemyFeature.getGeometry() as Point;
        const enemyCoords = enemyGeom.getCoordinates();
        const dx = playerCoords[0] - enemyCoords[0];
        const dy = playerCoords[1] - enemyCoords[1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.002) {
          clearInterval(intervalId ? intervalId : 0);
          setIntervalId(null);
          setCurrentFeature(null);
          enemySource.clear();
          source.clear();
          setGameOver(true);
          return;
        }

        const moveX = (dx / distance) * enemySpeed;
        const moveY = (dy / distance) * enemySpeed;
        enemyGeom.setCoordinates([
          enemyCoords[0] + moveX,
          enemyCoords[1] + moveY,
        ]);
      });
    };

    const enemyMovementInterval = setInterval(moveEnemies, 100);
    setIntervalId(enemyMovementInterval);
    return () => clearInterval(enemyMovementInterval);
  }, [currentFeature, gameOver]);

  return (
    <>
      {" "}
      <div className="game-header">
        {!gameOver ? (
          <>
            <p>poeng: {killCount}</p>
            <button onClick={drawPoint}>Velg spawn</button>
          </>
        ) : (
          <>
            <p>du taptse :-(</p>
            <button onClick={() => window.location.reload()}>Restart</button>
          </>
        )}
        <p>highscore: {highScore}</p>
      </div>
    </>
  );
}
