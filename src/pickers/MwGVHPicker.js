import React from "react";
import LocationPicker from "./LocationPicker";

// Malawi location hierarchy is 0-indexed over the types [R, D, W, V]:
//   District = R = level 0, TA = D = level 1, GVH = W = level 2, Village = V = level 3.
// This wrapper pins the level so callers cannot pass the wrong one (the R/D/W/V
// letters and the 0-index invite off-by-one mistakes). The field label comes from
// Location2Picker.label, which the CoreMIS language pack overrides to "GVH".
// Pass `parentLocation` (the selected parent) to cascade; forward any other
// LocationPicker prop as usual. Do not pass `locationLevel` — it is fixed here.
const MwGVHPicker = (props) => <LocationPicker {...props} locationLevel={2} />;

export default MwGVHPicker;
