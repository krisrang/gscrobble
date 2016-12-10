import util from './util';

class Track {
  constructor(data) {
    this.album = data.album;
    this.artist = data.artist;
    this.duration = Math.round(data.duration / 1000);
    this.elapsed = Math.round(data.elapsed / 1000);
    this.title = data.title;
    this.playing = data.playing;
    this.thumbed = data.thumbed;
    this.defaultImage = data.defaultImage;
    
    this.loved = null;
    this.skipped = null;
    
    this.progress = util.percent(data.elapsed, data.duration);
    this.started = Math.round(Date.now() / 1000) - this.elapsed;
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
      return true;
    }
    
    return false;
  }
}

export default Track;