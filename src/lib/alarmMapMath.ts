import type { Position } from "./types";

export function worldToImagePoint(
  origin: Position,
  worldWidth: number,
  worldHeight: number,
  imageWidth: number,
  imageHeight: number,
): [number, number] {
  const imageX = (origin.x / worldWidth) * imageWidth;
  const imageY = (origin.y / worldHeight) * imageHeight;

  return [imageY, imageX];
}

export function imagePointToWorld(
  point: [number, number],
  worldWidth: number,
  worldHeight: number,
  imageWidth: number,
  imageHeight: number,
): Position {
  const imageY = point[0];
  const imageX = point[1];

  const worldX = (imageX / imageWidth) * worldWidth;
  const worldY = (imageY / imageHeight) * worldHeight;

  return {
    x: worldX,
    y: worldY,
  };
}

export function worldRadiusToImagePixels(
  radius: number,
  worldWidth: number,
  imageWidth: number,
): number {
  return (radius / worldWidth) * imageWidth;
}
