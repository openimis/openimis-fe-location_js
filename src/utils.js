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
