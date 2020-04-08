import { Add, DeleteOutline, EditOutlined, Favorite } from "@material-ui/icons";
import {
  Avatar,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText
} from '@material-ui/core';
import { useParams } from "react-router-dom";
import React from "react";

import qs from "qs";

import AudioList from "./AudioList";
import ListActionItem from "./ListActionItem";
import User from "./User";
import foursquare from "./APIClient";

export default function ChannelView() {
  let { id } = useParams();
  const { user } = React.useContext(User.Context);
  const [channel, setChannel] = React.useState(null);
  const [audios, setAudios] = React.useState([]);

  React.useEffect(() => {
    foursquare
      .get("demo/marsbot/audio/channels/fetch", {
        params: {
          id
        }
      })
      .then(resp => {
        const channel = resp.data.response;
        setChannel(channel);
      });
  }, [id]);

  const header = channel && (
    <ListItem divider key="title">
      <Link href={user.profile} target="_blank" rel="noopener">
        <ListItemAvatar>
          <Avatar alt={user.name} src={user.picture} />
        </ListItemAvatar>
      </Link>
      <div>
        <ListItemText
          primary={channel.title}
          secondary={channel.description}
          primaryTypographyProps={{
            component: "h1",
            variant: "h6"
          }}
        />
        {+user.id === channel.userId && (
          <div>
            <ListActionItem edge="start" icon={Add} text="Add audio" />
            <ListActionItem icon={EditOutlined} text="Edit" />
            <ListActionItem
              icon={DeleteOutline}
              text="Delete"
              /* rootProps={{ onClick: () => handleDelete(audio.id) }} */
            />
          </div>
        )}
      </div>

      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="play" color="secondary">
          <Favorite fontSize="large" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );

  const handleRemoveAudio = audioId => {
    if (
      !window.confirm(
        "Are you sure you want to remove this audio from this channel?"
      )
    )
      return;
    foursquare
      .post(
        "demo/marsbot/audio/channels/attach",
        qs.stringify({
          id,
          audioFileId: audioId,
          attached: false
        })
      )
      .then(resp => setAudios(audios.filter(a => a.id !== audioId)));
  };

  return (
    <AudioList
      audios={audios}
      header={header}
      handleDelete={handleRemoveAudio}
    />
  );
}
