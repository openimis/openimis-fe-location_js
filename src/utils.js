export function healthFacilityLabel(hf) {
  return !!hf ? `${hf.code} ${hf.name}` : "";
}

export function locationLabel(l) {
  return !!l ? `${l.code} ${l.name}` : "";
}

export const LOCATION_SUMMARY_PROJECTION = ["id", "uuid", "code", "name", "type"];

export const nestParentsProjections = (i) => {
  return `parent{${LOCATION_SUMMARY_PROJECTION}${i === 0 ? "" : "," + nestParentsProjections(i - 1)}}`;
};

export const LOCATION_MAX_LEVELS_KEY = "location.Location.MaxLevels";
export const DEFAULT_LOCATION_MAX_LEVELS = 4;

// Accepts a positive integer, as a number or a numeric string; anything else is null.
export const parseLocationMaxLevels = (value) => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const levels = Number(value);
  return Number.isInteger(levels) && levels > 0 ? levels : null;
};

// Number of location levels: the fe-location module configuration key, then the ref, then 4.
export const getLocationMaxLevels = (modulesManager) =>
  parseLocationMaxLevels(modulesManager.getConf("fe-location", LOCATION_MAX_LEVELS_KEY)) ??
  parseLocationMaxLevels(modulesManager.getRef(LOCATION_MAX_LEVELS_KEY)) ??
  DEFAULT_LOCATION_MAX_LEVELS;

export const locationFlatProjection = (levels) =>
  levels > 1
    ? [...LOCATION_SUMMARY_PROJECTION, nestParentsProjections(levels - 2)]
    : [...LOCATION_SUMMARY_PROJECTION];
