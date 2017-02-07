/* global React, ReactDOM, Raven */
import config from './common/config';
import util from './common/util';

Raven.config(config.ravenDSN).install();

const model = chrome.extension.getBackgroundPage();

class Callback extends React.Component {
  constructor() {
    super();
    
    this.state = {
      signedIn: null,
    };
    
    this.translations = util.translations('signedIn', 'signinError', 'appName');
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
      return (
        <div className="callback">
          <h1><img src="images/icon-32.png" /> {this.translations['appName']}</h1>
          <div><img className="spinner" src="images/spinner.svg" /></div>
        </div>
      );
    } else if (this.state.signedIn) {
      return (
        <div className="callback">
          <h1><img src="images/icon-32.png" /> {this.translations['appName']}</h1>
          <div><i aria-hidden="true" className="fa fa-check" /> {this.translations['signedIn']}</div>
        </div>
      );
    } else {
      return (
        <div className="callback">
          <h1><img src="images/icon-32.png" /> {this.translations['appName']}</h1>
          <div><i aria-hidden="true" className="fa fa-times" /> {this.translations['signinError']}</div>
        </div>
      );
    }
  }
}

ReactDOM.render(<Callback />, document.getElementById('contents'));