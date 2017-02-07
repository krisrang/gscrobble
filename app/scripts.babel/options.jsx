import config from './common/config';

Raven.config(config.ravenDSN).install();

class Options extends React.Component {
  shouldComponentUpdate () {
    return false;
  }
  
  render() {
    return <div><h1>{'Test'}</h1></div>;
  }
}

ReactDOM.render(<Options />, document.getElementById('contents'));