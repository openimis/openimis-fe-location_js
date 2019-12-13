import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, AutoSuggestion } from "@openimis/fe-core";
import _debounce from "lodash/debounce";
import { locationLabel } from "../utils";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    }
});

class DistrictPicker extends Component {

    onSuggestionSelected = v => this.props.onChange(v, locationLabel(v));

    render() {
        const { intl, value, reset, withLabel = true, label, region, districts,
            readOnly = false, required = false } = this.props;
        let items = districts || [];
        if (!!region) {
            items = items.filter(d => {
                return d.regionUuid === region.uuid
            });
        }
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

const mapStateToProps = state => ({
    districts: state.loc.userL1s,
});

export default withModulesManager(connect(mapStateToProps)(injectIntl(withTheme(withStyles(styles)(DistrictPicker)))));
