/* global Raven, currentTrack */
import config from './common/config';
import CurrentTrack from './common/current_track';

Raven.config(config.ravenDSN).install();

function initialize() {
  window.currentTrack = new CurrentTrack();
  
  chrome.extension.onMessage.addListener((msg) => {
    console.log(msg);
    if (msg.name === 'nowplaying') {
      currentTrack.setCurrent(msg.message);
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
  chrome.runtime.onInstalled.addListener(function() {
    var manifest = chrome.runtime.getManifest(),
        scripts = manifest.content_scripts[0].js;
    
    chrome.tabs.query(config.tabMatcher, function(tabs) {
      for (let i in tabs) {
        for (let k = 0; k < scripts.length; k++) {
          chrome.tabs.executeScript(tabs[i].id, {file: scripts[k]});
        }
      }
    });
  });
}

initialize();