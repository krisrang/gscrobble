import EventEmitter from './event_emitter';
import config from './config';

class Base {}
class LastApi extends EventEmitter(Base) {
  constructor() {
    super();
    
    this.apiRoot = config.lastAPI;
    this.key = config.lastKey;
    this.secret = config.lastSecret;
    this.session = null;    
    
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        if (namespace === 'sync' && key === 'lastSession') {
          let change = changes[key];
          
          this.setSession(change.newValue);
        }
      }
    });
  }
  
  openAuth() {
    chrome.tabs.create({
      url: 'http://www.last.fm/api/auth/?api_key=' + config.lastKey + '&cb=' + chrome.extension.getURL('callback.html')
    });
  }
  
  hasToken() {
    return !!this.session && this.session.key;
  }
  
  setSession(session) {
    if (!session) {
      this.setSessionFail();
    } else {
      this.setSessionSuccess(session);
    }
  }
  
  setToken(token) {    
    this.validateToken(token, (session) => {
      this.saveSession(session);
    });
  }
  
  // fetch session and validate token
  validateToken(token, callback) {
    callback(true);
  }
  
  setSessionSuccess(session) {
    this.session = session;
    this.emit('signedIn', session);
    
    chrome.browserAction.setIcon({
      path: {
        '16': 'images/as-16.png',
        '24': 'images/as-24.png',
        '32': 'images/as-32.png',
        '48': 'images/as-48.png'
      }
    });
  }
  
  setSessionFail() {
    this.session = null;
    this.emit('signedOut', null);
    
    chrome.browserAction.setIcon({
      path: {
        '16': 'images/as-red-16.png',
        '24': 'images/as-red-24.png',
        '32': 'images/as-red-32.png',
        '48': 'images/as-red-48.png'
      }
    });
  }
  
  saveSession(session) {
    chrome.storage.sync.set({'lastSession': session});
  }
  
  deleteSession() {
    chrome.storage.sync.set({'lastSession': null});
  }
}

export default LastApi;