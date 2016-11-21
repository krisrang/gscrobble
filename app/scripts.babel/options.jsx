/* global React */
'use strict';

class Options extends React.Component {
  shouldComponentUpdate () {
    return false;
  }
  
  render() {
    return <div><h1>{'Test'}</h1></div>;
  }
}

ReactDOM.render(<Options />, document.getElementById('accessgranted'));