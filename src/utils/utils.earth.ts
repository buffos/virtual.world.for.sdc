// code from https://stackoverflow.com/questions/238260/how-to-calculate-the-bounding-box-for-a-given-lat-lng-location

interface BoundingBox {
  latMax: number;
  latMin: number;
  lonMax: number;
  lonMin: number;
}

/**
 * Calculates the Earth radius at a given latitude using the WGS84 ellipsoid model.
 *
 * @param lat - The latitude in degrees.
 * @returns The Earth radius in meters.
 */
export function WGS84EarthRadius(lat: number): number {
  //  http://en.wikipedia.org/wiki/Earth_radius
  const An = WGS84_a * WGS84_a * Math.cos(lat);
  const Bn = WGS84_b * WGS84_b * Math.sin(lat);
  const Ad = WGS84_a * Math.cos(lat);
  const Bd = WGS84_b * Math.sin(lat);
  return Math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd));
}

/**
 * Calculates the bounding box coordinates based on the given latitude, longitude, and half side length.
 * assuming local approximation of Earth surface as a sphere of radius given by WGS84
 * @param latitudeInDegrees - The latitude in degrees.
 * @param longitudeInDegrees - The longitude in degrees.
 * @param halfSideInKm - The half side length in kilometers.
 * @returns The bounding box coordinates.
 */
export function boundingBox(latitudeInDegrees: number, longitudeInDegrees: number, halfSideInKm: number): BoundingBox {
  const lat = deg2rad(latitudeInDegrees);
  const lon = deg2rad(longitudeInDegrees);
  const halfSide = 1000 * halfSideInKm;

  // Radius of Earth at given latitude
  const radius = WGS84EarthRadius(lat);
  // Radius of the parallel at given latitude
  const pradius = radius * Math.cos(lat);

  const boundingBox: BoundingBox = {
    latMin: rad2deg(lat - halfSide / radius),
    lonMin: rad2deg(lon - halfSide / pradius),
    latMax: rad2deg(lat + halfSide / radius),
    lonMax: rad2deg(lon + halfSide / pradius),
  };

  return boundingBox;
}

/**
 * Converts degrees to radians.
 * @param degrees The angle in degrees.
 * @returns The angle in radians.
 */
export function deg2rad(degrees: number): number {
  return (Math.PI * degrees) / 180.0;
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param lat1 - The latitude of the first point.
 * @param lon1 - The longitude of the first point.
 * @param lat2 - The latitude of the second point.
 * @param lon2 - The longitude of the second point.
 * @param scale - The scale factor to apply to the result (default is 1).
 * @returns The distance between the two points in meters.
 */
export function measureEarthPoints(lat1: number, lon1: number, lat2: number, lon2: number, scale: number = 1): number {
  // https://en.wikipedia.org/wiki/Haversine_formula
  const R = WGS84EarthRadius(lat1);
  const dLat = deg2rad(lat2) - deg2rad(lat1);
  const dLon = deg2rad(lon2) - deg2rad(lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * scale; // meters
}

/**
 * Converts radians to degrees.
 * @param radians The value in radians to be converted.
 * @returns The value in degrees.
 */
export function rad2deg(radians: number): number {
  return (180.0 * radians) / Math.PI;
}

// Semi-axes of WGS-84 geoidal reference
const WGS84_a = 6378137.0; //  Major semiaxis [m]
const WGS84_b = 6356752.3; //  Minor semiaxis [m]

interface Point {
  x: number;
  y: number;
}

export function latLonToXY(lat: number, lon: number): Point {
  const latRad = deg2rad(lat);
  const lonRad = deg2rad(lon);
  const x = WGS84_a * lonRad * Math.cos(latRad);
  const y = WGS84_a * latRad;
  return { x, y };
}

export function latLonToScreenXY(lat: number, long: number, bb: BoundingBox, scale: number): Point {
  const topLeft = latLonToXY(bb.latMin, bb.lonMax);
  const bottomRight = latLonToXY(bb.latMax, bb.lonMin);
  const actualSizeInMeters = measureEarthPoints(bb.latMin, bb.lonMax, bb.latMax, bb.lonMin);
  const width = bottomRight.x - topLeft.x;
  const height = bottomRight.y - topLeft.y;
  return {
    x: ((latLonToXY(lat, long).x - topLeft.x) / width) * (scale * actualSizeInMeters),
    y: ((latLonToXY(lat, long).y - topLeft.y) / height) * (scale * actualSizeInMeters),
  };
}
