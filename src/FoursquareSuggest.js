import { Autocomplete } from "@material-ui/lab";
import {
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { throttle } from "throttle-debounce";
import React from "react";

import { FlashContext } from "./FlashSnackbar";
import CategoryIcon from "./CategoryIcon";
import foursquare from "./APIClient.js";

const getCurrentLocation = (options) => {
  return new Promise((resolve, reject) => {
    const success = (pos) => {
      const { latitude, longitude } = pos.coords;
      return resolve(`${latitude},${longitude}`);
    };

    navigator.geolocation.getCurrentPosition(success, reject, {
      // enableHighAccuracy: true,
      maximumAge: 600 * 1000,
    });
  });
};

export default function FoursquareSuggest() {
  const { setAlert } = React.useContext(FlashContext);
  const [location, setLocation] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [venues, setVenues] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const fetchData = React.useMemo(
    () =>
      throttle(300, (query, location) => {
        foursquare
          .get("/venues/suggestcompletion", {
            params: {
              ll: location,
              query: query,
              limit: 5,
            },
            ejectErrorAlert: true,
          })
          .then((resp) => {
            setVenues(resp.minivenues);
          })
          .catch(console.log)
          .then(() => {
            setLoading(false);
          });
      }),
    []
  );

  const handleSuggest = (event) => {
    if (!location) return;
    const query = event.target.value.trim();
    setVenues([]);
    setLoading(Boolean(query));
    query && fetchData(query, location);
  };

  const handleSelected = (_, venue) => {
    setSelected(venue && venue.id);
  };

  const handleFocus = () => {
    getCurrentLocation()
      .then(setLocation)
      .catch((error) => {
        setAlert({
          duration: null,
          severity: "error",
          message: error.message,
        });
      });
  };

  return (
    <>
      <Autocomplete
        options={venues}
        getOptionLabel={(option) => option.name}
        autoComplete
        includeInputInList
        disableOpenOnFocus
        onChange={handleSelected}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            margin="none"
            label="Attach to a location"
            variant="outlined"
            fullWidth
            required
            autoFocus
            onChange={handleSuggest}
            onFocus={handleFocus}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
        renderOption={(venue) => {
          return (
            <Grid container alignItems="center" key={venue.id} spacing={2}>
              <Grid item>
                <CategoryIcon category={venue.categories[0]} />
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography noWrap>{venue.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {venue.location.address}
                </Typography>
              </Grid>
            </Grid>
          );
        }}
      />
      <input name="venueId" type="hidden" value={selected || ""} />
    </>
  );
}
