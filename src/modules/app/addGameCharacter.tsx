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
  midEnemyStyle,
  spawnBoss,
  spawnGigaEnemy,
  spawnRandomEnemyNow,
  spawnRandomMidEnemyNow,
} from "./bosslogic";
import { transform } from "ol/proj";
import RestartButton from "./restartButton";
import CircleStyle from "ol/style/Circle";
import { FloatingPopup } from "./floatingPopUp";
import { usePreventSpacebarClick } from "./usePreventSpacebarClick";
import { handleEnemySpawns } from "../../utils/spawner";

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
  level: number,
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
      text: `dmg: ${dmg} lvl: ${level}`,
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
const backwardsPlayerStyle = (
  f: Feature,
  canSprint: boolean,
  level: number,
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
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/132.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png`,
      scale: BASE_SCALE,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `dmg: ${dmg} lvl: ${level}`,
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
export const bossSource = new VectorSource({});
export const bossLayer = new VectorLayer({
  source: bossSource,
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
const bulletStyle = () => {
  return new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: "red" }),
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
  usePreventSpacebarClick();
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [currentDamage, setCurrentDamage] = useState(1);
  let keysPressed: { [key: string]: boolean } = {};
  const [movingEnemies, setMovingEnemies] = useState(true);
  const [dashUnlocked, setDashUnlocked] = useState(false);
  const [levelUpsQueued, setLevelUpsQueued] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shootOnDash, setShootOnDash] = useState(false);
  const [dashCooldown, setDashCooldown] = useState(2000);
  const [doubleShootOnDash, setDoubleShootOnDash] = useState(false);
  const [killLog, setKillLog] = useState<KillLog>({});
  const [killCount, setKillCount] = useState(0);
  const [swingSpeed, setSwingSpeed] = useState(1000);
  const [canSprint, setCanSprint] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const sprintCooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const canSprintRef = useRef(canSprint);
  const lastDirection = useRef<"front" | "back">("front");
  const lastMirror = useRef<boolean>(false);
  const [playerXP, setPlayerXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(0);
  const [speedUpgrades, setSpeedUpgrades] = useState(0);
  const [dashUpgrades, setDashUpgrades] = useState(0);
  const [autoShootCooldown, setAutoShootCooldown] = useState(2000);
  const [autoUpgrades, setAutoUpgrades] = useState(0);
  const [cooldownUpgrades, setCooldownUpgrades] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [autoShoot, setAutoShoot] = useState(false);

  const autoShootIntervalRef = useRef<NodeJS.Timeout | null>(null);
  let dx = 0,
    dy = 0;
  let canRun = true;
  let isSprinting = false;
  const [killedBy, setKilledBy] = useState<{
    name: string;
    sprite: string | null;
  } | null>(null);
  const [deathLog, setDeathLog] = useState<{
    [key: string]: { sprite: string; count: number };
  }>({});
  const [playerSpeed, setPlayerSpeed] = useState(22);

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
  useEffect(() => {
    if (!gamePaused && currentFeature) {
      startTimer();
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gamePaused, currentFeature]);
  const resetMovement = () => {
    keysPressed = {};
    setIsRunning(false);
    setCanSprint(true);
    dx = 0;
    dy = 0;
    canRun = true;
    isSprinting = false;
    if (sprintCooldownTimer.current !== null) {
      clearTimeout(sprintCooldownTimer.current);
      sprintCooldownTimer.current = null;
    }
  };

  function startTimer() {
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => {
        const newTime = prevTime + 1;

        handleEnemySpawns(newTime, {
          spawnRandomEnemy,
          spawnRandomEnemyNow,
          spawnRandomMidEnemyNow,
          spawnBoss,
          spawnGigaEnemy,
          showPopup: showPopup,
        });

        return newTime;
      });
    }, 1000);
  }

  useEffect(() => {
    if (gamePaused) {
      resetMovement();
      setMovingEnemies(false);
    } else if (!gamePaused) {
      const timeout = setTimeout(() => {
        setMovingEnemies(true);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [gamePaused]);
  useEffect(() => {
    if (levelUpsQueued > 0 && !dialogRef.current?.open) {
      setGamePaused(true);
      stopTimer();
      dialogRef.current?.showModal();
    }
  }, [levelUpsQueued]);
  const [, forceRender] = useState(0);
  const handleLevelUpChoice = (
    choice:
      | "speed"
      | "cooldown"
      | "dash"
      | "autoShoot"
      | "shootOnDash"
      | "dashCooldown"
      | "damage",
  ) => {
    resetMovement();
    stopTimer();
    if (choice === "damage") {
      if (currentFeature) {
        setCurrentDamage((prevDamage) => {
          const updatedDamage = prevDamage + playerLevel + 1;
          const playerCoord = (
            currentFeature.getGeometry() as Point
          ).getCoordinates();
          currentFeature.set("swordDamage", updatedDamage);
          const screenCoords = map.getPixelFromCoordinate(playerCoord);
          showPopup(`+${playerLevel} Dmg`, screenCoords[0], screenCoords[1]);
          return updatedDamage;
        });
      }
    }
    if (choice === "dashCooldown") {
      setDashCooldown((prev) => Math.max(500, prev - 100));
      setDashUpgrades((prev) => prev + 1);
    }
    if (choice === "speed") {
      setPlayerSpeed((prev) => prev + 0.5);
      setSpeedUpgrades((prev) => prev + 1);
    } else if (choice === "cooldown") {
      setSwingSpeed((prev) => Math.max(250, prev - 50));
      setCooldownUpgrades((prev) => prev + 1);
    } else if (choice === "dash") {
      if (!dashUnlocked) {
        setDashUnlocked(true);
      }
    } else if (choice === "autoShoot") {
      if (!autoShoot) {
        setAutoShoot(true);
        startAutoShooting();
      } else {
        setAutoShootCooldown((prev) => Math.max(250, prev - 117));
        setAutoUpgrades((prev) => prev + 1);
      }
    }
    if (choice === "shootOnDash" && dashUnlocked && !shootOnDash) {
      setShootOnDash(true);
    } else if (choice === "shootOnDash" && dashUnlocked && shootOnDash) {
      setDoubleShootOnDash(true);
    }

    setLevelUpsQueued((prev) => prev - 1);

    if (levelUpsQueued - 1 > 0) {
      dialogRef.current?.showModal();
      resetMovement();
    } else {
      startTimer();
      setGamePaused(false);
    }
    setPlayerLevel((prev) => prev + 1);
    forceRender((prev) => prev + 1);

    dialogRef.current?.close();
  };

  function startAutoShooting() {
    if (autoShootIntervalRef.current || gamePaused) return;

    autoShootIntervalRef.current = setInterval(() => {
      if (!gamePaused && !gameOver) {
        if (autoUpgrades >= 2) {
          shootBullet();
        }
        if (autoUpgrades >= 4) {
          shootBullet();
        }
        if (autoUpgrades >= 6) {
          shootBullet();
        }
        if (autoUpgrades >= 8) {
          shootBullet();
        }
        if (autoUpgrades >= 15) {
          shootBullet();
        }
        shootBullet();
      }
    }, autoShootCooldown);
  }

  function stopAutoShooting() {
    if (autoShootIntervalRef.current) {
      clearInterval(autoShootIntervalRef.current);
      autoShootIntervalRef.current = null;
    }
  }

  useEffect(() => {
    if (autoShoot) {
      if (gamePaused) {
        stopAutoShooting();
      } else {
        stopAutoShooting();
        startAutoShooting();
      }
    }
  }, [autoShootCooldown, gamePaused, autoShoot]);

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
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

  function spawnRandomEnemy(): { x: number; y: number } {
    if (gameOver) return { x: 0, y: 0 };

    const view: View = map.getView();
    const extent = view.calculateExtent();
    const [minX, minY, maxX, maxY] = extent;
    const offset = 0.001;

    let x = 0;
    let y = 0;

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
      e.feature!.setStyle(
        playerStyle(false, e.feature!, canSprint, playerLevel),
      );
      startTimer();
      setSongActive(true);
    });
  }

  const [popups, setPopups] = useState<
    { id: number; x: number; y: number; text: string; duration: number }[]
  >([]);

  function showPopup(
    text: string,
    x: number,
    y: number,
    duration: number = 1000,
  ) {
    const id = Date.now() + Math.random();
    setPopups((prev) => [...prev, { id, x, y, text, duration }]);

    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, duration); // This should respect the duration passed
  }

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (songActive) {
      intervalRef.current = setInterval(() => {
        if (!gamePaused) {
          swordSwing();
        }
        if (cooldownUpgrades >= 15) {
          setTimeout(() => swordSwing(), 125);
        }
      }, swingSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [songActive, gamePaused]);

  function getXPRequiredForLevel(level: number) {
    const baseXP = 10;
    const multiplier = 1.55;
    return Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  function shootBullet() {
    if (!currentFeature || gameOver || gamePaused) return;
    const playerCoords = (
      currentFeature.getGeometry() as Point
    ).getCoordinates();

    const bulletFeature = new Feature({
      geometry: new Point(playerCoords),
    });
    source.addFeature(bulletFeature);
    bulletFeature.setStyle(bulletStyle);
    moveBullet(bulletFeature);
  }

  function moveBullet(bullet: Feature) {
    const bulletCoords = (bullet.getGeometry() as Point).getCoordinates();

    const angle = Math.random() * 2 * Math.PI;

    const bulletDistance = 0.19;

    const targetCoords = [
      bulletCoords[0] + bulletDistance * Math.cos(angle),
      bulletCoords[1] + bulletDistance * Math.sin(angle),
    ];

    const speed = 0.0055;
    const deltaX = targetCoords[0] - bulletCoords[0];
    const deltaY = targetCoords[1] - bulletCoords[1];
    const distance = Math.hypot(deltaX, deltaY);

    if (distance === 0) return;

    const stepX = (deltaX / distance) * speed;
    const stepY = (deltaY / distance) * speed;

    const interval = setInterval(() => {
      const currentCoords = (bullet.getGeometry() as Point).getCoordinates();
      const newCoords = [currentCoords[0] + stepX, currentCoords[1] + stepY];

      (bullet.getGeometry() as Point).setCoordinates(newCoords);
      enemySource.forEachFeature((enemyFeature) => {
        if (handleBulletCollision(bullet, enemyFeature)) {
          source.removeFeature(bullet);
          clearInterval(interval);
        }
      });
      const newDistance = Math.hypot(
        targetCoords[0] - newCoords[0],
        targetCoords[1] - newCoords[1],
      );

      if (newDistance < speed && bullet) {
        source.removeFeature(bullet);
        clearInterval(interval);
      }
    }, 16);
  }

  function handleBulletCollision(bullet: Feature, enemyFeature: Feature) {
    if (!currentFeature) return;
    const bulletCoords = (bullet.getGeometry() as Point).getCoordinates();
    const enemyCoords = (enemyFeature.getGeometry() as Point).getCoordinates();
    const swordLength = currentFeature.get("swordLength");
    const hitRadius = 0.019;

    const distance = Math.hypot(
      bulletCoords[0] - enemyCoords[0],
      bulletCoords[1] - enemyCoords[1],
    );

    if (distance < hitRadius) {
      const screenCoords = map.getPixelFromCoordinate(enemyCoords);
      let hp = enemyFeature.get("helsepoeng") || 0;
      let swordDamage = 0;
      const enemyData = enemyFeature.get("enemyData");
      const enemyType = enemyFeature.get("type");
      const isShiny = enemyFeature.get("shiny");
      let newSwordLength = swordLength;
      const featureDmg = currentFeature.get("swordDamage") + 20;
      hp -= featureDmg;
      if (hp <= 0) {
        if (enemyType === "normal") {
          swordDamage += 1;
          if (isShiny) {
            swordDamage += 10;
            newSwordLength += 350;
          }
        } else if (enemyType === "mid") {
          swordDamage += 10;
          if (isShiny) {
            swordDamage += 30;
            newSwordLength += 600;
          }
        } else if (enemyType === "boss") {
          swordDamage += 30;
          if (isShiny) {
            swordDamage += 90;
            newSwordLength += 1300;
          }
        } else if (enemyType == "giga") {
          swordDamage += 200;
          if (isShiny) {
            swordDamage += 500;
            newSwordLength += 1500;
          }
        }
        if (newSwordLength >= 12000 && isShiny) {
          const extraDamage = 100;
          swordDamage += extraDamage;
          newSwordLength = swordLength;
        }
        const newDamage = swordDamage + featureDmg - 20;
        currentFeature.set("swordLength", newSwordLength);
        currentFeature.set("swordDamage", parseFloat(newDamage.toFixed(2)));

        setCurrentDamage(parseFloat(newDamage.toFixed(2)));

        dropBlood(enemyCoords[0], enemyCoords[1]);
        handleEnemyKilled(enemyFeature);
        const enemyXp = enemyFeature.get("xp");
        setPlayerXP((prevXP) => {
          let newXP = prevXP + enemyXp;
          let tempLevel = playerLevel;
          let levelsToAdd = 0;

          while (newXP >= getXPRequiredForLevel(tempLevel + 1)) {
            newXP -= getXPRequiredForLevel(tempLevel + 1);
            tempLevel++;
            levelsToAdd++;
          }
          if (levelsToAdd > 0) {
            setLevelUpsQueued((prev) => prev + levelsToAdd);
          }

          return newXP;
        });

        showPopup(`+${swordDamage} Dmg`, screenCoords[0], screenCoords[1]);
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
        } else if (enemyType === "mid") {
          if (enemyData) {
            enemyData.hp = parseFloat(hp.toFixed(2));
            enemyFeature.set("enemyData", enemyData);
          }
          enemyFeature.setStyle(midEnemyStyle(enemyFeature));
        }
      }
      return true;
    }

    return false;
  }

  function swordSwing() {
    if (!currentFeature || gameOver || gamePaused) return;
    const playerCoords = (
      currentFeature.getGeometry() as Point
    ).getCoordinates();
    const swordLength = currentFeature.get("swordLength");

    const numberOfFrames = 244;
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
    const animationDuration = 520;

    const animationStep = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = (timestamp - startTime) / animationDuration;
      if (progress < 1) {
        const frameIndex = Math.floor(progress * numberOfFrames);
        const newSwordCoords = [playerCoords, swordCoordinates[frameIndex]];
        swordFeature.getGeometry()!.setCoordinates(newSwordCoords);
        enemySource.forEachFeature((enemyFeature) => {
          if (checkSwordHit(swordFeature, enemyFeature)) {
            const updatedSwordLength = currentFeature.get("swordLength");
            const enemyCoord = (
              enemyFeature.getGeometry() as Point
            ).getCoordinates();
            const screenCoords = map.getPixelFromCoordinate(enemyCoord);
            let hp = enemyFeature.get("helsepoeng") || 0;
            let swordDamage = 0;
            const enemyData = enemyFeature.get("enemyData");
            const enemyType = enemyFeature.get("type");
            const isShiny = enemyFeature.get("shiny");
            let newSwordLength = updatedSwordLength;
            const featureDmg = currentFeature.get("swordDamage");
            hp -= featureDmg;
            if (hp <= 0) {
              if (enemyType === "normal") {
                swordDamage += 0.1;
                if (isShiny) {
                  swordDamage += 0.4;
                  newSwordLength += 350;
                }
              } else if (enemyType === "mid") {
                swordDamage += 1;
                if (isShiny) {
                  swordDamage += 5;
                  newSwordLength += 650;
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
              if (newSwordLength >= 12000 && isShiny) {
                const extraDamage = 50;
                swordDamage += extraDamage;
                newSwordLength = swordLength;
              }
              const newDamage = swordDamage + featureDmg;
              currentFeature.set("swordLength", newSwordLength);
              currentFeature.set(
                "swordDamage",
                parseFloat(newDamage.toFixed(2)),
              );

              setCurrentDamage(parseFloat(newDamage.toFixed(2)));

              dropBlood(enemyCoord[0], enemyCoord[1]);
              handleEnemyKilled(enemyFeature);
              const enemyXp = enemyFeature.get("xp");
              setPlayerXP((prevXP) => {
                let newXP = prevXP + enemyXp;
                let tempLevel = playerLevel;
                let levelsToAdd = 0;

                while (newXP >= getXPRequiredForLevel(tempLevel + 1)) {
                  newXP -= getXPRequiredForLevel(tempLevel + 1);
                  tempLevel++;
                  levelsToAdd++;
                }
                if (levelsToAdd > 0) {
                  setLevelUpsQueued((prev) => prev + levelsToAdd);
                }

                return newXP;
              });

              showPopup(
                `+${swordDamage} Dmg`,
                screenCoords[0],
                screenCoords[1],
              );
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
              } else if (enemyType === "mid") {
                if (enemyData) {
                  enemyData.hp = parseFloat(hp.toFixed(2));
                  enemyFeature.set("enemyData", enemyData);
                }
                enemyFeature.setStyle(midEnemyStyle(enemyFeature));
              }
            }
          }
        });
        requestAnimationFrame(animationStep);
      } else {
        source.removeFeature(swordFeature);
      }
    };

    requestAnimationFrame(animationStep);
  }

  useEffect(() => {
    canSprintRef.current = canSprint;
  }, [canSprint]);

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
    if (gameOver || gamePaused) return;
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
    if (!currentFeature || gameOver || gamePaused) {
      return;
    }
    let animationFrameId: number | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();
      keysPressed[normalizedKey] = true;
      if (animationFrameId === null) {
        movePlayerSmoothly();
      }

      if (
        event.key === " " &&
        canRun &&
        dashUnlocked &&
        !gamePaused &&
        !isSprinting
      ) {
        setIsRunning(true);
        isSprinting = true;
        canRun = false;
        setCanSprint(false);
        currentFeature.set("canSprint", false);
        if (shootOnDash) {
          shootBullet();
        }
        if (doubleShootOnDash) {
          setTimeout(() => shootBullet(), 50);
          setTimeout(() => shootBullet(), 100);
          if (dashUpgrades >= 3) {
            setTimeout(() => shootBullet(), 150);
            setTimeout(() => shootBullet(), 200);
            setTimeout(() => shootBullet(), 250);
            if (speedUpgrades >= 3) {
              setTimeout(() => shootBullet(), 75);
              setTimeout(() => shootBullet(), 125);
            }
          }
          if (dashUpgrades >= 10) {
            setTimeout(() => shootBullet(), 300);
            setTimeout(() => shootBullet(), 350);
            setTimeout(() => shootBullet(), 400);
            setTimeout(() => shootBullet(), 450);
            if (speedUpgrades >= 5) {
              setTimeout(() => shootBullet(), 175);
              setTimeout(() => shootBullet(), 225);
            }
          }
        }

        sprintCooldownTimer.current = setTimeout(() => {
          setCanSprint(true);
          canRun = true;
          currentFeature.set("canSprint", true);
        }, dashCooldown);

        setTimeout(() => {
          isSprinting = false;
          setIsRunning(false);
        }, 350);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();
      delete keysPressed[normalizedKey];
    };

    const movePlayerSmoothly = () => {
      if (!currentFeature || gamePaused) return;

      dx = 0;
      dy = 0;
      if (keysPressed["w"] || keysPressed["arrowup"]) {
        lastDirection.current = "back";
        lastMirror.current = false;
        currentFeature.setStyle(
          backwardsPlayerStyle(currentFeature, canRun, playerLevel),
        );
        dy += playerSpeed;
      } else if (keysPressed["s"] || keysPressed["arrowdown"]) {
        lastDirection.current = "front";
        lastMirror.current = false;
        currentFeature.setStyle(
          playerStyle(false, currentFeature, canRun, playerLevel),
        );
        dy -= playerSpeed;
      }

      if (keysPressed["a"] || keysPressed["arrowleft"]) {
        lastMirror.current = false;
        currentFeature.setStyle(
          playerStyle(false, currentFeature, canRun, playerLevel),
        );
        dx -= playerSpeed;
      }
      if (keysPressed["d"] || keysPressed["arrowright"]) {
        lastMirror.current = true;
        currentFeature.setStyle(
          playerStyle(true, currentFeature, canRun, playerLevel),
        );
        dx += playerSpeed;
      }

      if (dx !== 0 || (dy !== 0 && !gamePaused)) {
        moveFeature(dx, dy, isSprinting);
        dy = 0;
        dx = 0;
      }
      if (!gamePaused) {
        animationFrameId = requestAnimationFrame(movePlayerSmoothly);
      }
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
  }, [
    currentFeature,
    gameOver,
    playerSpeed,
    gamePaused,
    dashUnlocked,
    shootOnDash,
    playerLevel,
  ]);
  let enemyMovementAnimationFrame: number | null = null;

  const moveEnemies = () => {
    if (!currentFeature || gameOver || gamePaused) return;
    if (!movingEnemies) return;

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

      if (distance < 350) {
        handleDeath(enemyFeature);
        if (enemyMovementAnimationFrame !== null) {
          cancelAnimationFrame(enemyMovementAnimationFrame);
        }
        stopAutoShooting();
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
    if (gameOver || !movingEnemies) return;

    enemyMovementAnimationFrame = requestAnimationFrame(moveEnemies);

    return () => {
      if (enemyMovementAnimationFrame !== null) {
        cancelAnimationFrame(enemyMovementAnimationFrame);
      }
    };
  }, [currentFeature, gameOver, gamePaused, movingEnemies]);
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
    if (!currentFeature) return;

    const direction = lastDirection.current;
    const mirror = lastMirror.current;
    if (direction === "back") {
      currentFeature.setStyle(
        backwardsPlayerStyle(currentFeature, canSprint, playerLevel),
      );
    } else {
      currentFeature.setStyle(
        playerStyle(mirror, currentFeature, canSprint, playerLevel),
      );
    }
  }, [canSprint, currentFeature, playerLevel]);

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
            <button onClick={() => setGamePaused((prev) => !prev)}>
              {gamePaused ? "Resume Game" : "Pause Game"}
            </button>
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
      <dialog ref={dialogRef} className="level-up-dialog">
        <div className="modal-content">
          <h2>Level Up!</h2>
          <button
            onClick={() => handleLevelUpChoice("dash")}
            disabled={dashUnlocked}
            className={dashUnlocked ? "disabled" : ""}
          >
            {dashUnlocked ? "Dash Unlocked" : "Unlock Dash"}
          </button>
          <button
            onClick={() => handleLevelUpChoice("shootOnDash")}
            disabled={!dashUnlocked || (shootOnDash && doubleShootOnDash)}
            className={shootOnDash || doubleShootOnDash ? "disabled" : ""}
          >
            {doubleShootOnDash
              ? "More Shoot on Dash Unlocked"
              : shootOnDash
                ? "Unlock More Shoot on Dash"
                : "Shoot on Dash"}
          </button>
          <button
            onClick={() => handleLevelUpChoice("dashCooldown")}
            disabled={!dashUnlocked || dashUpgrades >= 15}
          >
            {dashUpgrades < 15
              ? `Reduce Dash Cooldown +${dashUpgrades + 1}`
              : "Maxed Dash Cooldown"}{" "}
          </button>
          <button
            onClick={() => handleLevelUpChoice("speed")}
            disabled={speedUpgrades >= 5}
          >
            Speed +{speedUpgrades + 1} {speedUpgrades >= 5 ? "(Maxed)" : ""}
          </button>
          <button
            onClick={() => handleLevelUpChoice("cooldown")}
            disabled={cooldownUpgrades >= 15}
          >
            {cooldownUpgrades < 15
              ? `Sword cooldown (${(swingSpeed - 50) / 1000}s) +${cooldownUpgrades + 1}`
              : "Maxed Sword Cooldown"}
          </button>

          <button
            onClick={() => handleLevelUpChoice("autoShoot")}
            className={autoShoot ? "upgrade" : ""}
            disabled={autoUpgrades >= 15}
          >
            {autoShoot
              ? autoUpgrades >= 15
                ? "Auto-Shoot Maxed"
                : `Reduce Auto-Shoot Cooldown (${(autoShootCooldown - 130) / 1000}s) + ${autoUpgrades + 1}`
              : "Unlock Auto-Shoot"}{" "}
          </button>
          {playerLevel > 5 && (
            <button
              onClick={() => handleLevelUpChoice("damage")}
              className="damage-upgrade"
            >
              +{playerLevel + 1} Damage
            </button>
          )}
        </div>
      </dialog>
      {popups.map((popup) => (
        <FloatingPopup
          key={popup.id}
          x={popup.x}
          y={popup.y}
          text={popup.text}
          duration={popup.duration} // Pass the duration here
        />
      ))}
    </>
  );
}
