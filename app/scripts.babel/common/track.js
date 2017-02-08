import util from './util';

class Track {
  constructor(data, base) {
    this.base = base;
    
    this.album = data.album;
    this.artist = data.artist;
    this.title = data.title;
    this.duration = Math.round(data.duration / 1000);
    this.elapsed = Math.round(data.elapsed / 1000);
    this.playing = data.playing;
    this.thumbed = data.thumbed;
    this.defaultImage = data.defaultImage;
    this.listeners = '-';
    this.playCount = '-';    
    this.loved = false;    
    this.mbid = null;    
    this.loved = null;
    this.skip = null;
    
    this.scrobbled = false;
    this.scrobbling = false;
    this.updatingNowPlaying = false;
    this.updatedNowPlaying = 0;
    this.loving = false;
    
    this.progress = util.percent(data.elapsed, data.duration);
    this.started = Math.round(Date.now() / 1000) - this.elapsed;
    
    window.lastApi.addListener('signedIn', this.signedIn.bind(this));
    this.updateTrackInfo();
    this.updateNowPlaying();
  }
  
  trackChanged(data) {
    if (this.album !== data.album || this.artist !== data.artist || this.title !== data.title) {
      return true;
    }
    
    return false;
  }
  
  playingChanged(data) {
    if (this.playing !== data.playing) {      
      this.playing = data.playing;
      
      if (this.playing) {
        this.updateNowPlaying();
      }
      
      return true;
    }
    
    return false;
  }
  
  thumbedChanged(data) {
    if (this.thumbed !== data.thumbed) {
      this.thumbed = data.thumbed;
      return true;
    }
    
    return false;
  }
  
  progressChanged(data) {    
    if (this.elapsed !== data.elapsed) {
      this.elapsed = data.elapsed;
      this.progress = util.percent(data.elapsed, data.duration);
      
      this.updateNowPlaying();
      if (this.progress >= 40) {
        this.scrobble();
      }
      return true;
    }
    
    return false;
  }
  
  toggleLove() {
    if (this.loved) {
      this.unLoveTrack();
    } else {
      this.loveTrack();
    }
  }
  
  toggleSkip() {
    this.skip = !this.skip;
  }
  
  signedIn() {
    this.updateTrackInfo();
    this.updateNowPlaying();
  }
  
  updateTrackInfo() {
    window.lastApi.getTrackInfo(this.title, this.artist, (result) => {
      if (result && result.track) {
        this.listeners = result.track.listeners;
        this.playCount = result.track.userplaycount || 0;
        this.mbid = result.track.mbid;
        this.loved = result.track.userloved === '1';
      }
    });
  }
  
  scrobble() {
    if (this.scrobbled || this.scrobbling || this.skip) {
      return;
    }
    
    this.scrobbling = true;
    
    window.lastApi.scrobble(this.title, this.artist, this.album, this.started, this.mbid, (result) => {
      if (result && result.scrobbles && result.scrobbles['@attr'].accepted > 0) {
        this.scrobbled = true
      } else {
        this.scrobbled = false
        this.scrobbling = false;
      }
    });
  }
  
  updateNowPlaying() {
    if (!this.playing || this.skip || this.scrobbled || this.scrobbling || this.updatingNowPlaying || this.updatedNowPlaying > Date.now() - 15000) {
      return;
    }
    
    this.updatingNowPlaying = true;
    
    window.lastApi.updateNowPlaying(this.title, this.artist, this.album, this.mbid, (result) => {
      if (result && result.nowplaying) {
        this.updatingNowPlaying = false;
        this.updatedNowPlaying = Date.now();
      }
    });
  }
  
  loveTrack() {
    if (this.loving) {
      return;
    }
    
    this.loving = true;
    
    window.lastApi.loveTrack(this.title, this.artist, (result) => {
      this.loving = false;
      
      if (result) {        
        this.loved = true;
      }
      
      this.base.emit('lovingChanged', this);
    });
  }
  
  unLoveTrack() {
    if (this.loving) {
      return;
    }
    
    this.loving = true;
    
    window.lastApi.unLoveTrack(this.title, this.artist, (result) => {
      this.loving = false;
      
      if (result) {
        this.loved = false;        
      }
      
      this.base.emit('lovingChanged', this);
    });
  }
}

export default Track;