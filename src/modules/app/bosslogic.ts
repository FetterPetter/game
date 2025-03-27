import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style, Fill, Stroke, Text } from "ol/style";
import { enemySource } from "./addGameCharacter";

const bossSprites = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/249.png", // Boss 1
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png", // Boss 2
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png", // Boss 3
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png", // Boss 4
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png", // Boss 5
];

const bossStats = [
  [5000, 0.0009],
  [2900, 0.0013],
  [3000, 0.0012],
  [10000, 0.001],
  [3500, 0.0018],
];
const enemySprites = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", //bulb
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png", // butterfree
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png", // Bedrill
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png", // nidonoe?
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png", // mjaut
];

const enemyStats = [
  [10, 0.0019],
  [1, 0.0039],
  [78, 0.0012],
  [50, 0.0011],
  [1, 0.0018],
];

const getRandomEnemy = () => {
  const randomIndex = Math.floor(Math.random() * enemySprites.length);
  const sprite = enemySprites[randomIndex];
  const [hp, speed] = enemyStats[randomIndex];
  return { sprite, hp, speed };
};
const getRandomBoss = () => {
  const randomIndex = Math.floor(Math.random() * bossSprites.length);
  const sprite = bossSprites[randomIndex];
  const [hp, speed] = bossStats[randomIndex]; // Get corresponding HP and speed for the random sprite
  return { sprite, hp, speed };
};

export const bossStyle = (bossFeature: Feature) => {
  const { sprite, hp } = bossFeature.get("bossData"); // Extract boss data (sprite, hp)
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
