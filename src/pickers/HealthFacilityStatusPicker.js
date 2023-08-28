import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { HEALTH_FACILITY_STATUSES } from "../constants";

class HealthFacilityStatusPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="location"
        label="healthFacilityStatus"
        constants={ HEALTH_FACILITY_STATUSES }
        {...this.props}
      />
    );
  }
}

export default HealthFacilityStatusPicker;
