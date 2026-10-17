/**
 * Project locations where DreamCatchers Studio has completed work
 * Coordinates are in [latitude, longitude, name] format
 */

export interface ProjectLocation {
  name: string;
  lat: number;
  lng: number;
  size?: number; // Optional: customize marker size
}

export const projectLocations: ProjectLocation[] = [
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, size: 0.4 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462, size: 0.35 },
  { name: "Himachal Pradesh", lat: 31.7433, lng: 77.1205, size: 0.35 },
  { name: "North East India", lat: 28.5921, lng: 92.9029, size: 0.4 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, size: 0.4 },
  { name: "Japan", lat: 36.2048, lng: 138.2529, size: 0.35 },
  { name: "China", lat: 35.8617, lng: 104.1954, size: 0.35 },
];

/**
 * Convert latitude/longitude to 3D coordinates on a unit sphere
 */
export function latLngToCartesian(
  lat: number,
  lng: number,
  radius: number = 1
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}
