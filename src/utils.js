export function healthFacilityLabel(hf) {
  if (!hf || (!hf.code && !hf.name)) return "";
  return `${hf.code || ""} ${hf.name || ""}`.trim();
}

export function buildParentLocationFilters(location, anchor = "parentLocation", locationTypesCount = 4) {
  const lineage = [];
  let current = location;
  while (current) {
    lineage.unshift(current);
    current = current.parent || null;
  }

  const level = location ? lineage.length - 1 : null;
  const filters = [
    {
      id: anchor,
      value: location || null,
      filter: location ? `${anchor}: "${location.uuid}", ${anchor}Level: ${level}` : null,
    },
  ];

  for (let i = 0; i < locationTypesCount; i++) {
    filters.push({
      id: `${anchor}_${i}`,
      value: lineage[i] || null,
      filter: "",
    });
  }

  return filters;
};

export function locationLabel(l) {
  if (!l || (!l.code && !l.name)) return "";
  return `${l.code || ""} ${l.name || ""}`.trim();
}

export function getLocationLevel(location) {
  if (!location) return -1;
  let level = 0;
  let current = location.parent;
  while (current) {
    level += 1;
    current = current.parent || null;
  }
  return level;
}

export function buildSelectedLocation(path) {
  if (!path?.length) return null;
  const nodes = path.map((item) => ({ ...item, parent: null }));
  for (let i = 1; i < nodes.length; i++) {
    nodes[i].parent = nodes[i - 1];
  }
  return nodes[nodes.length - 1];
}

export function locationPathFromValue(location) {
  const path = [];
  let current = location;
  while (current) {
    path.unshift(current);
    current = current.parent || null;
  }
  return path;
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
