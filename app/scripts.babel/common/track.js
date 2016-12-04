import util from './util';

class Track {
  constructor(data) {
    this.album = data.album;
    this.artist = data.artist;
    this.duration = data.duration;
    this.elapsed = data.elapsed;
    this.title = data.title;
    this.playing = data.playing;
    this.thumbed = data.thumbed;
    this.defaultImage = data.defaultImage;
    
    this.loved = null;
    this.skipped = null;
    
    this.progress = util.roundTwo(data.elapsed / (data.duration / 100));
  }
  
  differentTrack(track) {
    return this.album !== track.album || this.artist !== track.artist || this.title !== track.title;
  }
  
  playingChanged(track) {
    if (this.playing !== track.playing) {
      this.playing = track.playing;
      return true;
    }
    
    return false;
  }
  
  progressChanged(track) {
    if (this.elapsed !== track.elapsed) {
      this.progress = util.roundTwo(track.elapsed / (track.duration / 100));
      return true;
    }
    
    return false;
  }
}

export default Track;