import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { Paper, List, ListItem, ListItemText, ListItemButton, IconButton, Box, Tooltip } from "@mui/material";

import { GetIconComponent, formatMessage, formatMessageWithValues, SearcherPane, ProgressOrError } from "@openimis/fe-core";
import EditLocationDialog from "./EditLocationDialog";
import MoveLocationDialog from "./MoveLocationDialog";
import DeleteLocationDialog from "../components/DeleteLocationDialog";
import {
  RIGHT_LOCATION_ADD,
  RIGHT_LOCATION_EDIT,
  RIGHT_LOCATION_DELETE,
  RIGHT_LOCATION_MOVE,
  RIGHT_REGION_LOCATION_ADD,
} from "../constants";
const AddIcon = GetIconComponent("Add")
const MoveIcon = GetIconComponent("Shuffle")
const DeleteIcon = GetIconComponent("Delete")
const ReplayIcon = GetIconComponent("Replay")
const StyledTypeLocationsPaper = styled("div")(({ theme }) => ({
  "& .paper": theme.paper?.body ?? {},
  "& .paperHeader": theme.paper?.header ?? {},
  "& .paperHeaderTitle": theme.paper?.title ?? {},
  "& .paperHeaderMessage": theme.paper?.message ?? {},
  "& .paperHeaderAction": theme.paper?.action ?? {},
  "& .lockedRow": theme.table?.lockedRow ?? {},
}));

class ActionDialogs extends Component {
  render() {
    const {
      intl,
      editOpen,
      moveOpen,
      delOpen,
      type,
      currentParents,
      stateLocation,
      locations,
      reassign = false,
      save,
      move,
      del,
      changeState,
      withCaptation = false,
    } = this.props;
    let args = {
      type: formatMessage(intl, "location", `locationType.${type}`),
      code: !!stateLocation ? stateLocation.code : null,
      name: !!stateLocation ? stateLocation.name : null,
    };
    let editTitle = formatMessageWithValues(
      intl,
      "location",
      !stateLocation ? "AddDialog.title" : "EditDialog.title",
      args,
    );
    if (!!currentParents) {
      let parent = currentParents[currentParents.length - 1];
      editTitle += formatMessageWithValues(intl, "location", "EditDialog.title.of", {
        code: !!parent ? parent.code : null,
        name: !!parent ? parent.name : null,
      });
    }
    let children = !!reassign ? formatMessage(intl, "location", `locationType.${type}.children`) : null;
    let directChildren = !!reassign ? formatMessage(intl, "location", `locationType.${type}.directChildren`) : null;
    let reassignLocations = !!reassign
      ? locations.filter((l) => !stateLocation || l.uuid !== stateLocation.uuid)
      : null;
    return (
      <Fragment>
        <EditLocationDialog
          title={editTitle}
          open={editOpen === type}
          location={stateLocation}
          onSave={save}
          onCancel={() => changeState({ editOpen: null })}
          withCaptation={withCaptation}
        />
        <MoveLocationDialog
          title={formatMessageWithValues(intl, "location", "MoveDialog.title", args)}
          open={moveOpen === type}
          location={stateLocation}
          locations={locations}
          currentParents={currentParents}
          onMove={move}
          changeState={changeState}
          onCancel={() => changeState({ moveOpen: null })}
          withCaptation={withCaptation}
        />
        <DeleteLocationDialog
          title={formatMessageWithValues(intl, "location", "DeleteDialog.title", args)}
          type={args.type}
          confirm={
            !!reassignLocations
              ? formatMessageWithValues(intl, "location", "DeleteDialog.confirm", {
                  ...args,
                  children,
                })
              : formatMessageWithValues(intl, "location", "DeleteDialog.confirmSimple", args)
          }
          drop={formatMessageWithValues(intl, "location", "DeleteDialog.drop", {
            ...args,
            children,
          })}
          reassign={formatMessageWithValues(intl, "location", "DeleteDialog.reassign", {
            ...args,
            directChildren,
          })}
          location={stateLocation}
          reassignLocations={reassignLocations}
          open={delOpen === type}
          onDelete={del}
          onCancel={() => changeState({ delOpen: null })}
        />
      </Fragment>
    );
  }
}

const StyledActionDialogs = injectIntl(ActionDialogs);

class ResultPane extends Component {
  render() {
    const {
      rights,
      type,
      fetching,
      fetched,
      error,
      locations,
      location,
      onSelect,
      onEdit,
      onDelete,
      onMove,
      InlineInput,
      inlineValue,
      onChange,
      readOnly,
    } = this.props;
    return (
      <Fragment>
        <ProgressOrError progress={fetching} error={error} />
        {!!fetched && !!locations && !error && (
          <List component="nav" sx={{ width: "100%" }}>
            {locations.map((l, idx) => (
              <ListItem
                key={`location-${type}-${idx}`}
                disablePadding
                className={!l.uuid || !!l.clientMutationId ? "lockedRow" : null}
                sx={{ display: "flex", width: "100%" }}
              >
                <ListItemButton
                  selected={location && location.id === l.id}
                  onClick={(e) => !!l.uuid && !!onSelect && !readOnly && onSelect(l)}
                  onDoubleClick={(e) => !!l.uuid && !readOnly && rights.includes(RIGHT_LOCATION_EDIT) && onEdit(l)}
                  sx={{ 
                    flexGrow: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderLeft: '3px solid #1976d2',
                    }
                  }}
                >
                  <ListItemText primary={`${l.code} - ${l.name}`} />
                </ListItemButton>
                {!!l.uuid && (
                  <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", pr: 1 }}>
                    {!!onMove && rights.includes(RIGHT_LOCATION_MOVE) && (
                      <Tooltip title="Move">
                        <IconButton onClick={(e) => onMove(l)}>
                          <MoveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!!onDelete && rights.includes(RIGHT_LOCATION_DELETE) && (
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={(e) => onDelete(l, idx)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!!InlineInput && (
                      <InlineInput location={l} onChange={onChange} inlineValue={inlineValue} readOnly={readOnly} />
                    )}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Fragment>
    );
  }
}

class TypeLocationsPaper extends Component {
  render() {
    const { rights, title, onRefresh, onEdit, readOnly, location, ...others } = this.props;
    const createRegionLocationRight = this.props?.rights.includes(RIGHT_REGION_LOCATION_ADD);
    let actions = [];
    const isNotRegionOrDistrict = ![0, 1].includes(this.props.type);
    if (
      !readOnly &&
      Boolean(onEdit) &&
      (createRegionLocationRight || (rights.includes(RIGHT_LOCATION_ADD) && isNotRegionOrDistrict))
    ) {
      actions.push({
        action: (e) => onEdit(null),
        icon: <AddIcon />,
      });
    }
    return (
      <StyledTypeLocationsPaper>
        <Paper className="paper">
          {!readOnly && <StyledActionDialogs {...others} />}
          <SearcherPane
            module="location"
            title={title || `locations.searcher.title.${this.props.type}`}
            refresh={onRefresh}
            SearchIcon={ReplayIcon}
            actions={actions}
            readOnly={readOnly}
            resultsPane={<ResultPane onEdit={onEdit} location={location} rights={rights} readOnly={readOnly} {...others} />}
          />
        </Paper>
      </StyledTypeLocationsPaper>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export { StyledTypeLocationsPaper };
export { ActionDialogs };
export default connect(mapStateToProps)(TypeLocationsPaper);
