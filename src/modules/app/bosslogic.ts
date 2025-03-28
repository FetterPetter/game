import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style, Fill, Stroke, Text } from "ol/style";
import { enemySource } from "./addGameCharacter";

const enemySprites = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", //bulb
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png", // butterfree
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png", // Bedrill
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png", // nidonoe?
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png", // mjaut
];
const enemyStats = [
  [30, 0.0002],
  [1, 0.00065],
  [120, 0.00022],
  [180, 0.00029],
  [150, 0.00021],
];
const bossSprites = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/249.png", // lugia
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png", // gyra
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png", // mew2
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png", // snor
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png", // char
];

const bossStats = [
  [5600, 0.00023],
  [2900, 0.00018],
  [3000, 0.00019],
  [10000, 0.00024],
  [1000, 0.00029],
];
const getRandomEnemy = () => {
  const enemyChances = [0.8, 0.05, 0.1, 0.01, 0.04];
  const rand = Math.random();
  let cumulativeProbability = 0;
  let selectedIndex = 0;
  for (let i = 0; i < enemyChances.length; i++) {
    cumulativeProbability += enemyChances[i];
    if (rand < cumulativeProbability) {
      selectedIndex = i;
      break;
    }
  }
  const sprite = enemySprites[selectedIndex];
  const [hp, speed] = enemyStats[selectedIndex];
  return { sprite, hp, speed };
};

const getRandomBoss = () => {
  const enemyChances = [0.05, 0.15, 0.5, 0.15, 0.15];
  const rand = Math.random();
  let cumulativeProbability = 0;
  let randomIndex = 0;
  for (let i = 0; i < enemyChances.length; i++) {
    cumulativeProbability += enemyChances[i];
    if (rand < cumulativeProbability) {
      randomIndex = i;
      break;
    }
  }
  const sprite = bossSprites[randomIndex];
  const [hp, speed] = bossStats[randomIndex];
  return { sprite, hp, speed };
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
        color: "black",
        width: 3,
      }),
      offsetY: 50,
    }),
  });
};
export const enemyStyle = (enemyFeature: Feature) => {
  const { sprite } = enemyFeature.get("enemyData");
  return new Style({
    image: new Icon({
      src: sprite,
      scale: 1,
      anchor: [0.5, 0.5],
    }),
  });
};

export function spawnBoss(x: number, y: number) {
  const { sprite, hp, speed } = getRandomBoss();

  const bossFeature = new Feature({
    geometry: new Point([x, y]),
  });

  bossFeature.set("bossData", { sprite, hp, speed });
  bossFeature.set("helsepoeng", hp);
  bossFeature.set("type", "boss");
  bossFeature.set("speed", speed);

  enemySource.addFeature(bossFeature);
  bossFeature.setStyle(bossStyle(bossFeature));
}

export function spawnRandomEnemyNow(x: number, y: number) {
  const { sprite, hp, speed } = getRandomEnemy();
  const randomEnemyFeature = new Feature({
    geometry: new Point([x ? x : 0, y ? y : 0]),
  });
  randomEnemyFeature.set("enemyData", { sprite, hp, speed });
  randomEnemyFeature.set("helsepoeng", hp);
  randomEnemyFeature.set("type", "normal");
  randomEnemyFeature.set("speed", speed);
  enemySource.addFeature(randomEnemyFeature);
  randomEnemyFeature.setStyle(enemyStyle(randomEnemyFeature));
}
