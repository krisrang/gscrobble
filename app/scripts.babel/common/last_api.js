import config from './config';

class LastApi {
  constructor() {
    this.apiRoot = config.lastAPI;
    this.key = config.lastKey;
    this.secret = config.lastSecret;
  }
  
  static openAuth() {
    chrome.tabs.create({
      url: 'http://www.last.fm/api/auth/?api_key=' + config.lastKey + '&cb=' + chrome.extension.getURL('callback.html')
    });
  }
}

export default LastApi;