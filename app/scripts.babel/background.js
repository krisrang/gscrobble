import config from './common/config';

Raven.config(config.ravenDSN).install()

function messageHandler(msg) {
  console.log(msg);
}

function commandHandler(cmd) {
  if (cmd === 'thumbs-up-track') {
    chrome.tabs.query(config.tabMatcher, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {name: 'thumbsUpCommand'});
    });
  }
}

function initialize() {
  chrome.extension.onMessage.addListener(messageHandler);
  chrome.commands.onCommand.addListener(commandHandler);
  
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