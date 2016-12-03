/* global React, ReactDOM, Raven */
import config from './common/config';

Raven.config(config.ravenDSN).install();

const model = chrome.extension.getBackgroundPage();

class HeaderView extends React.Component {  
  shouldComponentUpdate(nextProps) {
    return this.props.title !== nextProps.title;
  }
  
  render() {
    return (
      <div className="header">
        <span>{this.props.title}</span>
      </div>
    );
  }
}

HeaderView.propTypes = {
  title: React.PropTypes.string
};

const NotPlayingView = function() { 
  let text = chrome.i18n.getMessage('nothingPlaying');
  return <div className="notplaying">{text}</div>;
};

class Popup extends React.Component {
  constructor() {
    super();
    
    let track = model.currentTrack.getCurrent();
    this.state = {
      currentTrack: track,
      albumArtStyle: this.getTrackStyle(track),
      loved: false,
      skipped: false
    };
    
    this.translations = {};    
    ['appName', 'loveTrack', 'unLoveTrack', 'skipTrack', 'unSkipTrack', 'scrobbles', 'listeners'].forEach((key) => {
      this.translations[key] = chrome.i18n.getMessage(key);
    });
    
    this.handleLoveClick = this.handleLoveClick.bind(this);
    this.handleSkipClick = this.handleSkipClick.bind(this);
  }
  
  componentDidMount() {
    model.currentTrack.addListener('trackChanged', this.onTrackChanged.bind(this));
    model.currentTrack.addListener('playingChanged', this.onTrackChanged.bind(this));
  }
  
  shouldComponentUpdate() {
    return true;
  }
  
  onTrackChanged(track) {
    this.setState({currentTrack: track, albumArtStyle: this.getTrackStyle(track)});
  }
  
  getTrackStyle(track) {
    let style = {};
    
    if (track && track.defaultImage) {
      style = {backgroundImage: 'url(' + track.defaultImage.replace('s90-c', 's350-c') + ')'};
    }
    
    return style;
  }
  
  handleLoveClick() {
    this.setState({loved: !this.state.loved});
  }
  
  handleSkipClick() {
    this.setState({skipped: !this.state.skipped});
  }
  
  render() {
    let headerTitle = this.translations['appName'];
    
    if (this.state.currentTrack && this.state.currentTrack.playing) {
      headerTitle = headerTitle + ' - Now Playing';
      
      return (
        <div>
          <HeaderView title={headerTitle} />

          <div className="nowplaying">
            <div className="albumArt" style={this.state.albumArtStyle} />
            <div className="artist">{this.state.currentTrack.artist}</div>
            <div className="title" title={this.state.currentTrack.title}>
              {this.state.currentTrack.title}
            </div>            
            <div className="controls">
              <a
                className={this.state.loved ? 'active' : 'inactive'}
                id="loveTrackBtn"
                onClick={this.handleLoveClick}
                title={this.state.loved ? this.translations['unLoveTrack'] : this.translations['loveTrack']}
              >
                <i aria-hidden="true" className="fa fa-heart-o" />
              </a>
              
              <a
                className={this.state.skipped && 'active'}
                id="skipTrackBtn"
                onClick={this.handleSkipClick}
                title={this.state.skipped ? this.translations['unSkipTrack'] : this.translations['skipTrack']}
              >
                <i aria-hidden="true" className="fa fa-times" />
              </a>
            </div>
            <div className="stats">
              <div className="scrobbles">
                <span className="label">{this.translations['scrobbles']}</span>
                <span className="value">{'900'}</span>
              </div>
              <div className="listeners">
                <span className="label">{this.translations['listeners']}</span>
                <span className="value">{'9000K'}</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <HeaderView title={headerTitle} />
          <NotPlayingView />
        </div>
      );
    }
  }
}

ReactDOM.render(<Popup />, document.getElementById('contents'));
