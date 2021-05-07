import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Grid } from "@material-ui/core";
import {
    withModulesManager,
    ControlledField, PublishedComponent,
} from "@openimis/fe-core";
import { selectLocation } from "../actions";
import CoarseLocation from "./CoarseLocation";

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


class DetailedHealthFacility extends Component {

    state = {
        district: null,
        level: null,
    }

    _onChange = (hf) => {
        if (!!hf && (
            (hf.location.id !== (!!this.state.district && this.state.district.id)) ||
            (hf.level !== this.state.level)
        )) {
            this.setState(
                {
                    district: hf.location,
                    level: hf.level,
                },
                e => !!this.props.onChange && this.props.onChange(hf)
            )
        } else if (!!this.props.onChange) {
            this.props.onChange(null)
        }
    }

    render() {
        const { classes, value, split = false, readOnly = true, onChange } = this.props;
        let grid = split ? 12 : 6;
        let region = (!!value && !!value.location && value.location.parent) || (this.state.district && this.state.district.parent)
        let district = (!!value && value.location) || this.state.district
        return (
            <Grid container className={classes.form}>
                <Grid item xs={grid}>
                    <CoarseLocation
                        region={region}
                        district={district}
                        readOnly={readOnly}
                        onChange={district => this.setState({ district })}
                    />
                </Grid>
                <ControlledField module="location"
                    id="DetailedHealthFacility.Level"
                    field={
                        <Grid item xs={grid / 3} className={classes.item}>
                            <PublishedComponent
                                pubRef="location.HealthFacilityLevelPicker"
                                value={(!!value && value.level) || this.state.level}
                                readOnly={readOnly}
                                withNull={true}
                                onChange={level => this.setState({ level })}
                            />
                        </Grid>
                    } />
                <ControlledField module="location"
                    id="DetailedHealthFacility.HF"
                    field={
                        <Grid item xs={grid / 3 * 2} className={classes.item}>
                            <PublishedComponent
                                pubRef="location.HealthFacilityPicker"
                                district={(!!value && value.location) || this.state.district}
                                level={(!!value && value.level) || this.state.level}
                                value={value}
                                readOnly={readOnly}
                                withNull={true}
                                onChange={this._onChange}
                            />
                        </Grid>
                    } />
            </Grid >
        )
    }
}

const mapStateToProps = state => ({
});


const mapDispatchToProps = dispatch => {
    return bindActionCreators({ selectLocation }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(DetailedHealthFacility))));