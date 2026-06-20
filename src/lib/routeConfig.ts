// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Tune route {x,y} values with ?debug=1 — select "Ruta" in the calibrator.

export type RoutePoint = {
  id: number;
  x: number;
  y: number;
};

export const ROUTE_POINT_COUNT = 8;

/** Initial guess along the dirt path — calibrate in debug mode. */
const ROUTE_SEED: Array<{ x: number; y: number }> = [
  { x: 720, y: 480 },
  { x: 640, y: 505 },
  { x: 540, y: 515 },
  { x: 440, y: 508 },
  { x: 340, y: 492 },
  { x: 250, y: 468 },
  { x: 170, y: 438 },
  { x: 120, y: 400 },
];

export const ROUTE_POINTS: RoutePoint[] = ROUTE_SEED.map((point, id) => ({
  id,
  ...point,
}));
