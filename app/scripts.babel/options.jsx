import config from './common/config';
import util from './common/util';

Raven.config(config.ravenDSN).install();

const model = chrome.extension.getBackgroundPage();

class Options extends React.Component {
  constructor() {
    super();
    
    this.state = {
      signedIn: model.lastApi.hasToken(),
      session: model.lastApi.getSession(),
      lovePreference: 'gplay'
    };
    
    this.translations = util.translations('signIn', 'signOut', 'account');    
    this.handleSignoutClick = this.handleSignoutClick.bind(this);
    this.handleSigninClick = this.handleSigninClick.bind(this);
    this.handleLovePreferenceChange = this.handleLovePreferenceChange.bind(this);
  }
  
  componentDidMount() {
    model.lastApi.addListener('signedOut', this.onLastTokenChanged.bind(this));
    model.lastApi.addListener('signedIn', this.onLastTokenChanged.bind(this));
  }
  
  shouldComponentUpdate () {
    return true;
  }
  
  onLastTokenChanged() {
    this.setState({
      signedIn: model.lastApi.hasToken(),
      session: model.lastApi.getSession()
    });
  }
  
  handleSigninClick() {
    model.lastApi.signIn();
  }
  
  handleSignoutClick() {
    model.lastApi.signOut();
  }
  
  handleLovePreferenceChange(e) {
    this.setState({lovePreference: e.target.value});
    
    chrome.storage.sync.set({
      lovePreference: e.target.value
    });
  }
  
  render() {
    let accountPart;
    
    if (this.state.signedIn) {
      accountPart = (
        <div className="account">
          <div className="accountDetails">
            <div><i aria-hidden="true" className="fa fa-check" /> {'Account connected'}</div>
            <div>
              <strong>{'Username:'}</strong>
              {this.state.session.name}
            </div>
          </div>
          <button onClick={this.handleSignoutClick}>{this.translations['signOut']}</button>
        </div>
      );
    } else {
      accountPart = (
        <div className="account">
          <div className="accountDetails"><i aria-hidden="true" className="fa fa-times" /> {'Not connected'}</div>
          <button onClick={this.handleSigninClick}>{this.translations['signIn']}</button>
        </div>
      );
    }
    
    return (
      <div>
        <section>
          <h1>{'Last.fm account'}</h1>
          {accountPart}
          <div className="clearfix" />
        </section>
        <section>
          <h1>{'Options'}</h1>
          <div className="option">
            <label htmlFor="lovePreference">{'Love preference'}</label>
            <select name="lovePreference" onChange={this.handleLovePreferenceChange} value={this.state.lovePreference}>
              <option value="lastfm">{'Last.fm'}</option>
              <option value="gplay">{'Google Play'}</option>
            </select>
          </div>
        </section>
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById('contents'));