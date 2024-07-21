// Load the YouTube Player API asynchronously
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const players = []; // Array to store player instances

// Function to create a YouTube player
function createYouTubePlayer(containerId, videoId) {
    return new YT.Player(containerId, {
        height: '360',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': onPlayerReady
        }
    });
}

// This function is called when the YouTube player is ready
function onPlayerReady(event) {
    event.target.playVideo(); // Autoplay the video
}

// This function is called when the YouTube Iframe API is ready
function onYouTubeIframeAPIReady() {
    try {
        // Create players for each video
        players.push(createYouTubePlayer('player1', 'zTTcODgQzZo'));
        players.push(createYouTubePlayer('player2', '3DeRQ1O5GFE'));
        
        // Add more players as needed
    } catch (error) {
        console.error('An error occurred while initializing YouTube players:', error);
    }
}