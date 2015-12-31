import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const connect = (data) => C => (
  class Wrapped extends Component {
    render() {
      const props = {
        ...data,
        ...this.props
      };
      return <C {...props}/>;
    }
  }
)

class ScrollView extends Component {
  scrollTo(x = 0, y = 0) {
    window.scrollTo(x, y);
  }

  render() {
    const { children, ...rest } = this.props;
    return (
      <div ref="container" {...rest}>
        { children }
      </div>
    );
  }
}

const Box = ({ color }) => (
  <div style={{
    height: '500px',
    backgroundColor: color
  }}/>
);

const WrappedScrollView = connect({})(ScrollView);

class App extends Component {
  scrollTo(y) {
    this.refs.scrollView.scrollTo(0, y);
  }

  render() {
    return (
      <div>
        <div>
          <a onClick={this.scrollTo.bind(this, 0)}>
            One
          </a>
          <a onClick={this.scrollTo.bind(this, 500)}>
            Two
          </a>
          <a onClick={this.scrollTo.bind(this, 1000)}>
            Three
          </a>
        </div>
        <WrappedScrollView ref="scrollView">
          <Box color="red"/>
          <Box color="blue"/>
          <Box color="yellow"/>
        </WrappedScrollView>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));

