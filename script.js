const clientId = "MY_ID";
const clientSecret = "MY_SECRET_KEY";

const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progressBar = document.getElementById('progress');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const volumeSlider = document.getElementById('volume-slider');
const trackList = document.getElementById('track-list');
const contentTitle = document.getElementById('content-title');

let isPlaying = false;
let currentTrack = null;

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

async function fetchTopTracks() {
    const accessToken = await getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=10', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data.items;
}

async function searchTracks(query) {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data.tracks.items;
}

function createTrackElement(track) {
    const trackElement = document.createElement('div');
    trackElement.className = 'track-item';
    trackElement.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}">
        <h3>${track.name}</h3>
        <p>${track.artists[0].name}</p>
    `;
    trackElement.addEventListener('click', () => {
        currentTrack = track;
        updateNowPlaying(track);
        playTrack(track);
    });
    return trackElement;
}

function updateNowPlaying(track) {
    document.getElementById('current-track-image').src = track.album.images[0].url;
    document.getElementById('current-track-name').textContent = track.name;
    document.getElementById('current-track-artist').textContent = track.artists[0].name;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgressBar(currentTime, duration) {
    const percent = (currentTime / duration) * 100;
    progressBar.style.width = `${percent}%`;
    document.getElementById('current-time').textContent = formatTime(currentTime);
    document.getElementById('duration').textContent = formatTime(duration);
}

async function displayTopTracks() {
    const tracks = await fetchTopTracks();
    trackList.innerHTML = '';
    tracks.forEach(item => {
        const trackElement = createTrackElement(item.track);
        trackList.appendChild(trackElement);
    });
}

function playTrack(track) {
    console.log(`Playing: ${track.name}`);
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
    console.log('Paused');
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function playNextTrack() {
    console.log('Next track');
}

function playPreviousTrack() {
    console.log('Previous track');
}

function updatePlayerState() {
    const currentTime = 30; 
    const duration = 180; 
    updateProgressBar(currentTime, duration);
}

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseTrack();
    } else if (currentTrack) {
        playTrack(currentTrack);
    }
});

prevBtn.addEventListener('click', playPreviousTrack);
nextBtn.addEventListener('click', playNextTrack);

searchButton.addEventListener('click', async () => {
    const query = searchInput.value;
    const tracks = await searchTracks(query);
    trackList.innerHTML = '';
    tracks.forEach(track => {
        const trackElement = createTrackElement(track);
        trackList.appendChild(trackElement);
    });
    contentTitle.textContent = `Search Results for "${query}"`;
});

volumeSlider.addEventListener('input', (e) => {
    console.log('Volume:', e.target.value);
});

async function init() {
    await displayTopTracks();
    setInterval(updatePlayerState, 1000);
}

init();