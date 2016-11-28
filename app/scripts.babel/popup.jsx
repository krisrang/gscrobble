/* global React, ReactDOM, Raven */
import config from './common/config';

Raven.config(config.ravenDSN).install();

const model = chrome.extension.getBackgroundPage();

class HeaderView extends React.Component {  
  constructor() {
    super();
    this.state = {
      title: chrome.i18n.getMessage('appName')
    };
  }
  
  shouldComponentUpdate() {
    return false;
  }
  
  render() {
    return (
      <div className="header">
        <img src="images/google-w.png" />
        <span>{this.state.title}</span>
      </div>
    );
  }
}

const NotPlayingView = function() { 
  return <div className="notplaying">{'Nothing playing'}</div>;
};

class Popup extends React.Component {
  constructor() {
    super();
    this.state = {
      currentTrack: model.currentTrack.getCurrent()
    };
  }
  
  componentDidMount() {
    model.currentTrack.addListener('changed', this.onTrackChanged.bind(this));
  }
  
  shouldComponentUpdate() {
    return true;
  }
  
  onTrackChanged(track) {
    this.setState({currentTrack: track});
  }
  
  render() {
    if (this.state.currentTrack && this.state.currentTrack.playing) {
      return (
        <div>
          <HeaderView />

          <div className="nowplaying">
            <img src={this.state.currentTrack.defaultImage} />
            <div className="artist">{this.state.currentTrack.artist}</div>
            <div
              className="title"
              title={this.state.currentTrack.title}
            >
              {this.state.currentTrack.title}
            </div>            
            <div className="controls">{'Controls'}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <HeaderView />
          <NotPlayingView />
        </div>
      );
    }
  }
}

ReactDOM.render(<Popup />, document.getElementById('contents'));
