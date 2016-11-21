'use strict';

function initialize() {
  var tabMatcher = {url: '*://play.google.com/music/*'};
  
  // chrome.extension.onMessage.addListener(messageHandler);
  
  chrome.runtime.onInstalled.addListener(function() {
    var manifest = chrome.runtime.getManifest(),
        scripts = manifest.content_scripts[0].js;
    
    chrome.tabs.query(tabMatcher, function(tabs) {
      for (let i in tabs) {
        for (let k = 0; k < scripts.length; k++) {
          chrome.tabs.executeScript(tabs[i].id, {file: scripts[k]});
        }
      }
    });
  });
}

initialize();