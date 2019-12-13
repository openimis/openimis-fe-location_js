import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { HEALTH_FACILITY_SUB_LEVELS } from "../constants";

class HealthFacilitySubLevelPicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="location"
            label="healthFacilitySubLevel"
            constants={HEALTH_FACILITY_SUB_LEVELS}
            {...this.props}
        />
    }
}

export default HealthFacilitySubLevelPicker;