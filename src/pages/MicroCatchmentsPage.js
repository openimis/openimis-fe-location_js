import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Button, Fab, Grid } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import {
  historyPush,
  withModulesManager,
  withHistory,
  Helmet,
  formatMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import MicroCatchmentSearcher from "../components/MicroCatchmentSearcher";
import {
  RIGHT_MICRO_CATCHMENT_ADD,
  RIGHT_MICRO_CATCHMENT_IMPORT,
  RIGHT_MICRO_CATCHMENT_EXPORT,
} from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
  actions: {
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
});

class MicroCatchmentsPage extends Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      district: null,
      uploading: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userDistricts !== this.props.userDistricts && !this.state.district) {
      const firstDistrict = this.props.userDistricts?.[0] || null;
      if (firstDistrict) {
        this.setState({ district: firstDistrict });
      }
    }
  }

  hasRight = (right) => this.props.rights.includes(right) || this.props.rights.includes(String(right));

  apiBase = () => {
    const apiRoot = (process.env.REACT_APP_API_URL || "/api").replace(/\/+$/, "");
    return `${apiRoot}/location/micro-catchments`;
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "location.route.microCatchment");
  };

  onDownload = () => {
    if (!this.state.district?.uuid) {
      window.alert(formatMessage(this.props.intl, "location", "microCatchment.uploadDownload.missingDistrict"));
      return;
    }
    const url = `${this.apiBase()}/export?district_uuid=${encodeURIComponent(this.state.district.uuid)}`;
    window.open(url, "_blank", "noopener");
  };

  onUploadClick = () => {
    if (!this.state.district?.uuid) {
      window.alert(formatMessage(this.props.intl, "location", "microCatchment.uploadDownload.missingDistrict"));
      return;
    }
    this.fileInputRef.current?.click();
  };

  onUploadFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    this.setState({ uploading: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("district_uuid", this.state.district.uuid);

      const response = await fetch(`${this.apiBase()}/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) {
        const errors = Array.isArray(payload?.errors) ? payload.errors.join("\n") : "Upload failed.";
        throw new Error(errors);
      }

      window.alert(formatMessage(this.props.intl, "location", "microCatchment.upload.success"));
    } catch (error) {
      window.alert(error?.message || formatMessage(this.props.intl, "location", "microCatchment.upload.error"));
    } finally {
      if (this.fileInputRef.current) this.fileInputRef.current.value = "";
      this.setState({ uploading: false });
    }
  };

  render() {
    const { classes } = this.props;
    const canAdd = this.hasRight(RIGHT_MICRO_CATCHMENT_ADD);
    const canImport = this.hasRight(RIGHT_MICRO_CATCHMENT_IMPORT);
    const canExport = this.hasRight(RIGHT_MICRO_CATCHMENT_EXPORT);

    return (
      <div className={classes.page}>
        <Helmet title={formatMessage(this.props.intl, "location", "microCatchments.page.title")} />
        {(canImport || canExport) && (
          <div className={classes.actions}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={4}>
                <PublishedComponent
                  pubRef="location.DistrictPicker"
                  value={this.state.district}
                  onChange={(district) => this.setState({ district })}
                />
              </Grid>
              <Grid item>
                {canExport && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CloudDownloadIcon />}
                    className={classes.actionButton}
                    onClick={this.onDownload}
                  >
                    {formatMessage(this.props.intl, "location", "microCatchment.download.button")}
                  </Button>
                )}
                {canImport && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    className={classes.actionButton}
                    disabled={this.state.uploading}
                    onClick={this.onUploadClick}
                  >
                    {formatMessage(this.props.intl, "location", "microCatchment.upload.button")}
                  </Button>
                )}
                <input
                  ref={this.fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={this.onUploadFileSelected}
                  style={{ display: "none" }}
                />
              </Grid>
            </Grid>
          </div>
        )}
        <MicroCatchmentSearcher />
        {canAdd && (
          <Fab color="primary" className={classes.fab} onClick={this.onAdd}>
            <AddIcon />
          </Fab>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights || [],
  userDistricts: state.loc.userL1s || [],
});

export default withModulesManager(
  withHistory(
    connect(mapStateToProps)(
      injectIntl(withTheme(withStyles(styles)(MicroCatchmentsPage)))
    )
  )
);
