import EventEmitter from './event_emitter';
import config from './config';
import md5 from './md5';

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
    return !!this.session && !!this.session.key;
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
      this.setSession(session);
    });
  }
  
  // fetch session and validate token
  validateToken(token, callback) {
    this.apiRequest('auth.getSession', {token: token})
      .done(function(data) {
        if (data.session && data.session.key) {
          callback(data.session);
        } else {
          Raven.captureMessage('Failed last.fm login', {
            extra: {
              data: data
            }
          });
          callback(false);
        }        
      })
      .fail(function(xhr) {
        Raven.captureMessage('Failed last.fm login', {
          extra: {
            data: xhr.responseText
          }
        });
        callback(false);
      });
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
    if (!session) {
      return;
    }
    
    chrome.storage.sync.set({'lastSession': session});
  }
  
  deleteSession() {
    chrome.storage.sync.set({'lastSession': null});
  }
  
  apiRequest(method, params) {
    let requirePost = ['track.love', 'track.scrobble', 'track.unlove', 'track.updateNowPlaying'];
    
    params.method = method;
    params.api_key = config.lastKey;
    
    if (requirePost.indexOf(method) >= 0) {
      params.sk = this.session.key;
      params.api_sig = this.getApiSignature(params);
    }
    
    return $.ajax({
      url: config.lastAPI + '?format=json',
      method: (requirePost.indexOf(method) >= 0 ? 'POST' : 'GET'),
      data: params
    });
  }
  
  getApiSignature(params) {
    let keys = [],
        paramString = '';

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    
    keys.sort();
    
    keys.forEach(function(key) {
      paramString += key + params[key].toString();
    });

    return md5(unescape(encodeURIComponent(paramString + config.lastSecret)));
  }
  
  getTrackInfo(track, artist, callback) {
    if (!this.hasToken()) {
      return callback(false);
    }
    
    let data = {
      track: track,
      artist: artist,
      username: this.session.name
    };
    
    this.apiRequest('track.getInfo', data)
      .done(function(data) {
        callback(data);
      })
      .fail(function() {
        callback(false);
      });
  }
  
  scrobble(track, artist, album, timestamp, mbid, callback) {
    if (!this.hasToken()) {
      return callback(false);
    }
    
    let data = {
      track: track,
      artist: artist,
      timestamp: timestamp
    };
    
    if (mbid) {
      data.mbid = mbid;
    }
    
    if (album) {
      data.album = album;
    }
    
    this.apiRequest('track.scrobble', data)
      .done(function(data) {
        callback(data);
      })
      .fail(function() {
        callback(false);
      });
  }
  
  updateNowPlaying(track, artist, album, mbid, callback) {
    if (!this.hasToken()) {
      return callback(false);
    }
    
    let data = {
      track: track,
      artist: artist
    };
    
    if (mbid) {
      data.mbid = mbid;
    }
    
    if (album) {
      data.album = album;
    }
    
    this.apiRequest('track.updateNowPlaying', data)
      .done(function(data) {
        callback(data);
      })
      .fail(function() {
        callback(false);
      });
  }
}

export default LastApi;