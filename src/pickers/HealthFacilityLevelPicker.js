import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { HEALTH_FACILITY_LEVELS } from "../constants";

class HealthFacilityLevelPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="location"
        label="healthFacilityLevel"
        constants={HEALTH_FACILITY_LEVELS}
        {...this.props}
      />
    );
  }
}

export default HealthFacilityLevelPicker;
