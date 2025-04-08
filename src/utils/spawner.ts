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

function maybeTriggerBurst(
  timer: number,
  showPopup: SpawnFunctions["showPopup"],
  onBurst?: () => void,
) {
  if (timer > burstCooldown && Math.random() < 0.01) {
    burstActive = true;
    burstCooldown = timer + 30;
    onBurst?.();
    const popupX = window.innerWidth / 2;
    const popupY = window.innerHeight / 2;

    showPopup("💀 MONSTER TIME 💀", popupX, popupY, 3000);
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
    const popupX = window.innerWidth / 2;
    const popupY = window.innerHeight / 2;
    showPopup("⚔️ BOSS SPAWN ⚔️", popupX, popupY, 3000);
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
    const popupX = window.innerWidth / 2;
    const popupY = window.innerHeight / 2;
    showPopup("⚔️ BOSS SPAWN ⚔️", popupX, popupY, 3000);
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
}
