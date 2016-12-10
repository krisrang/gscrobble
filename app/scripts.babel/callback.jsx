/* global React, ReactDOM */

const model = chrome.extension.getBackgroundPage();

class Callback extends React.Component {
  constructor() {
    super();
    
    this.state = {
      signedIn: null,
    };
    
    // this.translations = util.translations('loveTrack', 'unLoveTrack', 'skipTrack', 'unSkipTrack', 'scrobbles', 'listeners');
  }
  
  componentDidMount() {
    model.lastApi.addListener('signedOut', this.onLastTokenChanged.bind(this));
    model.lastApi.addListener('signedIn', this.onLastTokenChanged.bind(this));
    
    let token = window.location.search.split('=')[1];
    model.lastApi.setToken(token);
  }
  
  shouldComponentUpdate () {
    return true;
  }
  
  onLastTokenChanged() {
    this.setState({signedIn: model.lastApi.hasToken()});
  }
  
  render() {
    if (this.state.signedIn === null) {
      return <div><h1>{'Processing token'}</h1></div>;
    } else if (this.state.signedIn) {
      return <div><h1>{'Signed in'}</h1></div>;
    } else if (!this.state.signedIn) {
      return <div><h1>{'Invalid token'}</h1></div>;
    }
  }
}

ReactDOM.render(<Callback />, document.getElementById('contents'));