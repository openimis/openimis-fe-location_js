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

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            prevProps.filters['showHistory'] !== this.props.filters['showHistory'] &&
            !!this.props.filters['showHistory'] &&
            this.state.showHistory !== this.props.filters['showHistory']['value']
        ) {
            this.setState((sate, props) => ({ showHistory: props.filters['showHistory']['value'] }))
        }
    }

    debouncedOnChangeFilter = _debounce(
        this.props.onChangeFilters,
        this.props.modulesManager.getConf("fe-location", "debounceTime", 800)
    )

    _regionFilter = v => {
        return {
            id: 'region',
            value: v,
            filter: !!v ? `location_Parent_Uuid: "${v.uuid}"` : null
        }
    }

    _districtFilter = v => {
        return {
            id: 'district',
            value: v,
            filter: !!v ? `location_Uuid: "${v.uuid}"` : null
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
        this.setState((state) => ({
            reset: state.reset + 1,
        }));
    }

    _onChangeDistrict = (v, s) => {
        let filters = [
            this._districtFilter(v),
        ];
        if (!!v) {
            filters.push(this._regionFilter(v.parent))
        }
        this.props.onChangeFilters(filters);
        this.setState((state) => ({
            reset: state.reset + 1,
        }));
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
        this.setState((state) => ({
            showHistory: !state.showHistory,
            reset: state.reset + 1,
        }));
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
        this.setState((state) => ({
            reset: state.reset + 1,
        }));
    }

    render() {
        const { intl, classes, filters } = this.props;
        return (
            <Grid container className={classes.form}>

                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="location.RegionPicker"
                        value={(filters['region'] && filters['region']['value'])}
                        reset={this.state.reset}
                        withNull={true}
                        onChange={this._onChangeRegion}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="location.DistrictPicker"
                        value={(filters['district'] && filters['district']['value'])}
                        region={(filters['region'] && filters['region']['value'])}
                        reset={this.state.reset}
                        withNull={true}
                        onChange={this._onChangeDistrict}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="location.HealthFacilityLegalFormPicker"
                        value={(filters['legalForm_Code'] && filters['legalForm_Code']['value'])}
                        onChange={(v, s) => this._onChange('legalForm_Code', v, s)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="location.HealthFacilityLevelPicker"
                        value={(filters['level'] && filters['level']['value'])}
                        onChange={(v, s) => this._onChange('level', v, s)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="medical.CareTypePicker"
                        value={(filters['careType'] && filters['careType']['value'])}
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
                                filter: !!v ? `code_Icontains: "${v}"` : null
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
                                filter: !!v ? `name_Icontains: "${v}"` : null
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
                                filter: !!v ? `phone_Icontains: "${v}"` : null
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
                                filter: !!v ? `fax_Icontains: "${v}"` : null
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
                                filter: !!v ? `email_Icontains: "${v}"` : null
                            }
                        ])}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(HealthFacilityFilter))));