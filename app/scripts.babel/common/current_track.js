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
      this.emit('playingChanged', track);
    } else if (this.current.progressChanged(track)) {
      this.emit('progressChanged', track);
    }
  }
  
  getCurrent() {
    return this.current;
  }
}

export default CurrentTrack;