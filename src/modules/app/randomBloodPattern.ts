import { MultiPolygon, Polygon } from "ol/geom";

export const generateRandomBloodShape = (x: number, y: number) => {
  const numBlobs = Math.floor(Math.random() * 7) + 4;

  const blobs = Array.from({ length: numBlobs }, () => {
    const numVertices = Math.floor(Math.random() * 7) + 12;
    const blobPoints: [number, number][] = [];

    for (let i = 0; i < numVertices; i++) {
      const baseAngle = (i / numVertices) * 13 * Math.PI;
      const angle = baseAngle + (Math.random() - 0.5) * 2.5;

      const vertexRadius = 0.0012 + Math.random() * 0.003;

      const dx = vertexRadius * Math.cos(angle);
      const dy = vertexRadius * Math.sin(angle);
      blobPoints.push([x + dx, y + dy]);
    }
    blobPoints.push(blobPoints[0]);

    return new Polygon([blobPoints]);
  });

  return new MultiPolygon(blobs.map((blob) => blob.getCoordinates()));
};
