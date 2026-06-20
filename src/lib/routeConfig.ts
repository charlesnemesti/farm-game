// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Route coordinates are in farm-scene.png design space (1024×571) — same on every screen.

export type RoutePoint = {
  id: number;
  x: number;
  y: number;
};

export const ROUTE_POINT_COUNT = 8;

/** Farmer patrol waypoints along the dirt path. */
export const ROUTE_POINTS: RoutePoint[] = [
  { id: 0, x: 835, y: 511 },
  { id: 1, x: 731, y: 512 },
  { id: 2, x: 627, y: 510 },
  { id: 3, x: 534, y: 508 },
  { id: 4, x: 450, y: 509 },
  { id: 5, x: 364, y: 511 },
  { id: 6, x: 277, y: 510 },
  { id: 7, x: 225, y: 509 },
];
