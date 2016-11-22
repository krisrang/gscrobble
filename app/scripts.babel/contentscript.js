'use strict';

var scrapeInterval,
    previousTrack;

function extensionConnected() {
  return chrome.runtime && !!chrome.runtime.getManifest();
}

function getText(selector) {
  let el = document.querySelector(selector);
  return el ? el.textContent : null;
}

function calculateDuration(timestring) {
  let i, j, max, pow, timeSegments;
  let seconds = 0;

  if (!timestring) {
    return seconds;
  }

  for (i = 0, max = arguments.length; i < max; i += 1) {
    if (arguments[i].toString()) {
      timeSegments = arguments[i].split(':');

      for (j = timeSegments.length - 1, pow = 0;
        j >= 0 && j >= (timeSegments.length - 3);
        j -= 1, pow += 1) {
        seconds += parseFloat(timeSegments[j].replace('-', '')) * Math.pow(60, pow);
      }
    }
  }

  return seconds * 1000;
}

function thumbedUp() {
  let el = document.querySelector('.song-row.currently-playing [data-col=rating]');
  return el ? el.dataset.rating === '5' : false;
}

function getAlbumArt() {
  let art = document.querySelector('#playerBarArt');
  return art ? art.src : null;
}

function getTrack() {
  return getText('#currently-playing-title') || getText('#player-song-title') || null;
}

function getPlaying() {
  return document.querySelector('[data-id="play-pause"]').classList.contains('playing');
}

function scrape() {
  return {
    album:        getText('.player-album'),
    artist:       getText('#player-artist'),
    duration:     calculateDuration(getText('#time_container_duration')),
    elapsed:      calculateDuration(getText('#time_container_current')),
    title:        getTrack(),
    playing:      getPlaying(),
    thumbed:      thumbedUp(),
    defaultImage: getAlbumArt()
  };
}

function trackDifferent(track) {
  let keys = ['album', 'artist', 'duration', 'elapsed', 'title', 'playing', 'thumbed', 'defaultImage'];
  
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    
    if (previousTrack[key] !== track[key]) {
      return true;
    }
  }
  return false;
}

function thumbUpTrack() {
  if (thumbedUp) {
    return;
  }
  
  let btn = document.querySelector('#player .player-rating-container [icon^="sj:thumb-"][data-rating="5"]');  
  btn && btn.click();
}

function messageHandler(msg) {
  switch (msg.name) {
    case 'thumbsUpCommand':
      thumbUpTrack();
      break;
  }
}

function updateData() {
  if (extensionConnected()) {
    let track = scrape();
    
    if (!previousTrack || trackDifferent(track)) {
      chrome.runtime.sendMessage({
        name: 'nowplaying',
        message: track
      });
       
      previousTrack = track;
    }
  } else {
    scrapeInterval && clearInterval(scrapeInterval);
    console.log('gscrobble:: old instance disconnected');
  }
}

// init
(function() {
  chrome.extension.onMessage.addListener(messageHandler);
  scrapeInterval = setInterval(updateData, 2000);
  console.log('gscrobble:: installed in tab');
})();
