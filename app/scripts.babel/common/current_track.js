import EventEmitter from './event_emitter';

class Base {}
class CurrentTrack extends EventEmitter(Base) {
  constructor() {
    super();
    this.current = null;
  }
  
  setCurrent(track) {
    this.current = track;    
    this.emit('changed', track);
  }
  
  getCurrent() {
    return this.current;
  }
}

export default CurrentTrack;