import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style, Fill, Stroke, Text } from "ol/style";
import { BASE_SCALE, enemySource } from "./addGameCharacter";

const gigaEnemies = [
  {
    name: "Machamp",
    xp: 900,
    normal: {
      hp: 920000,
      speed: 33.005,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
    },
    shiny: {
      hp: 5105600,
      speed: 35.2278,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/68.png",
    },
    chance: 0.5,
  },
  {
    name: "Alakazam",
    xp: 700,
    normal: {
      hp: 100000,
      speed: 35.119422,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
    },
    shiny: {
      hp: 1105600,
      speed: 37.3417,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/65.png",
    },
    chance: 0.45,
  },

  {
    name: "Ho-Oh",
    xp: 1000,
    normal: {
      hp: 7302000,
      speed: 39.28,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png",
    },
    shiny: {
      hp: 999999999999,
      speed: 47.45,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/250.png",
    },
    chance: 0.05,
  },
];

export function spawnGigaEnemy(x: number, y: number, timer: number) {
  const { sprite, hp, speed, shiny, name, xp } = getGigaEnemy();

  const difficultyScaling = 1 + Math.floor(timer / 60) * 0.25;
  const speedScalingFactor = 1 + Math.floor(timer / 60) * 0.07;
  const scaledSpeed = speed * speedScalingFactor;
  const scaledHp = parseFloat((hp * difficultyScaling).toFixed(2));

  const gigaEnemyFeature = new Feature({
    geometry: new Point([x ? x : 0, y ? y : 0]),
  });

  gigaEnemyFeature.set("enemyData", {
    sprite,
    hp: scaledHp,
    speed: scaledSpeed,
    shiny,
    name,
    xp: xp,
    timeAlive: 0,
  });

  gigaEnemyFeature.set("name", name);
  gigaEnemyFeature.set("helsepoeng", scaledHp);
  gigaEnemyFeature.set("type", "giga");
  gigaEnemyFeature.set("speed", scaledSpeed);
  gigaEnemyFeature.set("shiny", shiny);
  gigaEnemyFeature.set("xp", shiny ? xp * 10 : xp);
  enemySource.addFeature(gigaEnemyFeature);
  gigaEnemyFeature.setStyle(gigaEnemyStyle(gigaEnemyFeature));
}

const getGigaEnemy = () => {
  let rand = Math.random();
  let shinyRand = Math.random();
  let cumulativeProbability = 0;
  for (const gigaEnemy of gigaEnemies) {
    cumulativeProbability += gigaEnemy.chance;
    if (rand < cumulativeProbability) {
      const isShiny = shinyRand < 0.01;
      const variant = isShiny ? gigaEnemy.shiny : gigaEnemy.normal;
      return {
        name: gigaEnemy.name,
        sprite: variant.sprite,
        hp: variant.hp,
        speed: variant.speed,
        xp: gigaEnemy.xp,
        shiny: isShiny,
      };
    }
  }
  return {
    name: gigaEnemies[0].name,
    sprite: gigaEnemies[0].normal.sprite,
    hp: gigaEnemies[0].normal.hp,
    speed: gigaEnemies[0].normal.speed,
    xp: gigaEnemies[0].xp,
    shiny: false,
  };
};
const bosses = [
  {
    name: "Lugia",
    xp: 500,
    normal: {
      hp: 20000,
      speed: 34,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png",
    },
    shiny: {
      hp: 40000,
      speed: 40.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/249.png",
    },
    chance: 0.05,
  },
  {
    name: "Gyarados",
    xp: 132,
    normal: {
      hp: 14000,
      speed: 31.9,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
    },
    shiny: {
      hp: 93900,
      speed: 35.9,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png",
    },
    chance: 0.25,
  },
  {
    name: "Mewtwo",
    xp: 110,
    normal: {
      hp: 17500,
      speed: 30.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
    },
    shiny: {
      hp: 55000,
      speed: 35.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png",
    },
    chance: 0.25,
  },
  {
    name: "Snorlax",
    xp: 170,
    normal: {
      hp: 28000,
      speed: 29.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
    },
    shiny: {
      hp: 2500000,
      speed: 32,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png",
    },
    chance: 0.2,
  },
  {
    name: "Charizard",
    xp: 200,
    normal: {
      hp: 13800,
      speed: 36.2,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    },
    shiny: {
      hp: 29000,
      speed: 44.3,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
    },
    chance: 0.15,
  },
  {
    name: "Nidoking",
    xp: 150,
    normal: {
      hp: 25000,
      speed: 31,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
    },
    shiny: {
      hp: 95000,
      speed: 31.2,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/34.png",
    },
    chance: 0.1,
  },
];
const midEnemies = [
  {
    name: "Ivysaur",
    xp: 50,
    normal: {
      hp: 400,
      speed: 25,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
    },
    shiny: {
      hp: 4000,
      speed: 28,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png",
    },
    chance: 0.4,
  },
  {
    name: "Pidgeotto",
    xp: 55,
    normal: {
      hp: 100,
      speed: 40,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
    },
    shiny: {
      hp: 1000,
      speed: 49,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/17.png",
    },
    chance: 0.1,
  },
  {
    name: "Wartortle",
    xp: 60,
    normal: {
      hp: 500,
      speed: 28,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
    },
    shiny: {
      speed: 31,
      hp: 5000,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/8.png",
    },
    chance: 0.2,
  },
  {
    name: "Charmeleon",
    xp: 65,
    normal: {
      hp: 600,
      speed: 34,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
    },
    shiny: {
      hp: 6000,
      speed: 38,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/5.png",
    },
    chance: 0.1,
  },
  {
    name: "Raticate",
    xp: 60,
    normal: {
      hp: 400,
      speed: 38,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
    },
    shiny: {
      hp: 4000,
      speed: 42,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/19.png",
    },
    chance: 0.2,
  },
];

const enemies = [
  {
    name: "Bulbasaur",
    xp: 1,
    normal: {
      hp: 20,
      speed: 22,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    },
    shiny: {
      hp: 2150,
      speed: 23,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
    },
    chance: 0.8,
  },
  {
    name: "Beedrill",
    xp: 5,
    normal: {
      hp: 200,
      speed: 27.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
    },
    shiny: {
      hp: 4300,
      speed: 30.9,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/15.png",
    },
    chance: 0.1,
  },
  {
    name: "Nidorina",
    xp: 10,
    normal: {
      hp: 180,
      speed: 31,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
    },
    shiny: {
      hp: 1980,
      speed: 31.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/30.png",
    },
    chance: 0.05,
  },
  {
    name: "Meowth",
    xp: 20,
    normal: {
      hp: 500,
      speed: 25.1,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
    },
    shiny: {
      hp: 1550,
      speed: 27.3,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/52.png",
    },
    chance: 0.04,
  },
  {
    name: "Butterfree",
    xp: 50,
    normal: {
      hp: 1,
      speed: 54.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
    },
    shiny: {
      hp: 1,
      speed: 64.5,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/12.png",
    },
    chance: 0.01,
  },
];

export function spawnRandomMidEnemyNow(x: number, y: number, timer: number) {
  const { sprite, hp, speed, shiny, name, xp } = getRandomMidEnemy();

  const difficultyScaling = 1 + Math.floor(timer / 60) * 0.3;
  const speedScalingFactor = 1 + Math.floor(timer / 60) * 0.06;
  const scaledHp = parseFloat((hp * difficultyScaling).toFixed(2));
  const scaledSpeed = speed * speedScalingFactor;

  const randomMidEnemyFeature = new Feature({
    geometry: new Point([x ? x : 0, y ? y : 0]),
  });

  randomMidEnemyFeature.set("enemyData", {
    sprite,
    hp: scaledHp,
    speed: scaledSpeed,
    shiny,
    name,
    xp: xp,
    timeAlive: 0,
  });

  randomMidEnemyFeature.set("name", name);
  randomMidEnemyFeature.set("helsepoeng", scaledHp);
  randomMidEnemyFeature.set("type", "mid");
  randomMidEnemyFeature.set("speed", scaledSpeed);
  randomMidEnemyFeature.set("shiny", shiny);
  randomMidEnemyFeature.set("xp", shiny ? xp * 10 : xp);

  enemySource.addFeature(randomMidEnemyFeature);

  randomMidEnemyFeature.setStyle(midEnemyStyle(randomMidEnemyFeature));
}

const getRandomMidEnemy = () => {
  let rand = Math.random();
  let shinyRand = Math.random();
  let cumulative = 0;

  for (const enemy of midEnemies) {
    cumulative += enemy.chance;
    if (rand < cumulative) {
      const isShiny = shinyRand < 0.01;
      const variant = isShiny ? enemy.shiny : enemy.normal;
      return {
        name: enemy.name,
        sprite: variant.sprite,
        hp: variant.hp,
        speed: variant.speed,
        xp: enemy.xp,
        shiny: isShiny,
      };
    }
  }

  return {
    sprite: midEnemies[0].normal.sprite,
    hp: midEnemies[0].normal.hp,
    speed: midEnemies[0].normal.speed,
    xp: midEnemies[0].xp,
    shiny: false,
  };
};
const getRandomEnemy = () => {
  let rand = Math.random();
  let shinyRand = Math.random();
  let cumulative = 0;
  for (const enemy of enemies) {
    cumulative += enemy.chance;
    if (rand < cumulative) {
      const isShiny = shinyRand < 0.01;
      const variant = isShiny ? enemy.shiny : enemy.normal;
      return {
        name: enemy.name,
        sprite: variant.sprite,
        hp: variant.hp,
        speed: variant.speed,
        xp: enemy.xp,
        shiny: isShiny,
      };
    }
  }
  return {
    sprite: enemies[0].normal.sprite,
    hp: enemies[0].normal.hp,
    speed: enemies[0].normal.speed,
    xp: enemies[0].xp,
    shiny: false,
  };
};
const getRandomBoss = () => {
  let rand = Math.random();
  let shinyRand = Math.random();
  let cumulativeProbability = 0;
  for (const boss of bosses) {
    cumulativeProbability += boss.chance;
    if (rand < cumulativeProbability) {
      const isShiny = shinyRand < 0.01;
      const variant = isShiny ? boss.shiny : boss.normal;
      return {
        name: boss.name,
        sprite: variant.sprite,
        hp: variant.hp,
        speed: variant.speed,
        xp: boss.xp,
        shiny: isShiny,
      };
    }
  }
  return {
    name: bosses[0].name,
    sprite: bosses[0].normal.sprite,
    hp: bosses[0].normal.hp,
    speed: bosses[0].normal.speed,
    xp: bosses[0].xp,
    shiny: false,
  };
};
export const gigaEnemyStyle = (gigaFeature: Feature) => {
  const { sprite, hp, shiny } = gigaFeature.get("enemyData");
  const gigaScale = BASE_SCALE * 1.5;
  const glowColor =
    hp > 5000
      ? "rgba(255, 0, 0, 0.8)"
      : hp > 2000
        ? "rgba(255, 165, 0, 0.8)"
        : "rgba(0, 255, 0, 0.8)";

  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? gigaScale * 1.2 : gigaScale,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 14px Arial",
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({
        color: glowColor,
        width: shiny ? 8 : 6,
      }),
      offsetY: 55,
    }),
  });
};
export const bossStyle = (bossFeature: Feature) => {
  const { sprite, hp, shiny } = bossFeature.get("enemyData");
  const bossScale = BASE_SCALE * 1.2;
  const minHp = 1;
  const maxHp = 10000;
  const normalized = Math.min(Math.max((hp - minHp) / (maxHp - minHp), 0), 1);
  const r = Math.floor(255 * (1 - normalized));
  const g = 255;
  const b = Math.floor(255 * (1 - normalized));

  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? bossScale * 1.2 : bossScale,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 14px Arial",
      fill: new Fill({ color: `rgb(${r}, ${g}, ${b})` }),
      stroke: new Stroke({
        color: shiny ? "gold" : "crimson",
        width: shiny ? 6 : 4,
      }),
      offsetY: 50,
    }),
  });
};
export const midEnemyStyle = (midFeature: Feature) => {
  const { sprite, hp, shiny } = midFeature.get("enemyData");
  const midScale = BASE_SCALE * 1.1;
  const minHp = 1;
  const maxHp = 4000;
  const normalized = Math.min(Math.max((hp - minHp) / (maxHp - minHp), 0), 1);
  const r = Math.floor(255 * (1 - normalized));
  const g = 255;
  const b = Math.floor(255 * (1 - normalized));

  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? midScale * 1.2 : midScale,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 14px Arial",
      fill: new Fill({ color: shiny ? `rgb(${r}, ${g}, ${b})` : "white" }),
      stroke: new Stroke({
        color: shiny ? "gold" : "black",
        width: shiny ? 4 : 2,
      }),
      offsetY: 50,
    }),
  });
};

export const enemyStyle = (enemyFeature: Feature) => {
  const { sprite, hp, shiny } = enemyFeature.get("enemyData");
  const minHp = 1;
  const maxHp = 2000;
  const normalized = Math.min(Math.max((hp - minHp) / (maxHp - minHp), 0), 1);
  const r = Math.floor(255 * (1 - normalized));
  const g = 255;
  const b = Math.floor(255 * (1 - normalized));

  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? BASE_SCALE * 1.2 : BASE_SCALE,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 12px Arial",
      fill: new Fill({ color: shiny ? `rgb(${r}, ${g}, ${b})` : "white" }),
      stroke: new Stroke({
        color: shiny ? "gold" : "black",
        width: shiny ? 3 : 1,
      }),
      offsetY: 50,
    }),
  });
};

export function spawnBoss(x: number, y: number, timer: number) {
  const { sprite, hp, speed, shiny, name, xp } = getRandomBoss();

  const difficultyScaling = 1 + Math.floor(timer / 60) * 0.1;
  const speedScalingFactor = 1 + Math.floor(timer / 60) * 0.05;
  const scaledSpeed = speed * speedScalingFactor;
  const scaledHp = parseFloat((hp * difficultyScaling).toFixed(2));
  const scaledXp = xp * difficultyScaling;

  const bossFeature = new Feature({
    geometry: new Point([x ? x : 0, y ? y : 0]),
  });

  bossFeature.set("enemyData", {
    sprite,
    hp: scaledHp,
    speed: scaledSpeed,
    shiny,
    name,
    xp: scaledXp,
    timeAlive: 0,
  });

  bossFeature.set("name", name);
  bossFeature.set("helsepoeng", scaledHp);
  bossFeature.set("type", "boss");
  bossFeature.set("speed", scaledSpeed);
  bossFeature.set("shiny", shiny);
  bossFeature.set("xp", shiny ? scaledXp * 10 : scaledXp);

  enemySource.addFeature(bossFeature);

  bossFeature.setStyle(bossStyle(bossFeature));
}

export function spawnRandomEnemyNow(x: number, y: number, timer: number) {
  const { sprite, hp, speed, shiny, name, xp } = getRandomEnemy();

  const difficultyScaling = 1 + Math.floor(timer / 60) * 0.7;
  const speedScalingFactor = 1 + Math.floor(timer / 60) * 0.05;
  const scaledSpeed = speed * speedScalingFactor;
  const scaledHp = parseFloat((hp * difficultyScaling).toFixed(2));

  const randomEnemyFeature = new Feature({
    geometry: new Point([x || 0, y || 0]),
  });

  randomEnemyFeature.set("enemyData", {
    sprite,
    hp: scaledHp,
    speed: scaledSpeed,
    shiny,
    name,
    xp: xp,
    timeAlive: 0,
  });
  randomEnemyFeature.set("name", name);
  randomEnemyFeature.set("helsepoeng", scaledHp);
  randomEnemyFeature.set("type", "normal");
  randomEnemyFeature.set("speed", scaledSpeed);
  randomEnemyFeature.set("shiny", shiny);
  randomEnemyFeature.set("xp", shiny ? xp * 10 : xp);
  enemySource.addFeature(randomEnemyFeature);
  randomEnemyFeature.setStyle(enemyStyle(randomEnemyFeature));
}
