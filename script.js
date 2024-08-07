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

async function playTrack(track) {
    const accessToken = localStorage.getItem('access_token');
    const deviceId = localStorage.getItem('device_id');
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [track.uri] })
    });
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    updateNowPlaying(track);
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

const REDIRECT_URI = 'http://localhost:5500/callback';
const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-modify-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state';

function loginWithSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
}

async function handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        const response = await fetch('/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    }
}

async function getUserPlaylists() {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return await response.json();
}

async function createPlaylist(name) {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, public: false })
    });
    return await response.json();
}

async function createPlaylist(name) {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, public: false })
    });
    return await response.json();
}

async function addTrackToPlaylist(playlistId, trackUri) {
    const accessToken = localStorage.getItem('access_token');
    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri] })
    });
}

function initializePlayer() {
    const player = new Spotify.Player({
        name: 'GM Media Player',
        getOAuthToken: cb => { cb(localStorage.getItem('access_token')); }
    });

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        localStorage.setItem('device_id', device_id);
    });

    player.connect();
    return player;
}

async function playTrack(track) {
    const accessToken = localStorage.getItem('access_token');
    const deviceId = localStorage.getItem('device_id');
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [track.uri] })
    });
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    updateNowPlaying(track);
}

function displayPlaylists(playlists) {
    const playlistContainer = document.getElementById('playlist-container');
    playlistContainer.innerHTML = '';
    playlists.items.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.className = 'playlist-item';
        playlistElement.textContent = playlist.name;
        playlistElement.addEventListener('click', () => loadPlaylistTracks(playlist.id));
        playlistContainer.appendChild(playlistElement);
    });
}

async function loadPlaylistTracks(playlistId) {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    displayTracks(data.items.map(item => item.track));
}

async function init() {
    if (window.location.search.includes('code=')) {
        await handleAuthCallback();
        window.history.pushState({}, document.title, "/"); 
    }

    if (localStorage.getItem('access_token')) {
        const player = initializePlayer();
        const playlists = await getUserPlaylists();
        displayPlaylists(playlists);
        await displayTopTracks();
    } else {
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login with Spotify';
        loginButton.addEventListener('click', loginWithSpotify);
        document.body.appendChild(loginButton);
    }
}

function drawVisualizer(ctx, canvas, analyser, bufferLength, dataArray) {
    requestAnimationFrame(() => drawVisualizer(ctx, canvas, analyser, bufferLength, dataArray));

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

function createVisualizer() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            drawVisualizer(ctx, canvas, analyser, bufferLength, dataArray);
        })
        .catch(err => {
            console.error('Error accessing audio stream:', err);
        });
}

function init() {
    createVisualizer();
}

function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    drawVisualizer();


async function toggleLikeTrack(trackId) {
    const accessToken = localStorage.getItem('access_token');
    const isLiked = await checkIfTrackIsLiked(trackId);
    
    const url = `https://api.spotify.com/v1/me/tracks?ids=${trackId}`;
    const method = isLiked ? 'DELETE' : 'PUT';
    
    await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    updateLikeButton(trackId, !isLiked);
}

async function checkIfTrackIsLiked(trackId) {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data[0];
}

function updateLikeButton(trackId, isLiked) {
    const likeButton = document.querySelector(`[data-track-id="${trackId}"]`);
    if (likeButton) {
        likeButton.innerHTML = isLiked ? '❤️' : '🤍';
    }
}

async function displayRecommendations(trackId) {
    const accessToken = localStorage.getItem('access_token');
    const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=5`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '<h3>Recommended Tracks</h3>';
    
    data.tracks.forEach(track => {
        const trackElement = createTrackElement(track);
        recommendationsContainer.appendChild(trackElement);
    });
}

function createTrackElement(track) {
    const trackElement = document.createElement('div');
    trackElement.className = 'track-item';
    trackElement.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}">
        <div class="track-info">
            <h3>${track.name}</h3>
            <p>${track.artists[0].name}</p>
        </div>
        <button class="like-button" data-track-id="${track.id}">🤍</button>
    `;
    
    trackElement.addEventListener('click', () => {
        playTrack(track);
        displayRecommendations(track.id);
    });
    
    const likeButton = trackElement.querySelector('.like-button');
    likeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLikeTrack(track.id);
    });
    
    checkIfTrackIsLiked(track.id).then(isLiked => updateLikeButton(track.id, isLiked));
    
    return trackElement;
}

function setupInfiniteScroll() {
    const trackList = document.getElementById('track-list');
    let page = 1;
    
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMoreTracks();
        }
    }, { threshold: 1 });

    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    trackList.appendChild(sentinel);
    observer.observe(sentinel);

    async function loadMoreTracks() {
        page++;
        const tracks = await fetchTracks(page);
        tracks.forEach(track => {
            const trackElement = createTrackElement(track);
            trackList.insertBefore(trackElement, sentinel);
        });
    }
}

async function init() {
    if (window.location.search.includes('code=')) {
        await handleAuthCallback();
        window.history.pushState({}, document.title, "/");
    }

    if (localStorage.getItem('access_token')) {
        const player = initializePlayer();
        const playlists = await getUserPlaylists();
        displayPlaylists(playlists);
        await displayTopTracks();
        createVisualizer();
        setupInfiniteScroll();
    } else {
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login with Spotify';
        loginButton.addEventListener('click', loginWithSpotify);
        document.body.appendChild(loginButton);
    }
}

init();