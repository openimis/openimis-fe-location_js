import React from "react";
import { styled } from "@mui/material/styles";
import { FormPanel, PublishedComponent, ControlledField } from "@openimis/fe-core";
import { Paper, Grid } from "@mui/material";

const StyledHealthFacilityPriceListsPanel = styled('div')(({ theme }) => ({
  '& .item': theme.paper.item,
  '& .paper': theme.paper.paper,
}));

class HealthFacilityPriceListsPanel extends FormPanel {
  render() {
    const { edited, readOnly } = this.props;
    return (
      <StyledHealthFacilityPriceListsPanel>
        <Paper className="paper">
          <Grid container>
            <ControlledField
              module="location"
              id="HealthFacility.servicesPricelist"
              field={
                <Grid item xs={6} className="item">
                  <PublishedComponent
                    pubRef="medical_pricelist.ServicesPriceListPicker"
                    value={edited.servicesPricelist}
                    nullLabel="empty"
                    readOnly={readOnly}
                    required={true}
                    region={edited.parentLocation}
                    district={edited.location}
                    onChange={(v) => this.updateAttribute("servicesPricelist", v)}
                  />
                </Grid>
              }
            />
            <ControlledField
              module="location"
              id="HealthFacility.itemsPricelist"
              field={
                <Grid item xs={6} className="item">
                  <PublishedComponent
                    pubRef="medical_pricelist.ItemsPriceListPicker"
                    value={edited.itemsPricelist}
                    nullLabel="empty"
                    readOnly={readOnly}
                    required={true}
                    region={edited.parentLocation}
                    district={edited.location}
                    onChange={(v) => this.updateAttribute("itemsPricelist", v)}
                  />
                </Grid>
              }
            />
          </Grid>
        </Paper>
      </StyledHealthFacilityPriceListsPanel>
    );
  }
}

export default HealthFacilityPriceListsPanel;
