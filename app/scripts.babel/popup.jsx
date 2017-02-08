import config from './common/config';
import util from './common/util';

Raven.config(config.ravenDSN).install();

const model = chrome.extension.getBackgroundPage();

const NotPlayingView = function() { 
  let text = chrome.i18n.getMessage('nothingPlaying');
  return <div className="notplaying">{text}</div>;
};

class HeaderView extends React.PureComponent {
  constructor() {
    super();
     
    this.handleOptionsClick = this.handleOptionsClick.bind(this);
  }
  
  handleOptionsClick() {
    chrome.runtime.openOptionsPage();
  }
  
  render() {
    return (
      <div className="header">
        <span>{this.props.title}</span>
        <a id="options" onClick={this.handleOptionsClick}>
          <i aria-hidden="true" className="fa fa-cog" />
        </a>
      </div>
    );
  }
}

HeaderView.propTypes = {
  title: React.PropTypes.string
};

class SignedOutView extends React.PureComponent {
  constructor() {
    super();
    
    this.translations = util.translations('signIn');    
    this.handleSigninClick = this.handleSigninClick.bind(this);
  }
  
  handleSigninClick() {
    model.lastApi.signIn();
  }
  
  render() {
    return (
      <div className="signedOut">
        <button onClick={this.handleSigninClick}>{this.translations['signIn']}</button>
      </div>
    );
  }
}

class NowPlayingView extends React.Component {
  constructor() {
    super();
    
    this.translations = util.translations('loveTrack', 'unLoveTrack', 'skipTrack', 'unSkipTrack', 'scrobbles', 'listeners');
    
    this.handleLoveClick = this.handleLoveClick.bind(this);
    this.handleSkipClick = this.handleSkipClick.bind(this);
  }
  
  shouldComponentUpdate() {
    return true;
  }
  
  handleLoveClick() {
    model.currentTrack.toggleLove();
  }
  
  handleSkipClick() {
    model.currentTrack.toggleSkip();
  }
  
  render() {
    let albumArtStyle = {},
        lovePart;
    
    if (this.props.track && this.props.track.defaultImage) {
      let img = this.props.track.defaultImage;
      img = img.replace('s90-c', 's350-c');
      albumArtStyle = {backgroundImage: 'url(' + img + ')'};
    }
    
    if (this.props.track.loving || this.props.track.loved === null) {
      lovePart = (
        <a className="loading">
          <img src="images/spinner-w.svg" />
        </a>
      );
    } else {
      lovePart = (
        <a
          className={this.props.track.loved ? 'active' : 'inactive'}
          id="loveTrackBtn"
          onClick={this.handleLoveClick}
          title={this.props.track.loved ? this.translations['unLoveTrack'] : this.translations['loveTrack']}
        >
          <i aria-hidden="true" className="fa fa-heart-o" />
        </a>
      );
    }
    
    return (
      <div className="nowplaying">
        <div className="albumArt" style={albumArtStyle} />
        <div className="artist">{this.props.track.artist}</div>
        <div className="title" title={this.props.track.title}>
          {this.props.track.title}
        </div>            
        <div className="controls">
          {lovePart}
                    
          <a
            className={this.props.track.skip && 'active'}
            id="skipTrackBtn"
            onClick={this.handleSkipClick}
            title={this.props.track.skip ? this.translations['unSkipTrack'] : this.translations['skipTrack']}
          >
            <i aria-hidden="true" className="fa fa-times" />
          </a>
        </div>
        <div className="stats">
          <div className="scrobbles">
            <span className="label">{this.translations['scrobbles']}</span>
            <span className="value">{this.props.track.playCount}</span>
          </div>
          <div className="listeners">
            <span className="label">{this.translations['listeners']}</span>
            <span className="value">{this.props.track.listeners}</span>
          </div>
        </div>
        
        <ProgressView progress={this.props.track.progress} skip={this.props.track.skip} />
      </div>
    );
  }
}

NowPlayingView.propTypes = {
  track: React.PropTypes.shape({
    defaultImage: React.PropTypes.string,
    artist: React.PropTypes.string,
    title: React.PropTypes.string,
    progress: React.PropTypes.number,
    skip: React.PropTypes.bool,
    loved: React.PropTypes.bool,
    loving: React.PropTypes.bool,
    playCount: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    listeners: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
  })
};

class ProgressView extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.progress !== nextProps.progress;
  }
  
  render() {
    let cssClass = 'bar',
        style = {width: this.props.progress + '%'};
    
    if (this.props.progress > 40 && !this.props.skip) {
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
  progress: React.PropTypes.number,
  skip: React.PropTypes.bool
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
    model.currentTrack.addListener('lovingChanged', this.onTrackChanged.bind(this));
    model.currentTrack.addListener('skipChanged', this.onTrackChanged.bind(this));
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
