import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  Tooltip,
} from "@material-ui/core";
import React from "react";
import qs from "qs";

import AudioList from "./AudioList";
import User from "./User";
import foursquare from "./APIClient";

export default function MarsbotHome() {
  const { user } = React.useContext(User.Context);
  const [audios, setAudios] = React.useState([]);

  const params = new URLSearchParams(window.location.search);
  const filter = params.get("filter");
  const [filterOn, setFilter] = React.useState(filter !== "off");

  React.useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    foursquare
      .get("demo/marsbot/audio/snippetuser", {
        params: {
          userId: user.id,
          tz: tz,
        },
      })
      .then((resp) => setAudios(resp.data.response.audio));
  }, [user]);

  const handleDelete = (audioId) => {
    if (!window.confirm("Are you sure you want to delete this audio?")) return;
    foursquare
      .post(
        "demo/marsbot/audio/delete",
        qs.stringify({
          audioFileId: audioId,
        })
      )
      .then((resp) => setAudios(audios.filter((a) => a.id !== audioId)))
      .catch((error) => console.log(error));
  };

  const header = (
    <ListItem divider key="title">
      <ListItemText
        primary={`${user.firstName}'s Marsbot Audios`}
        primaryTypographyProps={{
          component: "h1",
          variant: "h6",
          align: "center",
        }}
      />
      <ListItemSecondaryAction>
        <Tooltip title="Toggle venue audios only" aria-label="filter">
          <Switch
            checked={filterOn}
            onChange={(e) => {
              setFilter(e.target.checked);
            }}
            color="secondary"
            size="small"
          />
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <AudioList
      audios={audios.filter((a) => !filterOn || a.venues[0])}
      header={header}
      handleDelete={handleDelete}
    />
  );
}
