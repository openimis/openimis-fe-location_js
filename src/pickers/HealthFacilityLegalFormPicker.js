import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { HEALTH_FACILITY_LEGAL_FORMS } from "../constants";

class HealthFacilityLegalFormPicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="location"
            label="healthFacilityLegalForm"
            constants={HEALTH_FACILITY_LEGAL_FORMS}
            {...this.props}
        />
    }
}

export default HealthFacilityLegalFormPicker;