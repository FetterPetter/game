import { spawnFirstBoss } from "../modules/app/bosslogic";

type SpawnFunctions = {
  spawnRandomEnemy: () => { x: number; y: number };
  spawnRandomEnemyNow: (x: number, y: number, timer: number) => void;
  spawnRandomMidEnemyNow: (x: number, y: number, timer: number) => void;
  spawnBoss: (x: number, y: number, timer: number) => void;
  spawnGigaEnemy: (x: number, y: number, timer: number) => void;
  showPopup: (text: string, x: number, y: number, duration: number) => void;
};

let burstActive = false;
let burstCooldown = 0;
let midSpawnedOnce = false;
let bossSpawnedOnce = false;
let gigaSpawnedOnce = false;
let firstSpawnedOnce = false;
const popupX = window.innerWidth / 2 - 100; // 100px to the left
const popupY = window.innerHeight / 2 - 100; // 150px higher
function maybeTriggerBurst(
  timer: number,
  showPopup: SpawnFunctions["showPopup"],
  onBurst?: () => void,
) {
  if (timer > burstCooldown && Math.random() < 0.01) {
    burstActive = true;
    burstCooldown = timer + 30;
    onBurst?.();

    showPopup("⚠️💀 MONSTER TIME 💀⚠️", popupX, popupY, 5000);
    setTimeout(() => (burstActive = false), 5000); // Burst lasts for 5 seconds
  }
}

export function handleEnemySpawns(
  timer: number,
  {
    spawnRandomEnemy,
    spawnRandomEnemyNow,
    spawnRandomMidEnemyNow,
    spawnBoss,
    spawnGigaEnemy,
    showPopup,
  }: SpawnFunctions,
) {
  maybeTriggerBurst(timer, showPopup);
  const burstMultiplier = burstActive ? 2 : 1;
  const normalCount = Math.min(Math.floor(timer / 10) + 1, 6);
  const reducedNormalRate = timer >= 100 ? 0.3 : 1;
  for (let i = 0; i < normalCount * reducedNormalRate * burstMultiplier; i++) {
    const { x, y } = spawnRandomEnemy();
    spawnRandomEnemyNow(x, y, timer);
  }
  const midUnlock = 60;
  const midRampDelay = 0;
  const reducedMidRate = timer > 150 ? 0.3 : 1;
  if (timer >= midUnlock && !midSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnRandomMidEnemyNow(x, y, timer);
    midSpawnedOnce = true;
    showPopup("⚔️ BOSS SPAWN ⚔️", popupX, popupY, 3000);
  }
  if (timer > midUnlock + midRampDelay) {
    const elapsedTime = timer - midUnlock - midRampDelay;
    const rampUpFactor = Math.min(elapsedTime / 15, 6);
    const midCount = Math.floor(rampUpFactor);
    for (let i = 0; i < midCount * burstMultiplier * reducedMidRate; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnRandomMidEnemyNow(x, y, timer);
    }
  }
  const bossUnlock = 120;
  const bossRampDelay = 15;
  const reducedBossRate = timer > 260 ? 0.5 : 1;
  if (timer >= bossUnlock && !bossSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnBoss(x, y, timer);
    bossSpawnedOnce = true;
    showPopup("🌪️🐉 THE END IS NIGH 🐉🌪️", popupX, popupY, 4000);
  }
  if (timer >= bossUnlock + bossRampDelay) {
    let bossCount = 1;
    if (timer > bossUnlock + bossRampDelay) {
      const elapsedTime = timer - bossUnlock - bossRampDelay;
      const rampUpFactor = Math.min(elapsedTime / 15, 6);
      bossCount = Math.floor(rampUpFactor);
    }
    for (let i = 0; i < bossCount * burstMultiplier * reducedBossRate; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnBoss(x, y, timer);
    }
  }
  const gigaUnlock = 250;
  const gigaRampDelay = 50;

  if (timer >= gigaUnlock && !gigaSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnGigaEnemy(x, y, timer);
    gigaSpawnedOnce = true;
    showPopup("⚰️🐲 ANCIENT POWER AWAKENS 🐲⚰️", popupX, popupY, 5000);
  }
  if (timer >= gigaUnlock + gigaRampDelay) {
    let gigaCount = 1;
    if (timer > gigaUnlock + gigaRampDelay) {
      const elapsedTime = timer - gigaUnlock - gigaRampDelay;
      const rampUpFactor = Math.min(elapsedTime / 15, 10);
      gigaCount = Math.floor(rampUpFactor);
    }
    for (let i = 0; i < gigaCount * burstMultiplier; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnGigaEnemy(x, y, timer);
    }
  }
  const firstUnlock = 350;
  const firstRampDelay = 200;
  if (timer >= firstUnlock && !firstSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnFirstBoss(x, y, timer);
    firstSpawnedOnce = true;
    showPopup("🧠💥 MEGA INTELLIGENCE DETECTED 💥🧠", popupX, popupY, 6000);
    //💀👑 FINAL BOSS APPROACHES 👑💀 🌪️🐉 THE END IS NIGH 🐉🌪️🔥👺 GIGA BOSS RISES 👺🔥
    //🧠💥 MEGA INTELLIGENCE DETECTED 💥🧠 🕳️👹 VOID LORD DESCENDS 👹🕳️ ⚠️⚡️ UNSTOPPABLE FORCE INCOMING ⚡️⚠️
    //🛑👿 DOOM HAS ARRIVED 👿🛑 ⚰️🐲 ANCIENT POWER AWAKENS 🐲⚰️ ⛓️🦾 THE FINAL TEST BEGINS 🦾⛓️
  }
  if (timer >= firstUnlock + firstRampDelay) {
    let firstCount = 1;
    if (timer > firstUnlock + firstRampDelay) {
      const elapsedTime = timer - firstUnlock - firstRampDelay;
      const rampUpFactor = Math.min(elapsedTime / 15, 10);
      firstCount = Math.floor(rampUpFactor);
    }
    for (let i = 0; i < firstCount * burstMultiplier; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnFirstBoss(x, y, timer);
    }
  }
}
