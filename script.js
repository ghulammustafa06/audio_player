const clientId = "MY_ID";
const clientSecret = "MY_SECRET_KEY";

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

async function initPlayer() {
  const accessToken = await getAccessToken();
  console.log("Access Token:", accessToken);
  const player = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(accessToken);
    },
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error(message);
  });
  player.addListener("authentication_error", ({ message }) => {
    console.error(message);
  });
  player.addListener("account_error", ({ message }) => {
    console.error(message);
  });
  player.addListener("playback_error", ({ message }) => {
    console.error(message);
  });

  player.addListener("player_state_changed", (state) => {
    console.log(state);
  });

  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
  });
}

initPlayer();

async function fetchTopTracks() {
  const accessToken = await getAccessToken();
  const response = await fetch(
    "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=10",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.items;
}

async function init() {
  await initPlayer();
  await displayTopTracks();
}

init();
