/* global Raven */
import config from './common/config';

Raven.config(config.ravenDSN).install();

let scrapeInterval,
    previousData;

function extensionConnected() {
  return chrome.runtime && !!chrome.runtime.getManifest();
}

function getText(selector) {
  const el = document.querySelector(selector);
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
  const el = document.querySelector('.song-row.currently-playing [data-col=rating]');
  return el ? el.dataset.rating === '5' : false;
}

function getAlbumArt() {
  const art = document.querySelector('#playerBarArt');
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

function dataDifferent(data) {
  const keys = ['album', 'artist', 'duration', 'elapsed', 'title', 'playing', 'thumbed', 'defaultImage'];
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    if (previousData[key] !== data[key]) {
      return true;
    }
  }
  return false;
}

function thumbUpTrack() {
  const btn = document.querySelector('#player .player-rating-container [icon^="sj:thumb-"][data-rating="5"]');  
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
    const data = scrape();
    
    if (!previousData || dataDifferent(data)) {
      chrome.runtime.sendMessage({
        name: 'nowplaying',
        message: data
      });
       
      previousData = data;
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
