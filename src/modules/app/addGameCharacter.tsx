import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, View } from "ol";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { LineString, Point } from "ol/geom";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import { pointToLineDistance } from "./helpPointLineDistance";
import { dropBlood } from "./randomBloodPattern";
import {
  bossStyle,
  enemyStyle,
  gigaEnemyStyle,
  spawnBoss,
  spawnGigaEnemy,
  spawnRandomEnemyNow,
} from "./bosslogic";
import { transform } from "ol/proj";
import RestartButton from "./restartButton";

type KillLog = {
  [enemyName: string]: {
    sprite: string;
    count: number;
  };
};

export const playerStyle = (
  mirror: boolean = false,
  f: Feature,
  canSprint: boolean,
) => {
  const dmg = parseFloat(f.get("swordDamage").toFixed(2));

  const normalized = Math.min(
    Math.max((dmg - minDmg) / (maxDmg - minDmg), 0),
    1,
  );
  const r = 255;
  const g = Math.floor(255 * (1 - normalized));
  const b = Math.floor(255 * (1 - normalized));
  return new Style({
    image: new Icon({
      src: !canSprint
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png`,
      scale: mirror ? [-BASE_SCALE, BASE_SCALE] : BASE_SCALE,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `dmg: ${dmg}`,
      font: "bold 12px comic sans",
      fill: new Fill({ color: `rgb(${r}, ${g}, ${b})` }),
      stroke: new Stroke({
        color: "black",
        width: 3,
      }),
      offsetY: 30,
    }),
  });
};
const minDmg = 1;
const maxDmg = 500;
export const SCREEN = window.innerWidth;
export const BASE_WIDTH = 1920;
export let BASE_SCALE = SCREEN / BASE_WIDTH;
const backwardsPlayerStyle = (f: Feature, canSprint: boolean) => {
  const dmg = parseFloat(f.get("swordDamage").toFixed(2));

  const normalized = Math.min(
    Math.max((dmg - minDmg) / (maxDmg - minDmg), 0),
    1,
  );
  const r = 255;
  const g = Math.floor(255 * (1 - normalized));
  const b = Math.floor(255 * (1 - normalized));

  return new Style({
    image: new Icon({
      src: !canSprint
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/132.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png`,
      scale: BASE_SCALE,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `dmg: ${dmg}`,
      font: "bold 12px comic sans",
      fill: new Fill({ color: `rgb(${r}, ${g}, ${b})` }),
      stroke: new Stroke({
        color: "black",
        width: 3,
      }),
      offsetY: 30,
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

const swordStyle = (f: Feature) => {
  const length = parseFloat(f.get("swordLength"));

  return new Style({
    stroke: new Stroke({
      width: Math.min(3 + length * 50, 8),
      color: getSwordColor(length),
    }),
  });
};

function getSwordColor(length: number) {
  if (length < 3100) return "white";
  if (length < 3200) return "#ccffcc";
  if (length < 3500) return "lightgreen";
  if (length < 3800) return "limegreen";
  if (length < 4100) return "#00cc66";
  if (length < 4400) return "teal";
  if (length < 4700) return "deepskyblue";
  if (length < 5000) return "dodgerblue";
  if (length < 5300) return "blue";
  if (length < 5600) return "mediumblue";
  if (length < 5900) return "darkblue";
  if (length < 6200) return "purple";
  if (length < 6500) return "blueviolet";
  if (length < 6800) return "darkviolet";
  if (length < 7100) return "indigo";
  if (length < 7400) return "red";
  if (length < 7700) return "#cc0000";
  if (length < 8000) return "darkred";
  if (length < 8300) return "#800000";
  if (length < 8600) return "#660000";
  return "#660000";
}

interface GameButtonProps {
  map: Map;
  source: VectorSource;
}

export function GameButton({ map, source }: GameButtonProps) {
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [currentDamage, setCurrentDamage] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [killLog, setKillLog] = useState<KillLog>({});
  const [killCount, setKillCount] = useState(0);
  const [canSprint, setCanSprint] = useState(true);
  const [killedBy, setKilledBy] = useState<{
    name: string;
    sprite: string | null;
  } | null>(null);
  const [deathLog, setDeathLog] = useState<{
    [key: string]: { sprite: string; count: number };
  }>({});
  const playerSpeed = 22;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [songActive, setSongActive] = useState(false);
  const [songIndex, setSongIndex] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("volume");
    return savedVolume ? parseFloat(savedVolume) : 0.15;
  });
  const audioRef = useRef(new Audio());
  const playlist = [
    "https://kappa.vgmsite.com/soundtracks/crypt-of-the-necrodancer/dfwnidfm/02%20-%20Rhythmortis%20%28Lobby%29.mp3",
    "https://kappa.vgmsite.com/soundtracks/crypt-of-the-necrodancer/xxbsascz/01%20-%20Tombtorial%20%28Tutorial%29.mp3",
    "https://kappa.vgmsite.com/soundtracks/crypt-of-the-necrodancer/cylypazn/03%20-%20Watch%20Your%20Step%20%28Training%29.mp3",
    "https://kappa.vgmsite.com/soundtracks/crypt-of-the-necrodancer/wtzryxlt/04%20-%20Disco%20Descent%20%281-1%29.mp3",
  ];

  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("highScore") || "0", 10);
  });
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const savedKillLog = localStorage.getItem("killLog");
    if (savedKillLog) {
      setKillLog(JSON.parse(savedKillLog));
    }
  }, []);

  function startTimer() {
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => {
        const newTime = prevTime + 1;
        if (newTime % 0.5 === 0) {
          const { x, y } = spawnRandomEnemy();
          spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
        }
        if (newTime % 1 === 0) {
          const { x, y } = spawnRandomEnemy();
          spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
        }
        if (newTime % 60 === 0) {
          const { x, y } = spawnRandomEnemy();
          spawnBoss(x ? x : 0, y ? y : 0);
        }
        if (newTime > 28) {
          if (newTime % 30 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime > 140) {
          if (newTime % 30 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnBoss(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime > 160) {
          if (newTime % 15 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnBoss(x ? x : 0, y ? y : 0);
            spawnRandomEnemyNow(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime > 230) {
          const { x, y } = spawnRandomEnemy();
          spawnBoss(x ? x : 0, y ? y : 0);
        }
        if (newTime > 350) {
          if (newTime % 60 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnGigaEnemy(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime > 450) {
          if (newTime % 30 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnGigaEnemy(x ? x : 0, y ? y : 0);
          }
          if (newTime % 0.5 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnBoss(x ? x : 0, y ? y : 0);
          }
          if (newTime % 1 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnBoss(x ? x : 0, y ? y : 0);
          }
        }
        if (newTime > 600) {
          const { x, y } = spawnRandomEnemy();
          spawnGigaEnemy(x ? x : 0, y ? y : 0);
          if (newTime % 0.5 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnGigaEnemy(x ? x : 0, y ? y : 0);
          }
          if (newTime % 1 === 0) {
            const { x, y } = spawnRandomEnemy();
            spawnGigaEnemy(x ? x : 0, y ? y : 0);
          }
        }

        return newTime;
      });
    }, 1000);
    return timerIntervalRef.current;
  }

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null; // Reset the ref to ensure the interval is cleared
    }
  }

  function checkSwordHit(sword: Feature, enemy: Feature): boolean {
    const swordCoords = (sword.getGeometry() as LineString).getCoordinates();
    const enemyCoord = (enemy.getGeometry() as Point).getCoordinates();
    const hitRadius = 0.0075;
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
    const offset = 0.001;
    let x, y;
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0:
        x = Math.random() * (maxX - minX) + minX;
        y = maxY + offset;
        break;
      case 1:
        x = Math.random() * (maxX - minX) + minX;
        y = minY - offset;
        break;
      case 2:
        x = minX - offset;
        y = Math.random() * (maxY - minY) + minY;
        break;
      case 3:
        x = maxX + offset;
        y = Math.random() * (maxY - minY) + minY;
        break;
    }
    return { x, y };
  }

  useEffect(() => {
    audioRef.current.volume = volume;

    if (songActive) {
      if (audioRef.current.paused) {
        audioRef.current.src = playlist[songIndex];
        audioRef.current.play();
      }

      audioRef.current.onended = () => {
        const nextIndex = (songIndex + 1) % playlist.length;
        setSongIndex(nextIndex);
      };
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, [songActive, songIndex]);

  useEffect(() => {
    audioRef.current.volume = volume;
    localStorage.setItem("volume", volume.toString());
  }, [volume]);
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  function drawPoint() {
    source.clear();
    const draw = new Draw({ type: "Point", source });
    map.addInteraction(draw);
    source.once("addfeature", (e) => {
      map.removeInteraction(draw);
      e.feature!.set("swordDamage", 1);
      e.feature!.set("speed", playerSpeed);
      e.feature!.set("swordLength", 3000);
      e.feature!.set("canSprint", true);
      setCurrentFeature(e.feature!);
      e.feature!.setStyle(playerStyle(false, e.feature!, canSprint));
      startTimer();
      setSongActive(true);
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
    const swordLength = currentFeature.get("swordLength");
    const numberOfFrames = 60;
    const angleStep = (Math.PI * 2) / numberOfFrames;

    const playerCoords3857 = transform(playerCoords, "EPSG:4326", "EPSG:3857");

    const swordCoordinates = Array.from({ length: numberOfFrames }, (_, i) => {
      const angle = i * angleStep;

      const x = playerCoords3857[0] + swordLength * Math.cos(angle);
      const y = playerCoords3857[1] + swordLength * Math.sin(angle);

      return transform([x, y], "EPSG:3857", "EPSG:4326");
    });

    const swordFeature = new Feature({
      geometry: new LineString([playerCoords, swordCoordinates[0]]),
    });
    source.addFeature(swordFeature);

    swordFeature.setStyle(swordStyle(currentFeature));

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
            const enemyData = enemyFeature.get("enemyData");
            const enemyType = enemyFeature.get("type");
            const isShiny = enemyFeature.get("shiny");
            let newSwordLength = swordLength;
            hp -= swordDamage;
            if (hp <= 0) {
              if (enemyType === "normal") {
                swordDamage += 0.1;
                if (isShiny) {
                  swordDamage += 0.4;
                  newSwordLength += 300;
                }
              } else if (enemyType === "boss") {
                swordDamage += 5;
                if (isShiny) {
                  swordDamage += 10;
                  newSwordLength += 1300;
                }
              } else if (enemyType == "giga") {
                swordDamage += 15;
                if (isShiny) {
                  swordDamage += 30;
                  newSwordLength += 1500;
                }
              }
              currentFeature.set("swordLength", newSwordLength);
              currentFeature.set("swordDamage", swordDamage);
              swordDamage = parseFloat(swordDamage.toFixed(2));
              setCurrentDamage(swordDamage);
              const enemyCoord = (
                enemyFeature.getGeometry() as Point
              ).getCoordinates();
              dropBlood(enemyCoord[0], enemyCoord[1]);
              handleEnemyKilled(enemyFeature);
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
              if (enemyType == "boss") {
                if (enemyData) {
                  enemyData.hp = parseFloat(hp.toFixed(2));
                  enemyFeature.set("enemyData", enemyData);
                }
                enemyFeature.setStyle(bossStyle(enemyFeature));
              } else if (enemyType === "normal") {
                if (enemyData) {
                  enemyData.hp = parseFloat(hp.toFixed(2));
                  enemyFeature.set("enemyData", enemyData);
                }
                enemyFeature.setStyle(enemyStyle(enemyFeature));
              } else if (enemyType === "giga") {
                if (enemyData) {
                  enemyData.hp = parseFloat(hp.toFixed(2));
                  enemyFeature.set("enemyData", enemyData);
                }
                enemyFeature.setStyle(gigaEnemyStyle(enemyFeature));
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

  const handleEnemyKilled = (enemyFeature: Feature) => {
    const { name, sprite, shiny } = enemyFeature.get("enemyData");
    const enemyKey = shiny ? `${name}_shiny` : name;
    setKillLog((prev) => ({
      ...prev,
      [enemyKey]: {
        sprite,
        count: (prev[enemyKey]?.count || 0) + 1,
      },
    }));
  };

  const moveFeature = (
    metersX: number,
    metersY: number,
    sprinting: boolean,
  ) => {
    if (gameOver) return;
    if (sprinting) {
      metersX *= 2.2;
      metersY *= 2.2;
    }
    const geom = currentFeature!.getGeometry() as Point;
    const coord = geom.getCoordinates();
    let [x, y] = transform(coord, "EPSG:4326", "EPSG:3857");
    x += metersX;
    y += metersY;
    const newCoord = transform([x, y], "EPSG:3857", "EPSG:4326");
    geom.setCoordinates(newCoord);
    map.getView().setCenter(newCoord);
  };
  useEffect(() => {
    if (!currentFeature || gameOver) return;
    const keysPressed: { [key: string]: boolean } = {};

    let animationFrameId: number | null = null;
    let isSprinting = false;

    let canSprint = true;
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();
      keysPressed[normalizedKey] = true;
      if (animationFrameId === null) {
        movePlayerSmoothly();
      }

      if (event.key === " ") {
        swordSwing();
      }
      if (event.key === "Shift" && canSprint) {
        isSprinting = true;
        canSprint = false;
        setCanSprint(canSprint);
        currentFeature.set("canSprint", canSprint);
        setTimeout(() => {
          canSprint = true;
          setCanSprint(canSprint);
          currentFeature.set("canSprint", canSprint);
        }, 2000);
        setTimeout(() => {
          isSprinting = false;
        }, 350);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();
      delete keysPressed[normalizedKey];
    };

    const movePlayerSmoothly = () => {
      if (!currentFeature) return;
      let dx = 0,
        dy = 0;
      console.log(keysPressed);
      if (keysPressed["w"] || keysPressed["arrowup"]) {
        currentFeature.setStyle(
          backwardsPlayerStyle(currentFeature, canSprint),
        );
        dy += playerSpeed;
      }
      if (keysPressed["s"] || keysPressed["arrowdown"]) {
        currentFeature.setStyle(playerStyle(false, currentFeature, canSprint));
        dy -= playerSpeed;
      }
      if (keysPressed["a"] || keysPressed["arrowleft"]) {
        currentFeature.setStyle(playerStyle(false, currentFeature, canSprint));
        dx -= playerSpeed; //+ 0.0001;
      }
      if (keysPressed["d"] || keysPressed["arrowright"]) {
        currentFeature.setStyle(playerStyle(true, currentFeature, canSprint));
        dx += playerSpeed; //+ 0.0001;
      }
      if (dx !== 0 || dy !== 0) {
        moveFeature(dx, dy, isSprinting);
      }

      animationFrameId = requestAnimationFrame(movePlayerSmoothly);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    requestAnimationFrame(movePlayerSmoothly);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentFeature, gameOver]);
  let enemyMovementAnimationFrame: number | null = null;

  const moveEnemies = () => {
    if (!currentFeature || gameOver) return;

    const playerCoords = (
      currentFeature.getGeometry() as Point
    ).getCoordinates();
    const playerCoords3857 = transform(playerCoords, "EPSG:4326", "EPSG:3857");

    enemySource.forEachFeature((enemyFeature) => {
      const enemySpeed = enemyFeature.get("speed");
      const enemyGeom = enemyFeature.getGeometry() as Point;
      const enemyCoords = enemyGeom.getCoordinates();

      const enemyCoords3857 = transform(enemyCoords, "EPSG:4326", "EPSG:3857");

      const dx = playerCoords3857[0] - enemyCoords3857[0];
      const dy = playerCoords3857[1] - enemyCoords3857[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 300) {
        handleDeath(enemyFeature);
        if (enemyMovementAnimationFrame !== null) {
          cancelAnimationFrame(enemyMovementAnimationFrame);
        }
        stopTimer();
        dropBlood(playerCoords[0], playerCoords[1]);
        setCurrentFeature(null);
        source.clear();
        setGameOver(true);
        setSongActive(false);
        return;
      }

      const normalizedX = distance !== 0 ? dx / distance : 0;
      const normalizedY = distance !== 0 ? dy / distance : 0;
      const moveX = normalizedX * enemySpeed;
      const moveY = normalizedY * enemySpeed;

      const newEnemyCoords3857 = [
        enemyCoords3857[0] + moveX,
        enemyCoords3857[1] + moveY,
      ];

      const newEnemyCoords = transform(
        newEnemyCoords3857,
        "EPSG:3857",
        "EPSG:4326",
      );
      enemyGeom.setCoordinates(newEnemyCoords);
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
  useEffect(() => {
    const savedDeathLog = localStorage.getItem("deathLog");
    if (savedDeathLog) {
      setDeathLog(JSON.parse(savedDeathLog));
    }
  }, []);

  const handleDeath = (enemyFeature: Feature) => {
    const { name, sprite, shiny } = enemyFeature.get("enemyData");
    const enemyKey = shiny ? `${name}_shiny` : name;
    setKilledBy({ name, sprite });
    setDeathLog((prev) => {
      const newDeathLog = {
        ...prev,
        [enemyKey]: {
          sprite,
          count: (prev[enemyKey]?.count || 0) + 1,
        },
      };
      localStorage.setItem("deathLog", JSON.stringify(newDeathLog));
      return newDeathLog;
    });
  };
  useEffect(() => {
    if (currentFeature) return;

    const handleSpacebarPress = (event: KeyboardEvent) => {
      if (event.key === " ") {
        window.removeEventListener("keydown", handleSpacebarPress);
        drawPoint();
      }
    };
    window.addEventListener("keydown", handleSpacebarPress);
    return () => {
      window.removeEventListener("keydown", handleSpacebarPress);
    };
  }, [currentFeature]);
  return (
    <>
      {" "}
      <div className="game-header">
        {!gameOver ? (
          <>
            <div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
              <span> Lyd: {Math.round(volume * 100)}% </span>
            </div>
            <p>Poeng: {killCount}</p>
            {!currentFeature ? (
              <button onClick={drawPoint}>Velg spawn</button>
            ) : (
              <p>lykke til</p>
            )}

            <p>Time: {timer}s</p>
            <p>highscore: {highScore} </p>
          </>
        ) : (
          <>
            <p>{killCount}</p>
            <p>damege: {currentDamage}</p>
            <RestartButton />

            <p>tid: {timer}s</p>
            <p>highscore: {highScore} </p>
            <div className="kill-tracker">
              <div className="killed-by">
                <h2>Drept av</h2>
                {killedBy ? (
                  <>
                    <img src={killedBy.sprite!} alt={killedBy.name} />
                  </>
                ) : (
                  <p>?</p>
                )}
              </div>
              <h3>Kills:</h3>
              {Object.keys(killLog).length > 0 ? (
                Object.entries(killLog).map(([enemyKey, data]) => (
                  <div key={enemyKey} className="enemy-kill">
                    <img src={data.sprite} alt={enemyKey} />
                    <p>{data.count}</p>
                  </div>
                ))
              ) : (
                <p>Taptse?</p>
              )}
              <h3>Nemesis:</h3>
              {Object.entries(deathLog).length > 0 ? (
                Object.entries(deathLog)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 1)
                  .map(([enemyName, data]) => (
                    <div key={enemyName} className="enemy-kill">
                      <img src={data.sprite} alt={enemyName} />
                      <p>{data.count} Deaths</p>
                    </div>
                  ))
              ) : (
                <p>ingen data</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
