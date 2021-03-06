import { Favorite } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import React from "react";
import qs from "qs";

import foursquare from "./APIClient";

export default function SubscribeIcon(props) {
  const {
    channelId,
    className,
    edge,
    subscribed: defaultSubscribed,
    ...rest
  } = props;
  const [subscribed, setSubscribed] = React.useState(
    Boolean(defaultSubscribed)
  );

  const handleSubscribe = () => {
    foursquare
      .post(
        "demo/marsbot/audio/channels/subscribe",
        qs.stringify({
          id: channelId,
          subscribed: !subscribed,
        })
      )
      .then((resp) => setSubscribed(!subscribed));
  };

  return (
    <IconButton
      edge={edge}
      aria-label="subscribe"
      className={className}
      color={subscribed ? "secondary" : "default"}
      onClick={handleSubscribe}
      {...rest}
    >
      <Favorite />
    </IconButton>
  );
}
