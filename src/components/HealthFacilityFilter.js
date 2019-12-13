import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import _ from "lodash";
import _debounce from "lodash/debounce";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import {
    withModulesManager, formatMessage,
    TextInput, PublishedComponent
} from "@openimis/fe-core";

const styles = theme => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    },
    paperDivider: theme.paper.divider,
});

class HealthFacilityFilter extends Component {
    state = {
        reset: 0,
        showHistory: false,
    }

    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilters,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    _regionFilter = v => {
        return {
            id: 'region',
            value: v,
            filter: `location_Parent_Uuid: "${!!v && v.uuid}"`
        }
    }

    _districtFilter = v => {
        return {
            id: 'district',
            value: v,
            filter: `location_Uuid: "${!!v && v.uuid}"`
        }
    }

    _onChangeRegion = (v, s) => {
        this.props.onChangeFilters([
            this._regionFilter(v),
            {
                id: 'district',
                value: null
            },
        ]);
        this.setState({
            reset: this.state.reset + 1,
        });
    }

    _onChangeDistrict = (v, s) => {
        let filters = [
            this._districtFilter(v),
        ];
        if (!!v) {
            filters.push(
                this._regionFilter({
                    id: v.regionId,
                    uuid: v.regionUuid,
                    code: v.regionCode,
                    name: v.regionName
                }))
        }
        this.props.onChangeFilters(filters);
        this.setState({
            reset: this.state.reset + 1,
        });
    }

    _onChangeLegalForm = (v, s) => {
        let filters = [
            {
                id: 'legalForm',
                value: v,
                filter: `legalForm_Code: "${!!v && v.code}"`
            }
        ];
        this.props.onChangeFilters(filters);
        this.setState({
            reset: this.state.reset + 1,
        });
    }

    _onChangeShowHistory = () => {
        let filters = [
            {
                id: 'showHistory',
                value: !this.state.showHistory,
                filter: `showHistory: ${!this.state.showHistory}`
            }
        ];
        this.props.onChangeFilters(filters);
        this.setState({
            showHistory: !this.state.showHistory,
            reset: this.state.reset + 1,
        });
    }

    _onChange = (k, v, s) => {
        let filters = [
            {
                id: k,
                value: v,
                filter: `${k}: "${v}"`
            }
        ];
        this.props.onChangeFilters(filters);
        this.setState({
            reset: this.state.reset + 1,
        });
    }

    render() {
        const { intl, classes, filters } = this.props;
        return (
            <Grid container className={classes.form}>

                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        id="location.RegionPicker"
                        value={(filters['region'] && filters['region']['value'])}
                        onChange={this._onChangeRegion}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        id="location.DistrictPicker"
                        value={(filters['district'] && filters['district']['value'])}
                        region={(filters['region'] && filters['region']['value'])}
                        reset={this.state.reset}
                        onChange={this._onChangeDistrict}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        id="location.HealthFacilityLegalFormPicker"
                        value={this.state.legalForm}
                        onChange={(v, s) => this._onChange('legalForm_Code', v, s)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        id="location.HealthFacilityLevelPicker"
                        value={this.state.healthFacilityLevel}
                        onChange={(v, s) => this._onChange('level', v, s)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        id="medical.CareTypePicker"
                        value={this.state.careType}
                        onChange={(v, s) => this._onChange('careType', v, s)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={this.state.showHistory}
                                onChange={e => this._onChangeShowHistory()}
                            />
                        }
                        label={formatMessage(intl, "location", "HealthFacilityFilter.showHistory")}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="location" label="HealthFacilityFilter.code"
                        name="code"
                        value={(filters['clode'] && filters['code']['value'])}
                        onChange={v => this.debouncedOnChangeFilter([
                            {
                                id: 'code',
                                value: v,
                                filter: `code_Icontains: "${v}"`
                            }
                        ])}
                    />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                    <TextInput
                        module="location" label="HealthFacilityFilter.name"
                        name="name"
                        value={(filters['name'] && filters['name']['value'])}
                        onChange={v => this.debouncedOnChangeFilter([
                            {
                                id: 'name',
                                value: v,
                                filter: `name_Icontains: "${v}"`
                            }
                        ])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="location" label="HealthFacilityFilter.phone"
                        name="phone"
                        value={(filters['phone'] && filters['phone']['value'])}
                        onChange={v => this.debouncedOnChangeFilter([
                            {
                                id: 'phone',
                                value: v,
                                filter: `phone_Icontains: "${v}"`
                            }
                        ])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="location" label="HealthFacilityFilter.fax"
                        name="fax"
                        value={(filters['fax'] && filters['fax']['value'])}
                        onChange={v => this.debouncedOnChangeFilter([
                            {
                                id: 'fax',
                                value: v,
                                filter: `fax_Icontains: "${v}"`
                            }
                        ])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="location" label="HealthFacilityFilter.email"
                        name="email"
                        value={(filters['email'] && filters['email']['value'])}
                        onChange={v => this.debouncedOnChangeFilter([
                            {
                                id: 'email',
                                value: v,
                                filter: `email_Icontains: "${v}"`
                            }
                        ])}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(HealthFacilityFilter))));