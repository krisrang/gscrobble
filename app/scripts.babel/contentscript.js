'use strict';

var scrapeInterval;

function extensionConnected() {
  return chrome.runtime && !!chrome.runtime.getManifest();
}

function getText(selector) {
  var el = document.querySelector(selector);
  return el ? el.textContent : null;
}

function calculateDuration(timestring) {
  var i, j, max, pow, timeSegments;
  var seconds = 0;

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
  var el = document.querySelector('.song-row.currently-playing [data-col=rating]');
  return el ? el.dataset.rating === '5' : false;
}

function getAlbumArt() {
  var art = document.querySelector('#playerBarArt');
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

function thumbUpTrack() {
  if (thumbedUp) {
    return;
  }
  
  var btn = document.querySelector('#player .player-rating-container [icon^="sj:thumb-"][data-rating="5"]');  
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
    // console.time('scrape');

    chrome.runtime.sendMessage({
      name: 'nowplaying',
      message: scrape()
    });
    
    // console.timeEnd('scrape');
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
