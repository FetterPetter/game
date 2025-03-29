import React, { useEffect, useState } from "react";
import { Feature, Map, View } from "ol";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { LineString, Point } from "ol/geom";
import { Fill, Icon, Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import { pointToLineDistance } from "./helpPointLineDistance";
import { dropBlood, generateRandomBloodShape } from "./randomBloodPattern";
import {
  bossStyle,
  enemyStyle,
  spawnBoss,
  spawnRandomEnemyNow,
} from "./bosslogic";

export const playerStyle = (mirror: boolean = false) => {
  return new Style({
    image: new Icon({
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png`,
      scale: mirror ? [-1, 1] : [1, 1],
      anchor: [0.5, 0.5],
    }),
  });
};
const backwardsPlayerStyle = () => {
  return new Style({
    image: new Icon({
      src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png`,
      scale: 1,
      anchor: [0.5, 0.5],
    }),
  });
};
export const source = new VectorSource({});
export const playerLayer = new VectorLayer({
  source: source,
});
export const enemySource = new VectorSource({});
export const enemyLayer = new VectorLayer({
  source: enemySource,
});

export const bloodSource = new VectorSource({});
export const bloodLayer = new VectorLayer({
  source: bloodSource,
  style: new Style({
    fill: new Fill({ color: "rgba(139, 0, 0, 0.8)" }),
    stroke: new Stroke({ color: "darkred", width: 1 }),
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
  const [currentDamage, setCurrentDamage] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [killCount, setKillCount] = useState(0);
  const [playerSpeed, setPlayerSpeed] = useState(0.0002);

  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("highScore") || "0", 10);
  });
  const [timer, setTimer] = useState(0);

  function startTimer() {
    const timerInterval = setInterval(() => {
      setTimer((prevTime) => {
        const newTime = prevTime + 1;
        if (newTime > 55) {
          if (newTime % 30 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnBoss(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime > 90) {
          const { x, y } = spawnRandomEnemy();
          spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
          if (newTime % 10 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnBoss(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime % 0.5 === 0) {
          if (newTime > 30) {
            const { x, y } = spawnRandomEnemy();
            spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
          }
          const { x, y } = spawnRandomEnemy();
          spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
        }
        if (newTime > 30 && newTime % 1 === 0) {
          const { x, y } = spawnRandomEnemy();
          spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
        }
        return newTime;
      });
    }, 1000);
    return timerInterval;
  }

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
    if (gameOver) return { x: 0, y: 0 };
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
    return { x, y };
  }

  function drawPoint() {
    source.clear();
    const draw = new Draw({ type: "Point", source });
    map.addInteraction(draw);
    source.once("addfeature", (e) => {
      map.removeInteraction(draw);
      e.feature!.set("swordDamage", 1);
      e.feature!.set("speed", playerSpeed);
      setCurrentFeature(e.feature!);
      e.feature!.setStyle(playerStyle(false));
      startTimer();
    });
  }

  let isSwordActive = false;

  function swordSwing() {
    if (!currentFeature || gameOver) return;
    if (isSwordActive) return;
    isSwordActive = true;
    const playerCoords = (
      currentFeature.getGeometry() as Point
    ).getCoordinates();
    const swordLength = 0.015;
    const numberOfFrames = 60;
    const angles = Array.from({ length: numberOfFrames }, (_, index) => {
      return (index / numberOfFrames) * (Math.PI * 2);
    });
    const swordCoordinates = angles.map((angle) => [
      playerCoords[0] + swordLength * Math.cos(angle),
      playerCoords[1] + swordLength * Math.sin(angle),
    ]);
    const swordFeature = new Feature({
      geometry: new LineString([playerCoords, swordCoordinates[0]]),
    });
    source.addFeature(swordFeature);

    swordFeature.setStyle(swordStyle());

    let startTime: number | null = null;
    const animationDuration = 420;

    const animationStep = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = (timestamp - startTime) / animationDuration;

      if (progress < 1) {
        const frameIndex = Math.floor(progress * numberOfFrames);
        const newSwordCoords = [playerCoords, swordCoordinates[frameIndex]];
        swordFeature.getGeometry()!.setCoordinates(newSwordCoords);

        enemySource.forEachFeature((enemyFeature) => {
          if (checkSwordHit(swordFeature, enemyFeature)) {
            let hp = enemyFeature.get("helsepoeng") || 0;
            let swordDamage = currentFeature.get("swordDamage");
            const enemyType = enemyFeature.get("type");
            hp -= swordDamage;
            if (hp <= 0) {
              if (enemyType === "normal") {
                swordDamage += 0.1;
              } else if (enemyType === "boss") {
                swordDamage += 5;
              }
              currentFeature.set("swordDamage", swordDamage);
              swordDamage = parseFloat(swordDamage.toFixed(2));
              setCurrentDamage(swordDamage);
              const enemyCoord = (
                enemyFeature.getGeometry() as Point
              ).getCoordinates();
              dropBlood(enemyCoord[0], enemyCoord[1]);
              enemySource.removeFeature(enemyFeature);

              setKillCount((prev) => {
                const newKillCount = prev + 1;
                if (newKillCount > highScore) {
                  setHighScore(newKillCount);
                  localStorage.setItem("highScore", newKillCount.toString());
                }
                return newKillCount;
              });
            } else {
              enemyFeature.set("helsepoeng", hp);
              if (enemyFeature.get("type") == "boss") {
                const bossData = enemyFeature.get("bossData");
                if (bossData) {
                  bossData.hp = parseFloat(hp.toFixed(2));
                  enemyFeature.set("bossData", bossData);
                }
                enemyFeature.setStyle(bossStyle(enemyFeature));
              } else {
                const enemyData = enemyFeature.get("enemyData");
                if (enemyData) {
                  enemyData.hp = parseFloat(hp.toFixed(2));
                  enemyFeature.set("enemyDaya", enemyData);
                }
                enemyFeature.setStyle(enemyStyle(enemyFeature));
              }
            }
          }
        });
        requestAnimationFrame(animationStep);
      } else {
        source.removeFeature(swordFeature);
        isSwordActive = false;
      }
    };
    requestAnimationFrame(animationStep);
  }

  const moveFeature = (xCord: number, yCord: number) => {
    if (gameOver) return;
    const geom = currentFeature!.getGeometry() as Point;
    const coord = geom.getCoordinates();
    const newCoord = [coord[0] + xCord, coord[1] + yCord];
    geom.setCoordinates(newCoord);
    map.getView().setCenter(newCoord);
  };

  useEffect(() => {
    if (!currentFeature || gameOver) return;

    const keysPressed: { [key: string]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed[event.key] = true;
      if (event.key === " ") {
        swordSwing();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      delete keysPressed[event.key];
    };

    const movePlayerSmoothly = () => {
      if (!currentFeature) return;

      let dx = 0,
        dy = 0;

      if (keysPressed["w"]) {
        currentFeature.setStyle(backwardsPlayerStyle());
        dy += playerSpeed;
      }
      if (keysPressed["s"]) {
        currentFeature.setStyle(playerStyle(false));
        dy -= playerSpeed;
      }
      if (keysPressed["a"]) {
        currentFeature.setStyle(playerStyle(false));
        dx -= playerSpeed + 0.0001;
      }
      if (keysPressed["d"]) {
        currentFeature.setStyle(playerStyle(true));
        dx += playerSpeed + 0.0001;
      }
      if (dx !== 0 || dy !== 0) {
        moveFeature(dx, dy);
      }
      requestAnimationFrame(movePlayerSmoothly);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    requestAnimationFrame(movePlayerSmoothly);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentFeature, gameOver]);
  let enemyMovementAnimationFrame: number | null = null;

  const moveEnemies = (timestamp: number) => {
    if (!currentFeature || gameOver) return;

    const playerCoords = (
      currentFeature.getGeometry() as Point
    ).getCoordinates();

    enemySource.forEachFeature((enemyFeature) => {
      const enemySpeed = enemyFeature.get("speed"); // Static speed from your enemyStats array
      const enemyGeom = enemyFeature.getGeometry() as Point;
      const enemyCoords = enemyGeom.getCoordinates();

      const dx = playerCoords[0] - enemyCoords[0];
      const dy = playerCoords[1] - enemyCoords[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.003) {
        if (enemyMovementAnimationFrame !== null) {
          cancelAnimationFrame(enemyMovementAnimationFrame);
        }
        setCurrentFeature(null);
        source.clear();
        setGameOver(true);
        return;
      }

      const normalizedX = distance !== 0 ? dx / distance : 0;
      const normalizedY = distance !== 0 ? dy / distance : 0;

      const moveX = normalizedX * (enemySpeed + 0.0001);
      const moveY = normalizedY * enemySpeed;

      enemyGeom.setCoordinates([
        enemyCoords[0] + moveX,
        enemyCoords[1] + moveY,
      ]);
    });

    enemyMovementAnimationFrame = requestAnimationFrame(moveEnemies);
  };
  useEffect(() => {
    if (gameOver) return;

    enemyMovementAnimationFrame = requestAnimationFrame(moveEnemies);

    return () => {
      if (enemyMovementAnimationFrame !== null) {
        cancelAnimationFrame(enemyMovementAnimationFrame);
      }
    };
  }, [currentFeature, gameOver]);

  return (
    <>
      {" "}
      <div className="game-header">
        {!gameOver ? (
          <>
            <p>poeng: {killCount}</p>
            <p>damege: {currentDamage}</p>
            <button onClick={drawPoint}>Velg spawn</button>
            <p>Time: {timer}s</p> {/* Display timer here */}
          </>
        ) : (
          <>
            <p>du taptse :-( {killCount}</p>

            <button onClick={() => window.location.reload()}>Restart</button>
          </>
        )}
        <p>highscore: {highScore}</p>
      </div>
    </>
  );
}
