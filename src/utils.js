export function healthFacilityLabel(hf) {
  if (!hf || (!hf.code && !hf.name)) return "";
  return `${hf.code || ""} ${hf.name || ""}`.trim();
}

export function locationLabel(l) {
  if (!l || (!l.code && !l.name)) return "";
  return `${l.code || ""} ${l.name || ""}`.trim();
}

export const LOCATION_SUMMARY_PROJECTION = ["id", "uuid", "code", "name", "type"];

export const nestParentsProjections = (i) => {
  return `parent{${LOCATION_SUMMARY_PROJECTION}${i === 0 ? "" : "," + nestParentsProjections(i - 1)}}`;
};
