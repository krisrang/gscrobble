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
  }
  
  differentTrack(track) {
    return this.album !== track.album || this.artist !== track.artist || this.title !== track.title;
  }
  
  playingChanged(track) {
    return this.playing !== track.playing;
  }
}

export default Track;