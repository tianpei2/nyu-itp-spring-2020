import {
  Backdrop,
  Checkbox,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import { useHistory, useLocation, useParams } from "react-router-dom";
import React from "react";

import qs from "qs";

import AudioList from "./AudioList";
import ResponsiveDialog from "./ResponsiveDialog";
import User from "./User";
import foursquare from "./APIClient";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "white",
  },
}));

export default function AttachForm() {
  const classes = useStyles();
  let { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const background = location.state && location.state.background;
  const { user } = React.useContext(User.Context);
  const [loading, setLoading] = React.useState(true);
  const [audios, setAudios] = React.useState([]);
  const input = "audioFileId";

  React.useEffect(() => {
    foursquare
      .getUserAudios(user.id)
      .then((audios) => setAudios(audios.filter((a) => a.venues[0])))
      .catch((error) => {})
      .then(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const idsMap = audios.reduce(
      (a, e) => ({ ...a, [e.id]: e.venues[0].id }),
      {}
    );
    const formData = new FormData(event.target);
    const audioIds = formData.getAll(input);

    for (const audioFileId of audioIds) {
      await foursquare.post(
        "demo/marsbot/audio/channels/attach",
        qs.stringify({
          id,
          audioFileId,
          venueIds: idsMap[audioFileId],
          attached: true,
        })
      );
    }
    history.push(background || `/channel/${id}`);
  };

  if (loading)
    return (
      <Backdrop open={loading} className={classes.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  return (
    <ResponsiveDialog
      fullWidth
      maxWidth="xs"
      title="Add audios to channel"
      handleSubmit={handleSubmit}
      closeURL={`/channel/${id}`}
      content={
        <>
          <input name="id" type="hidden" value={id} />{" "}
          <AudioList
            audios={audios}
            withMap={false}
            action={(audio) => <Checkbox name={input} value={audio.id} />}
          />
        </>
      }
    />
  );
}
