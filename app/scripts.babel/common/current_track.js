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
      this.current = new Track(data);
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
}

export default CurrentTrack;