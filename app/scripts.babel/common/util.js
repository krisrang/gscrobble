let util = {
  roundTwo: function(value) {
    return Math.round(value * 100) / 100;
  },
  translation: function(key) {
    return chrome.i18n.getMessage(key);
  },
  translations: function(...keys) {
    let strings = {};
    
    if (keys && keys.length > 0) {
      keys.forEach(function(key) {
        strings[key] = chrome.i18n.getMessage(key);
      })
    }
    
    return strings;
  },
  percent: function(value, total) {
    return this.roundTwo(value / (total / 100));
  }
}

export default util;
