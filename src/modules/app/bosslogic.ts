import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style, Fill, Stroke, Text } from "ol/style";
import { enemySource } from "./addGameCharacter";

const gigaEnemies = [
  {
    name: "Machamp",
    normal: {
      hp: 920000,
      speed: 0.00018,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
    },
    shiny: {
      hp: 5105600,
      speed: 0.0002,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/68.png",
    },
    chance: 0.5,
  },
  {
    name: "Alakazam",
    normal: {
      hp: 100000,
      speed: 0.000298,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
    },
    shiny: {
      hp: 1105600,
      speed: 0.0003,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/65.png",
    },
    chance: 0.45,
  },

  {
    name: "Ho-Oh",
    normal: {
      hp: 7302000,
      speed: 0.0002995,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png",
    },
    shiny: {
      hp: 999999999999,
      speed: 0.00031,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/250.png",
    },
    chance: 0.05,
  },
];

export function spawnGigaEnemy(x: number, y: number) {
  const { sprite, hp, speed, shiny, name } = getGigaEnemy();

  const gigaFeature = new Feature({
    geometry: new Point([x, y]),
  });
  gigaFeature.set("enemyData", { sprite, hp, speed, shiny, name });
  gigaFeature.set("name", name);
  gigaFeature.set("helsepoeng", hp);
  gigaFeature.set("type", "giga");
  gigaFeature.set("speed", speed);
  gigaFeature.set("shiny", shiny);
  enemySource.addFeature(gigaFeature);
  gigaFeature.setStyle(gigaEnemyStyle(gigaFeature));
  const updateGigaEnemySpeed = () => {
    const enemyData = gigaFeature.get("enemyData");
    if (!enemyData) return;

    enemyData.timeAlive = (enemyData.timeAlive || 0) + 1;
    const speedIncreaseRate = enemyData.shiny ? 0.0000021 : 0.000001;
    enemyData.speed += speedIncreaseRate * enemyData.timeAlive;

    gigaFeature.set("speed", enemyData.speed);
    gigaFeature.setStyle(gigaEnemyStyle(gigaFeature));

    setTimeout(updateGigaEnemySpeed, 100000);
  };

  updateGigaEnemySpeed();
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
        shiny: isShiny,
      };
    }
  }
  return {
    name: gigaEnemies[0].name,
    sprite: gigaEnemies[0].normal.sprite,
    hp: gigaEnemies[0].normal.hp,
    speed: gigaEnemies[0].normal.speed,
    shiny: false,
  };
};
const bosses = [
  {
    name: "Lugia",
    normal: {
      hp: 30000,
      speed: 0.0002999,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png",
    },
    shiny: {
      hp: 40000,
      speed: 0.0004,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/249.png",
    },
    chance: 0.05,
  },
  {
    name: "Gyarados",
    normal: {
      hp: 19000,
      speed: 0.000251,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
    },
    shiny: {
      hp: 93900,
      speed: 0.00026,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png",
    },
    chance: 0.25,
  },
  {
    name: "Mewtwo",
    normal: {
      hp: 20500,
      speed: 0.00022,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
    },
    shiny: {
      hp: 55000,
      speed: 0.000274,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png",
    },
    chance: 0.25,
  },
  {
    name: "Snorlax",
    normal: {
      hp: 48000,
      speed: 0.000229,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
    },
    shiny: {
      hp: 2500000,
      speed: 0.000299,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png",
    },
    chance: 0.2,
  },
  {
    name: "Charizard",
    normal: {
      hp: 13800,
      speed: 0.0002899,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    },
    shiny: {
      hp: 29000,
      speed: 0.00039,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
    },
    chance: 0.15,
  },
  {
    name: "Nidoking",
    normal: {
      hp: 28000,
      speed: 0.0002901,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
    },
    shiny: {
      hp: 95000,
      speed: 0.000299,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/34.png",
    },
    chance: 0.1,
  },
];

const enemies = [
  {
    name: "Bulbasaur",
    normal: {
      hp: 20,
      speed: 0.0002,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    },
    shiny: {
      hp: 2150,
      speed: 0.00021,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
    },
    chance: 0.8,
  },
  {
    name: "Beedrill",
    normal: {
      hp: 200,
      speed: 0.00025,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
    },
    shiny: {
      hp: 4300,
      speed: 0.00028,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/15.png",
    },
    chance: 0.1,
  },
  {
    name: "Nidorina",
    normal: {
      hp: 180,
      speed: 0.00029,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
    },
    shiny: {
      hp: 1980,
      speed: 0.0003,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/30.png",
    },
    chance: 0.05,
  },
  {
    name: "Meowth",
    normal: {
      hp: 500,
      speed: 0.0001,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
    },
    shiny: {
      hp: 2550,
      speed: 0.0002,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/52.png",
    },
    chance: 0.04,
  },
  {
    name: "Butterfree",
    normal: {
      hp: 1,
      speed: 0.00049,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
    },
    shiny: {
      hp: 1,
      speed: 0.00058,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/12.png",
    },
    chance: 0.01,
  },
];
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
        shiny: isShiny,
      };
    }
  }
  return {
    sprite: enemies[0].normal.sprite,
    hp: enemies[0].normal.hp,
    speed: enemies[0].normal.speed,
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
        shiny: isShiny,
      };
    }
  }
  return {
    name: bosses[0].name,
    sprite: bosses[0].normal.sprite,
    hp: bosses[0].normal.hp,
    speed: bosses[0].normal.speed,
    shiny: false,
  };
};
export const gigaEnemyStyle = (gigaFeature: Feature) => {
  const { sprite, hp, shiny } = gigaFeature.get("enemyData");
  const screen = window.innerWidth;
  let baseScale = screen > 1600 ? 1.4 : 1.2;
  const glowColor =
    hp > 5000
      ? "rgba(255, 0, 0, 0.8)"
      : hp > 2000
        ? "rgba(255, 165, 0, 0.8)"
        : "rgba(0, 255, 0, 0.8)";

  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? baseScale * 1.2 : baseScale,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 14px Arial",
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({
        color: glowColor,
        width: 6,
      }),
      offsetY: 55,
    }),
  });
};
export const bossStyle = (bossFeature: Feature) => {
  const { sprite, hp, shiny } = bossFeature.get("enemyData");
  const screen = window.innerWidth;
  let baseScale = screen > 1600 ? 1.3 : 1;
  let hpColor = "lime";
  if (hp < 5000) hpColor = "yellow";
  if (hp < 2000) hpColor = "red";

  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? baseScale * 1.2 : baseScale,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 14px Arial",
      fill: new Fill({ color: hpColor }),
      stroke: new Stroke({
        color: shiny ? "gold" : "crimson",
        width: 5,
      }),
      offsetY: 50,
    }),
  });
};

export const enemyStyle = (enemyFeature: Feature) => {
  const { sprite, hp, shiny } = enemyFeature.get("enemyData");
  const screen = window.innerWidth;
  let baseScale = screen > 1600 ? 1 : 0.8;
  return new Style({
    image: new Icon({
      src: sprite,
      scale: shiny ? baseScale * 1.2 : baseScale,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 12px Arial",
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({
        color: shiny ? "gold" : "black",
        width: 3,
      }),
      offsetY: 50,
    }),
  });
};

export function spawnBoss(x: number, y: number) {
  const { sprite, hp, speed, shiny, name } = getRandomBoss();

  const bossFeature = new Feature({
    geometry: new Point([x, y]),
  });
  bossFeature.set("enemyData", { sprite, hp, speed, shiny, name });
  bossFeature.set("name", name);
  bossFeature.set("helsepoeng", hp);
  bossFeature.set("type", "boss");
  bossFeature.set("speed", speed);
  bossFeature.set("shiny", shiny);
  enemySource.addFeature(bossFeature);
  bossFeature.setStyle(bossStyle(bossFeature));
}

export function spawnRandomEnemyNow(x: number, y: number) {
  const { sprite, hp, speed, shiny, name } = getRandomEnemy();
  const randomEnemyFeature = new Feature({
    geometry: new Point([x ? x : 0, y ? y : 0]),
  });
  randomEnemyFeature.set("enemyData", {
    sprite,
    hp,
    speed,
    shiny,
    name,
    timeAlive: 0,
  });
  randomEnemyFeature.set("name", name);
  randomEnemyFeature.set("helsepoeng", hp);
  randomEnemyFeature.set("type", "normal");
  randomEnemyFeature.set("speed", speed);
  randomEnemyFeature.set("shiny", shiny);
  enemySource.addFeature(randomEnemyFeature);
  randomEnemyFeature.setStyle(enemyStyle(randomEnemyFeature));
  const updateEnemySpeed = () => {
    const enemyData = randomEnemyFeature.get("enemyData");
    if (!enemyData) return;
    if (enemyData.name === "Meowth") {
      enemyData.timeAlive += 1;
      const speedIncreaseRate = enemyData.shiny ? 0.0000011 : 0.0000005;
      enemyData.speed += speedIncreaseRate * enemyData.timeAlive;
      randomEnemyFeature.set("speed", enemyData.speed);
      randomEnemyFeature.setStyle(enemyStyle(randomEnemyFeature));
    }
    setTimeout(updateEnemySpeed, 1000);
  };
  updateEnemySpeed();
}
