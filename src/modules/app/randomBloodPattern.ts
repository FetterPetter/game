import { MultiPolygon, Polygon } from "ol/geom";
import { Feature } from "ol";
import { bloodSource } from "./addGameCharacter";

export const generateRandomBloodShape = (x: number, y: number) => {
  const numBlobs = Math.floor(Math.random() * 4) + 4;

  const blobs = Array.from({ length: numBlobs }, () => {
    const numVertices = Math.floor(Math.random() * 3) + 3;
    const blobPoints: [number, number][] = [];

    for (let i = 0; i < numVertices; i++) {
      const baseAngle = (i / numVertices) * 3 * Math.PI;
      const angle = baseAngle + (Math.random() - 0.5) * 2.5;

      const vertexRadius = 0.0014 + Math.random() * 0.0033;

      const dx = vertexRadius * Math.cos(angle);
      const dy = vertexRadius * Math.sin(angle);
      blobPoints.push([x + dx, y + dy]);
    }
    blobPoints.push(blobPoints[0]);

    return new Polygon([blobPoints]);
  });

  return new MultiPolygon(blobs.map((blob) => blob.getCoordinates()));
};
export const dropBlood = (x: number, y: number) => {
  const bloodFeature = new Feature({
    geometry: generateRandomBloodShape(x, y),
  });
  bloodSource.addFeature(bloodFeature);
  setTimeout(() => {
    bloodSource.removeFeature(bloodFeature);
  }, 2500);
};
