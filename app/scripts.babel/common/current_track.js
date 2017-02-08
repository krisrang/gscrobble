import EventEmitter from './event_emitter';
import Track from './track';

class Base {}
class CurrentTrack extends EventEmitter(Base) {
  constructor() {
    super();
    this.current = null;
  }
  
  updateTrack(data) {
    if (!this.current || this.current.trackChanged(data)) {
      this.current = new Track(data, this);
      this.emit('trackChanged', this.current);
    } else if (this.current.playingChanged(data)) {
      this.emit('playingChanged', this.current);
    } else if (this.current.progressChanged(data)) {
      this.emit('progressChanged', this.current);
    } else if (this.current.thumbedChanged(data)) {
      this.emit('thumbedChanged', this.current);
    }
  }
  
  getCurrent() {
    return this.current;
  }
  
  toggleLove() {
    this.current.toggleLove();
    this.emit('lovingChanged', this.current);
  }
  
  toggleSkip() {
    this.current.toggleSkip();
    this.emit('skipChanged', this.current);
  }
}

export default CurrentTrack;