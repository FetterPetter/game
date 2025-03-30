import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style, Fill, Stroke, Text } from "ol/style";
import { enemySource } from "./addGameCharacter";

const bosses = [
  {
    name: "Lugia",
    normal: {
      hp: 10000,
      speed: 0.000299,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png",
    },
    shiny: {
      hp: 105600,
      speed: 0.00043,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/249.png",
    },
    chance: 0.05,
  },
  {
    name: "Gyarados",
    normal: {
      hp: 12100,
      speed: 0.000231,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
    },
    shiny: {
      hp: 33900,
      speed: 0.00026,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png",
    },
    chance: 0.25,
  },
  {
    name: "Mewtwo",
    normal: {
      hp: 10500,
      speed: 0.00021,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
    },
    shiny: {
      hp: 25000,
      speed: 0.00027,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png",
    },
    chance: 0.25,
  },
  {
    name: "Snorlax",
    normal: {
      hp: 18000,
      speed: 0.000229,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
    },
    shiny: {
      hp: 1500000,
      speed: 0.000259,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png",
    },
    chance: 0.2,
  },
  {
    name: "Charizard",
    normal: {
      hp: 1800,
      speed: 0.0002899,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    },
    shiny: {
      hp: 15000,
      speed: 0.00039,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
    },
    chance: 0.15,
  },
  {
    name: "Nidoking",
    normal: {
      hp: 8000,
      speed: 0.0002901,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
    },
    shiny: {
      hp: 25000,
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
      hp: 150,
      speed: 0.0002,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
    },
    chance: 0.8,
  },
  {
    name: "Beedrill",
    normal: {
      hp: 100,
      speed: 0.00022,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
    },
    shiny: {
      hp: 400,
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
      hp: 980,
      speed: 0.0003,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/30.png",
    },
    chance: 0.05,
  },
  {
    name: "Meowth",
    normal: {
      hp: 750,
      speed: 0.0001,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
    },
    shiny: {
      hp: 1550,
      speed: 0.00023,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/52.png",
    },
    chance: 0.04,
    timeAlive: 0,
  },
  {
    name: "Butterfree",
    normal: {
      hp: 1,
      speed: 0.00053,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
    },
    shiny: {
      hp: 1,
      speed: 0.00062,
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

export const bossStyle = (bossFeature: Feature) => {
  const { sprite, hp } = bossFeature.get("bossData");
  return new Style({
    image: new Icon({
      src: sprite,
      scale: 1.2,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 12px Arial",
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({
        color: "crimson",
        width: 5,
      }),
      offsetY: 50,
    }),
  });
};
export const enemyStyle = (enemyFeature: Feature) => {
  const { sprite, hp } = enemyFeature.get("enemyData");
  return new Style({
    image: new Icon({
      src: sprite,
      scale: 1,
      anchor: [0.5, 0.5],
    }),
    text: new Text({
      text: `HP: ${hp}`,
      font: "bold 12px Arial",
      fill: new Fill({ color: "white" }),
      stroke: new Stroke({
        color: "black",
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
  bossFeature.set("bossData", { sprite, hp, speed, shiny, name });
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
    if (enemyData.name === "Meowth") {
      enemyData.timeAlive += 1;
      const speedIncreaseRate = enemyData.shiny ? 0.0000021 : 0.000001;
      enemyData.speed += speedIncreaseRate * enemyData.timeAlive;
      randomEnemyFeature.set("speed", enemyData.speed);
      randomEnemyFeature.setStyle(enemyStyle(randomEnemyFeature));
    }
    setTimeout(updateEnemySpeed, 1000);
  };
  updateEnemySpeed();
}
