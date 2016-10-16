//@flow

import React, { Component } from 'react';
import Main from '../GameLogic/Core/Main';
import './Renderer.css';

class Renderer extends Component {
  renderData: [];

  constructor() {
    super();
    Main.setup();
    this.renderData = Main.render();
  }

  render() {
    console.log(this.renderData);
    return (
      this.renderData.map(function(cell) {
        return <div>xxx</div>;
      })
    );
  }
}

export default Renderer;
