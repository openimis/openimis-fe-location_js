import React, { Component, Fragment } from "react";
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

    state = {
        parentLocation: null,
    }

    constructor(props) {
        super(props);
        this.codeMaxLength = props.modulesManager.getConf("fe-location", "healthFacilityForm.codeMaxLength", 8);
    }

    formatDistrict = district => {
        let d = { ...district };
        d.parent = {
            id: d.regiondId,
            uuid: d.regionUuid,
            code: d.regionCode,
            name: d.regionName
        };
        delete d.regionId;
        delete d.regionUuid;
        delete d.regionCode;
        delete d.regionName;
        return d;
    }


    updateDistrict = district => {
        if (!district) {
            this.updateAttribute('location', null);
            return;
        }
        let d = this.formatDistrict(district)
        this.setState(
            { parentLocation: d.parent },
            e => this.updateAttribute('location', d)
        )
    }

    componentDidMount() {
        if (!!this.props.edited && !!this.props.edited.location) {
            this.setState({ parentLocation: this.props.edited.location.parent })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this._componentDidUpdate(prevProps, prevState, snapshot)) return;
        if ((!this.state.parentLocation && !!this.props.edited && !!this.props.edited.location) ||
            (!!this.state.parentLocation &&
                !!this.props.edited && this.props.edited.location &&
                ((!this.props.edited || !this.props.edited.location) ||
                    this.state.parentLocation.id !== this.props.edited.location.parent.id))
        ) {
            this.setState({ parentLocation: this.props.edited.location.parent })
        }
    }

    render() {
        const { classes, edited, reset, readOnly = false } = this.props;
        return (
            <Grid container>
                <ControlledField module="location" id="HealthFacility.region" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            id="location.RegionPicker"
                            value={this.state.parentLocation}
                            readOnly={readOnly}
                            onChange={(v, s) => this.setState(
                                { parentLocation: v },
                                e => this.updateDistrict(null))}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.district" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            id="location.DistrictPicker"
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
                            id="location.HealthFacilityLegalFormPicker"
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
                            id="location.HealthFacilityLevelPicker"
                            value={edited.level}
                            nullLabel="empty"
                            reset={reset}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("level", v, s)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.subLevel" field={
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            id="location.HealthFacilitySubLevelPicker"
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
                            id="medical.CareTypePicker"
                            value={edited.careType}
                            nullLabel="empty"
                            reset={reset}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("careType", v, s)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.code" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityFilter.code"
                            name="code"
                            value={edited.code}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("code", v, s)}
                            inputProps={{
                                "maxLength": this.codeMaxLength,
                            }}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.name" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityFilter.name"
                            name="name"
                            value={edited.name}
                            readOnly={readOnly}
                            required={true}
                            onChange={(v, s) => this.updateAttribute("name", v, s)}
                        />
                    </Grid>
                } />
                <Grid item xs={2} className={classes.item}>
                    <TextAreaInput
                        module="location" label="HealthFacilityFilter.address"
                        value={edited.address}
                        rows="2"
                        readOnly={readOnly}
                        onChange={(v, s) => this.updateAttribute("address", v, s)}
                    />
                </Grid>
                <ControlledField module="location" id="HealthFacility.phone" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityFilter.phone"
                            name="phone"
                            value={edited.phone}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("phone", v, s)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.fax" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityFilter.fax"
                            name="fax"
                            value={edited.fax}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("fax", v, s)}
                        />
                    </Grid>
                } />
                <ControlledField module="location" id="HealthFacility.email" field={
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="location" label="HealthFacilityFilter.email"
                            name="email"
                            value={edited.email}
                            readOnly={readOnly}
                            onChange={(v, s) => this.updateAttribute("email", v, s)}
                        />
                    </Grid>
                } />
            </Grid>
        )
    }
}

export default withModulesManager(withTheme(withStyles(styles)(HealthFacilityMasterPanel)))

