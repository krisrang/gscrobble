import EventEmitter from './event_emitter';

class Base {}
class CurrentTrack extends EventEmitter(Base) {
  constructor() {
    super();
    this.current = null;
  }
  
  updateTrack(track) {
    if (!this.current || this.current.differentTrack(track)) {
      this.current = track;
      this.emit('trackChanged', track);
    } else if (this.current.playingChanged(track)) {
      this.current.playing = track.playing;
      this.emit('playingChanged', track);
    }
  }
  
  getCurrent() {
    return this.current;
  }
}

export default CurrentTrack;