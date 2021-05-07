import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    ControlledField, PublishedComponent, FormPanel,
    TextInput, TextAreaInput,
    withModulesManager,
} from "@openimis/fe-core";
import { Grid } from "@material-ui/core";

const styles = theme => ({
    item: theme.paper.item,
});

class HealthFacilityMasterPanel extends FormPanel {

    constructor(props) {
        super(props);
        this.codeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.codeMaxLength", 8);
        this.accCodeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMaxLength", 25);
        this.accCodeMandatory = props.modulesManager.getConf("fe-location", "healthFacilityForm.accCodeMandatory", true);
    }

    updateRegion = region => {
        this.updateAttributes({
            parentLocation: region,
            location: null,
            servicesPricelist: null,
            itemsPricelist: null,
        });
    }

    updateDistrict = district => {
        this.updateAttributes({
            parentLocation: !!district ? district.parent : null,
            location: district,
            servicesPricelist: null,
            itemsPricelist: null
        })
    }

    render() {
        const { classes, edited, reset, readOnly = false } = this.props;
        return (
            <Grid container>
                <ControlledField module="location" id="HealthFacility.region" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="location.RegionPicker"
                            value={edited.parentLocation}
                            withNull={true}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateRegion(v)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.district" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="location.DistrictPicker"
                            value={edited.location}
                            readOnly={readOnly}
                            region={this.state.parentLocation}
                            required={true}
                            onChange={(v, s) => this.updateDistrict(v)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.legalForm" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="location.HealthFacilityLegalFormPicker"
                            value={!!edited.legalForm ? edited.legalForm.code : null}
                            nullLabel="empty"
                            reset={reset}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute('legalForm', !!v ? { code: v } : null)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.level" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="location.HealthFacilityLevelPicker"
                            value={edited.level}
                            nullLabel="empty"
                            reset={reset}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("level", v)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.subLevel" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="location.HealthFacilitySubLevelPicker"
                            value={!!edited.subLevel ? edited.subLevel.code : null}
                            nullLabel="empty"
                            reset={reset}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("subLevel", !!v ? { code: v } : null)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.careType" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="medical.CareTypePicker"
                            value={edited.careType}
                            nullLabel="empty"
                            reset={reset}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("careType", v)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.code" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityForm.code"
                            name="code"
                            value={edited.code}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("code", v)}
                            inputProps={{
                                "maxLength": this.codeMaxLength,
                            }}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.accCode" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityForm.accCode"
                            name="accCode"
                            value={edited.accCode}
                            readOnly={readOnly}
                            required={this.accCodeMandatory}
                            onChange={(v, s) => this.updateAttribute("accCode", v)}
                            inputProps={{
                                "maxLength": this.accCodeMaxLength,
                            }}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.name" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityForm.name"
                            name="name"
                            value={edited.name}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("name", v)}
                        />
                    </Grid>
                } />
                <Grid item xs={2} className={classes.item}>
                    <TextAreaInput
                        module="location" label="HealthFacilityForm.address"
                        value={edited.address}
                        rows="2"
                        readOnly={readOnly}
                        onChange={(v, s) => this.updateAttribute("address", v)}
                    />
                </Grid>
                <ControlledField module="location" id="HealthFacility.phone" field={
                    <Grid item xs={1} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityForm.phone"
                            name="phone"
                            value={edited.phone}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("phone", v)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.fax" field={
                    <Grid item xs={1} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityForm.fax"
                            name="fax"
                            value={edited.fax}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("fax", v)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.email" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityForm.email"
                            name="email"
                            value={edited.email}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("email", v)}
                        />
                    </Grid>
                } />
            </Grid>
        )
    }
}

export default withModulesManager(withTheme(withStyles(styles)(HealthFacilityMasterPanel)))

