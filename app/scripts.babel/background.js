/* global Raven, currentTrack */
import config from './common/config';
import CurrentTrack from './common/current_track';
import Track from './common/track';
import LastApi from './common/last_api';

Raven.config(config.ravenDSN).install();

function setup() {
  let manifest = chrome.runtime.getManifest(),
      scripts = manifest.content_scripts[0].js;
  
  chrome.extension.onMessage.addListener((msg) => {
    if (msg.name === 'nowplaying') {
      let track = new Track(msg.message);
      currentTrack.updateTrack(track);
    }
  });
  
  chrome.commands.onCommand.addListener((cmd) => {
    if (cmd === 'thumbs-up-track') {
      chrome.tabs.query(config.tabMatcher, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {name: 'thumbsUpCommand'});
      });
    }
  });
  
  // (re)insert new version of extension into all open google play music tabs
  chrome.tabs.query(config.tabMatcher, function(tabs) {
    for (let i in tabs) {
      for (let k = 0; k < scripts.length; k++) {
        chrome.tabs.executeScript(tabs[i].id, {file: scripts[k]});
      }
    }
  });
}

function initialize() {
  window.currentTrack = new CurrentTrack();
  window.lastApi = new LastApi();
  
  chrome.storage.sync.set({'lastToken': 'test'}, function() {
  });
  
  chrome.storage.sync.get('lastToken', function(result) {
    console.log(result.lastToken);
    console.log(chrome.runtime.lastError);
    
    setup();
  });
}

initialize();