import React, { Component } from 'react';
import {BrowserRouter , Route} from 'react-router-dom';
import AppTabs from './AppTabs';
class App extends Component {
  render() {
    return (
      <BrowserRouter >
        <Route path="/" exact component={AppTabs} />
      </BrowserRouter >
    );
  }
}

export default App;
