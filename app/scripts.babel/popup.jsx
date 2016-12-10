/* global React, ReactDOM, Raven */
import config from './common/config';
import util from './common/util';

Raven.config(config.ravenDSN).install();

const model = chrome.extension.getBackgroundPage();

const NotPlayingView = function() { 
  let text = chrome.i18n.getMessage('nothingPlaying');
  return <div className="notplaying">{text}</div>;
};

const HeaderView = function(props) { 
  return (
    <div className="header">
      <span>{props.title}</span>
    </div>
  );
};

HeaderView.propTypes = {
  title: React.PropTypes.string
};

class SignedOutView extends React.PureComponent {
  constructor() {
    super();
    
    this.translations = util.translations('loveTrack', 'unLoveTrack', 'skipTrack', 'unSkipTrack', 'scrobbles', 'listeners');    
    this.handleSigninClick = this.handleSigninClick.bind(this);
  }
  
  handleSigninClick() {
    model.lastApi.openAuth();
  }
  
  render() {
    return (
      <div>
        <button onClick={this.handleSigninClick}>{'Sign in'}</button>
      </div>
    );
  }
}

class NowPlayingView extends React.Component {
  constructor() {
    super();
    
    this.state = {
      loved: false,
      skipped: false
    };
    
    this.translations = util.translations('loveTrack', 'unLoveTrack', 'skipTrack', 'unSkipTrack', 'scrobbles', 'listeners');
    
    this.handleLoveClick = this.handleLoveClick.bind(this);
    this.handleSkipClick = this.handleSkipClick.bind(this);
  }
  
  shouldComponentUpdate() {
    return true;
  }
  
  handleLoveClick() {
    this.setState({loved: !this.state.loved});
  }
  
  handleSkipClick() {
    this.setState({skipped: !this.state.skipped});
  }
  
  render() {
    let albumArtStyle = {};
    
    if (this.props.track && this.props.track.defaultImage) {
      albumArtStyle = {backgroundImage: 'url(' + this.props.track.defaultImage.replace('s90-c', 's350-c') + ')'};
    }
    
    return (
      <div className="nowplaying">
        <div className="albumArt" style={albumArtStyle} />
        <div className="artist">{this.props.track.artist}</div>
        <div className="title" title={this.props.track.title}>
          {this.props.track.title}
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
        
        <ProgressView progress={this.props.track.progress} />
      </div>
    );
  }
}

NowPlayingView.propTypes = {
  track: React.PropTypes.number
};

class ProgressView extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.progress !== nextProps.progress;
  }
  
  render() {
    let cssClass = 'bar',
        style = {width: this.props.progress + '%'};
    
    if (this.props.progress > 40) {
      cssClass += ' scrobbled';
    }
    
    return (
      <div className="progress">
        <div className={cssClass} style={style} />
      </div>
    );
  }
}

ProgressView.propTypes = {
  progress: React.PropTypes.number
};

class Popup extends React.Component {
  constructor() {
    super();
    
    let track = model.currentTrack.getCurrent();
    this.state = {
      currentTrack: track,
      signedIn: model.lastApi.hasToken()
    };
    
    this.translations = util.translations('appName');
  }
  
  componentDidMount() {
    model.currentTrack.addListener('trackChanged', this.onTrackChanged.bind(this));
    model.currentTrack.addListener('playingChanged', this.onTrackChanged.bind(this));
    model.currentTrack.addListener('progressChanged', this.onTrackChanged.bind(this));
    model.lastApi.addListener('signedOut', this.onLastTokenChanged.bind(this));
    model.lastApi.addListener('signedIn', this.onLastTokenChanged.bind(this));
  }
  
  shouldComponentUpdate() {
    return true;
  }
  
  onTrackChanged(track) {
    this.setState({currentTrack: track});
  }
  
  onLastTokenChanged() {
    this.setState({signedIn: model.lastApi.hasToken()});
  }
  
  render() {
    let headerTitle = this.translations['appName'];
    
    if (!this.state.signedIn) {
      return (
        <div>
          <HeaderView title={headerTitle} />
          <SignedOutView />
        </div>
      );
    } else if (this.state.currentTrack && this.state.currentTrack.playing) {
      headerTitle = headerTitle + ' - Now Playing';
      
      return (
        <div>
          <HeaderView title={headerTitle} />
          <NowPlayingView track={this.state.currentTrack} />          
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
