import { Feature } from "ol";
import { Point } from "ol/geom";

// Function to create the HP number display for the boss
export const createHPDisplay = (enemyFeature: Feature, map: any) => {
  // Get the enemy's coordinates (for boss)
  const enemyCoords = (enemyFeature.getGeometry() as Point).getCoordinates();

  // Convert map coordinates to screen pixel coordinates
  const pixelCoords = map.getPixelFromCoordinate(enemyCoords);

  // Create the HP number display element
  const hpDisplay = document.createElement("div");
  hpDisplay.style.position = "absolute";
  hpDisplay.style.fontSize = "14px"; // Set font size
  hpDisplay.style.color = "white"; // Set font color (you can adjust it)
  hpDisplay.style.fontWeight = "bold"; // Set font weight (optional)
  hpDisplay.style.top = `${pixelCoords[1] - 20}px`; // Position the text slightly above the boss
  hpDisplay.style.left = `${pixelCoords[0] - 25}px`; // Position it near the boss
  hpDisplay.textContent = "HP: 5000"; // Default HP text

  document.body.appendChild(hpDisplay);

  return hpDisplay;
};

// Function to update the HP number display
export const updateHPDisplay = (
  hpDisplay: any,
  maxHP: number,
  currentHP: number,
) => {
  // Update the text content to show the current HP as a number
  hpDisplay.textContent = `HP: ${currentHP}`;

  // You can also change the color of the HP number based on health
  const healthPercentage = currentHP / maxHP;
  if (healthPercentage > 0.5) {
    hpDisplay.style.color = "green"; // Green for healthy
  } else if (healthPercentage > 0.2) {
    hpDisplay.style.color = "orange"; // Orange for medium health
  } else {
    hpDisplay.style.color = "red"; // Red for low health
  }
};
