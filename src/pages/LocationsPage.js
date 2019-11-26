import React, { Component } from "react"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Grid } from "@material-ui/core";
import TypeLocationsPaper from "../components/TypeLocationsPaper";
import { fetchLocations, clearLocations } from "../actions";


class LocationsPage extends Component {

    state = {
        region: null,
        district: null,
        municipality: null,
        ward: null
    }

    componentDidMount() {
        this.props.fetchLocations("R", null)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.regions.length && !!this.props.regions.length) {
            this.setState({ region: this.props.regions[0] })
        } else if (prevState.region !== this.state.region) {
            if (!this.state.region) {
                this.props.clearLocations("D")
            } else {
                this.props.fetchLocations("D", this.state.region)
            }
        } else if (!prevProps.districts.length && !!this.props.districts.length) {
            this.setState({ district: this.props.districts[0] })
        } else if (prevState.district !== this.state.district) {
            if (!this.state.district) {
                this.props.clearLocations("M")
            } else {
                this.props.fetchLocations("M", this.state.district)
            }
        } else if (!prevProps.municipalities.length && !!this.props.municipalities.length) {
            this.setState({ municipality: this.props.municipalities[0] })
        } else if (prevState.municipality !== this.state.municipality) {
            if (!this.state.municipality) {
                this.props.clearLocations("W")
            } else {
                this.props.fetchLocations("W", this.state.municipality)
            }
        } else if (!prevProps.wards.length && !!this.props.wards.length) {
            this.setState({ ward: this.props.wards[0] })            
        }
    }

    render() {
        const {
            fetchingRegions, fetchedRegions, regions, errorRegions,
            fetchingDistricts, fetchedDistricts, districts, errorDistricts,
            fetchingMunicipalities, fetchedMunicipalities, municipalities, errorMunicipalities,
            fetchingWards, fetchedWards, wards, errorWards,
        } = this.props
        return (
            <Grid container spacing={1} >
                <Grid item xs={8}>
                    <Grid container spacing={1}>
                        <Grid item xs={4}>
                            <TypeLocationsPaper
                                type="R"
                                onSelect={region => this.setState({ region })}
                                fetching={fetchingRegions}
                                fetched={fetchedRegions}
                                error={errorRegions}
                                locations={regions}
                                location={this.state.region}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TypeLocationsPaper
                                type="D"
                                parent={this.state.region}
                                onSelect={district => this.setState({ district })}
                                fetching={fetchingDistricts}
                                fetched={fetchedDistricts}
                                error={errorDistricts}
                                locations={districts}
                                location={this.state.district}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TypeLocationsPaper
                                type="M"
                                parent={this.state.district}
                                onSelect={municipality => this.setState({ municipality })}
                                fetching={fetchingMunicipalities}
                                fetched={fetchedMunicipalities}
                                error={errorMunicipalities}
                                locations={municipalities}
                                location={this.state.municipality}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    <TypeLocationsPaper
                        type="W"
                        parent={this.state.municipality}
                        onSelect={ward => this.setState({ ward })}
                        fetching={fetchingWards}
                        fetched={fetchedWards}
                        error={errorWards}
                        locations={wards}
                        location={this.state.ward}
                    />
                </Grid>
            </Grid>
        )
    }
}


const mapStateToProps = state => ({
    fetchingRegions : state.loc.fetchingRegions,
    fetchedRegions : state.loc.fetchedRegions,
    regions : state.loc.regions,
    errorRegions : state.loc.errorRegions,
    fetchingDistricts : state.loc.fetchingDistricts,
    fetchedDistricts : state.loc.fetchedDistricts,
    districts : state.loc.districts,
    errorDistricts : state.loc.errorDistricts,
    fetchingMunicipalities : state.loc.fetchingMunicipalities,
    fetchedMunicipalities : state.loc.fetchedMunicipalities,
    municipalities : state.loc.municipalities,
    errorMunicipalities : state.loc.errorMunicipalities,
    fetchingWards : state.loc.fetchingWards,
    fetchedWards : state.loc.fetchedWards,
    wards : state.loc.wards,
    errorWards : state.loc.errorWards,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchLocations, clearLocations }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationsPage);