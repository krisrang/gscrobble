/* global Raven */
import config from './common/config';
import CurrentTrack from './common/current_track';
import LastApi from './common/last_api';

Raven.config(config.ravenDSN).install();

function setup() {
  let manifest = chrome.runtime.getManifest(),
      scripts = manifest.content_scripts[0].js;
  
  chrome.extension.onMessage.addListener((msg) => {
    if (msg.name === 'nowplaying') {
      window.currentTrack.updateTrack(msg.message);
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
  
  chrome.storage.sync.get('lastSession', (result) => {
    if (!chrome.runtime.lastError) {
       window.lastApi.setSession(result.lastSession);       
    }
  });
  
  setup();
}

initialize();