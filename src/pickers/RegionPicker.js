import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, SelectInput, withModulesManager } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class RegionPicker extends Component {

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-location", "RegionPicker.selectThreshold", 10);
    }

    onSuggestionSelected = v => this.props.onChange(v, locationLabel(v));

    render() {
        const { intl, value, reset, regions,
            withLabel = true, label = null, withNull = false, nullLabel = null,
            preValues = [],
            withPlaceholder, placeholder = null,
            readOnly = false, required = false
        } = this.props;
        if (!value && regions.length < this.selectThreshold) {
            var options = [...preValues, ...regions].map(r => ({ value: r, label: locationLabel(r)}));
            if (withNull) {
                options.unshift({ value: null, label: nullLabel || formatMessage(intl, "location", "location.RegionPicker.null")})
            }
            return <SelectInput
                module={"location"}
                strLabel={!!withLabel && (label || formatMessage(intl, "location", "RegionPicker.label"))}
                options={options}
                value={value}
                onChange={this.onSuggestionSelected}
                readOnly={readOnly}
                required={required}
            />
        } else {
            return <AutoSuggestion
                items={regions}
                preValues={preValues}
                label={!!withLabel && (label || formatMessage(intl, "location", "RegionPicker.label"))}
                placeholder={!!withPlaceholder ? placeholder || formatMessage(intl, "location", "RegionPicker.placehoder") : null}
                lookup={locationLabel}
                renderSuggestion={a => <span>{locationLabel(a)}</span>}
                getSuggestionValue={locationLabel}
                onSuggestionSelected={this.onSuggestionSelected}
                value={value}
                reset={reset}
                readOnly={readOnly}
                required={required}
            />
        }
    }
}

const mapStateToProps = state => ({
    regions: state.loc.userL0s || [],
});

export default withModulesManager(connect(mapStateToProps)(injectIntl(withTheme(withStyles(styles)(RegionPicker)))));
