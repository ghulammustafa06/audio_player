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
async function searchTracks(query) {
  const accessToken = await getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
      headers: {
          'Authorization': `Bearer ${accessToken}`
      }
  });
  const data = await response.json();
  return data.tracks.items;
}


function createTrackElement(track) {
  const trackElement = document.createElement("div");
  trackElement.className = "track-item";
  trackElement.innerHTML = `
                <img src="${track.track.album.images[0].url}" alt="${track.track.name}">
                <h3>${track.track.name}</h3>
                <p>${track.track.artists[0].name}</p>
            `;
  return trackElement;
}

async function displayTopTracks() {
  const tracks = await fetchTopTracks();
  const trackList = document.getElementById("track-list");
  tracks.forEach((item) => {
    const trackElement = createTrackElement(item);
    trackList.appendChild(trackElement);
  });
}

const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progressBar = document.getElementById("progress");

let isPlaying = false;

playPauseBtn.addEventListener("click", () => {
  isPlaying = !isPlaying;
  playPauseBtn.textContent = isPlaying ? "Pause" : "Play";
});

prevBtn.addEventListener("click", () => {});

nextBtn.addEventListener("click", () => {});

function updateProgressBar(percent) {
  progressBar.style.width = `${percent}%`;
}

async function init() {
  await initPlayer();
  await displayTopTracks();
}

init();
