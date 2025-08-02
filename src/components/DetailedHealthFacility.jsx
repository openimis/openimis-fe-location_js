import React, { useState, useEffect } from "react";
import _ from "lodash";

import { Grid, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import { withModulesManager, ControlledField, PublishedComponent } from "@openimis/fe-core";
import FSPCoarseLocation from "./FSPCoarseLocation";

const StyledDetailedHealthFacility = styled('div')(({ theme }) => ({
  '& .form': {
    padding: 0,
  },
  '& .item': {
    padding: theme.spacing(1),
  },
}));

const DetailedHealthFacility = (props) => {
  const { onChange, value, required, readOnly = true } = props;
  const [district, setDistrict] = useState(value?.location);
  const [level, setLevel] = useState(value?.level);

  useEffect(() => {
    setDistrict(value?.location);
    setLevel(value?.level);
  }, [value]);

  return (
    <StyledDetailedHealthFacility>
      <Grid container className="form">
        <Box flexGrow={2}>
          <FSPCoarseLocation region={district?.parent} district={district} readOnly={readOnly} onChange={setDistrict} />
        </Box>
        <ControlledField
          module="location"
          id="DetailedHealthFacility.Level"
          field={
            <Box flexGrow={1} className="item">
              <PublishedComponent
                pubRef="location.HealthFacilityLevelPicker"
                value={level}
                readOnly={readOnly}
                withNull={false}
                onChange={setLevel}
              />
            </Box>
          }
        />
        <ControlledField
          module="location"
          id="DetailedHealthFacility.HF"
          field={
            <Box flexGrow={2} className="item">
              <PublishedComponent
                pubRef="location.HealthFacilityPicker"
                district={district}
                level={level}
                value={value}
                required={required}
                readOnly={readOnly}
                withNull
                onChange={onChange}
              />
            </Box>
          }
        />
      </Grid>
    </StyledDetailedHealthFacility>
  );
};

export default withModulesManager(DetailedHealthFacility);
