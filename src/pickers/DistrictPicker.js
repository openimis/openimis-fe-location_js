import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, SelectInput, AutoSuggestion } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class DistrictPicker extends Component {

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-location", "DistrictPicker.selectThreshold", 10);
    }

    onSuggestionSelected = v => this.props.onChange(v, locationLabel(v));

    render() {
        const { intl, value, reset,
            withLabel = true, label, withNull = false, nullLabel = null,
            region, districts,
            readOnly = false, required = false } = this.props;
        let items = districts || [];
        if (!!region) {
            items = items.filter(d => {
                return d.parent.uuid === region.uuid
            });
        }
        if (!value && items.length < this.selectThreshold) {
            var options = [...items.map(r => ({ value: r, label: locationLabel(r)}))];
            if (withNull) {
                options.unshift({ value: null, label: nullLabel || formatMessage(intl, "location", "location.DistrictPicker.null")})
            }
            return <SelectInput
                module={"location"}
                strLabel={!!withLabel && (label || formatMessage(intl, "location", "DistrictPicker.label"))}
                options={options}
                value={value}
                onChange={this.onSuggestionSelected}
                readOnly={readOnly}
                required={required}
            />
        } else {
            return (
                <AutoSuggestion
                    items={items}
                    label={!!withLabel && (label || formatMessage(intl, "location", "DistrictPicker.label"))}
                    lookup={locationLabel}
                    getSuggestionValue={locationLabel}
                    renderSuggestion={a => <span>{locationLabel(a)}</span>}
                    onSuggestionSelected={this.onSuggestionSelected}
                    value={value}
                    reset={reset}
                    readOnly={readOnly}
                    required = {required}
                />
            )
        }
    }
}

const mapStateToProps = state => ({
    districts: state.loc.userL1s,
});

export default withModulesManager(connect(mapStateToProps)(injectIntl(withTheme(withStyles(styles)(DistrictPicker)))));
