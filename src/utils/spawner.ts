type SpawnFunctions = {
  spawnRandomEnemy: () => { x: number; y: number };
  spawnRandomEnemyNow: (x: number, y: number, timer: number) => void;
  spawnRandomMidEnemyNow: (x: number, y: number, timer: number) => void;
  spawnBoss: (x: number, y: number, timer: number) => void;
  spawnGigaEnemy: (x: number, y: number, timer: number) => void;
};

let burstActive = false;
let burstCooldown = 0;
let midSpawnedOnce = false;
let bossSpawnedOnce = false;
let gigaSpawnedOnce = false;

function maybeTriggerBurst(timer: number) {
  if (timer > burstCooldown && Math.random() < 0.1) {
    burstActive = true;
    burstCooldown = timer + 30;
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
  }: SpawnFunctions,
) {
  maybeTriggerBurst(timer);
  const burstMultiplier = burstActive ? 2 : 1;

  const normalCount = Math.min(Math.floor(timer / 10) + 1, 8);
  const reducedNormalRate = timer >= 120 ? 0.3 : 1;
  for (let i = 0; i < normalCount * reducedNormalRate * burstMultiplier; i++) {
    const { x, y } = spawnRandomEnemy();
    spawnRandomEnemyNow(x, y, timer);
  }

  const midUnlock = 15;
  const midRampDelay = 30;
  const reducedMidRate = timer > 165 ? 0.3 : 1;
  if (timer >= midUnlock && !midSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnRandomMidEnemyNow(x, y, timer);
    midSpawnedOnce = true;
  }

  if (timer > midUnlock + midRampDelay) {
    const elapsedTime = timer - midUnlock - midRampDelay;
    const rampUpFactor = Math.min(elapsedTime / 15, 8);
    const midCount = Math.floor(rampUpFactor);
    for (let i = 0; i < midCount * burstMultiplier * reducedMidRate; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnRandomMidEnemyNow(x, y, timer);
    }
  }
  const bossUnlock = 120;
  const bossRampDelay = 15;
  const reducedBossRate = timer > 320 ? 0.5 : 1;
  if (timer >= bossUnlock && !bossSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnBoss(x, y, timer);
    bossSpawnedOnce = true;
  }
  if (timer >= bossUnlock + bossRampDelay) {
    let bossCount = 1;
    if (timer > bossUnlock + bossRampDelay) {
      const elapsedTime = timer - bossUnlock - bossRampDelay;
      const rampUpFactor = Math.min(elapsedTime / 15, 7);
      bossCount = Math.floor(rampUpFactor);
    }

    for (let i = 0; i < bossCount * burstMultiplier * reducedBossRate; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnBoss(x, y, timer);
    }
  }

  const gigaUnlock = 300;
  const gigaRampDelay = 100;

  if (timer >= gigaUnlock && !gigaSpawnedOnce) {
    const { x, y } = spawnRandomEnemy();
    spawnGigaEnemy(x, y, timer);
    gigaSpawnedOnce = true;
  }
  if (timer >= gigaUnlock + gigaRampDelay) {
    let gigaCount = 1;
    if (timer > gigaUnlock + gigaRampDelay) {
      const elapsedTime = timer - gigaUnlock - gigaRampDelay;
      const rampUpFactor = Math.min(elapsedTime / 30, 10);
      gigaCount = Math.floor(rampUpFactor);
    }

    for (let i = 0; i < gigaCount * burstMultiplier; i++) {
      const { x, y } = spawnRandomEnemy();
      spawnGigaEnemy(x, y, timer);
    }
  }
}
