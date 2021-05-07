import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { FormPanel, PublishedComponent, ControlledField } from "@openimis/fe-core";
import { Paper, Grid } from "@material-ui/core";

const styles = theme => ({
    item: theme.paper.item,
    paper: theme.paper.paper,
});

class HealthFacilityPriceListsPanel extends FormPanel {

    render() {
        const { classes, edited, readOnly } = this.props;
        return (
            <Paper className={classes.paper}>
                <Grid container>
                    <ControlledField module="location" id="HealthFacility.servicesPricelist" field={
                        <Grid item xs={6} className={classes.item}>
                            <PublishedComponent
                                pubRef="medical_pricelist.ServicesPriceListPicker"
                                value={edited.servicesPricelist}
                                nullLabel="empty"
                                readOnly={readOnly}
                                required={true}
                                region={edited.parentLocation}
                                district={edited.location}
                                onChange={v => this.updateAttribute("servicesPricelist", v)}
                            />
                        </Grid>
                    } />
                    <ControlledField module="location" id="HealthFacility.itemsPricelist" field={
                        <Grid item xs={6} className={classes.item}>
                            <PublishedComponent
                                pubRef="medical_pricelist.ItemsPriceListPicker"
                                value={edited.itemsPricelist}
                                nullLabel="empty"
                                readOnly={readOnly}
                                required={true}
                                region={edited.parentLocation}
                                district={edited.location}
                                onChange={v => this.updateAttribute("itemsPricelist", v)}
                            />
                        </Grid>
                    } />
                </Grid>
            </Paper>
        )
    }
}

export default withTheme(withStyles(styles)(HealthFacilityPriceListsPanel));