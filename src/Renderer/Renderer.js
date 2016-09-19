//@flow

import React, { Component } from 'react';
import PIXI from 'pixi.js/bin/pixi.min.js';
import './Renderer.css';

class Renderer extends Component {
  /**
  * Define our prop types
  **/
  // static propTypes = {
  //   zoomLevel: PropTypes.number.isRequired
  // };

  constructor( props ) {
    super(props);

    //bind our animate function
    this.animate = this.animate.bind(this);
    //bind our zoom function
    this.updateZoomLevel = this.updateZoomLevel.bind(this);
  }

  /**
  * In this case, componentDidMount is used to grab the Renderer container ref, and
  * and hook up the PixiJS renderer
  **/
  componentDidMount() {
    //Setup PIXI Renderer in componentDidMount
    this.renderer = PIXI.autoDetectRenderer(1366, 768,
    {
      antialias: false,
      transparent: false,
      resolution: 1
    });
    this.refs.gameRenderer.appendChild(this.renderer.view);

    // create the root of the scene graph
    this.stage = new PIXI.Container();
    this.stage.width = 1366;
    this.stage.height = 768;
    let self = this;

    var setup = function() {
      var sprite = new PIXI.Sprite(
        PIXI.loader.resources[lalala].texture
      );
      self.stage.addChild(sprite);
      self.animate();
    }

    PIXI.loader
        .add(lalala)
        .load(setup);

 }
  /**
  * shouldComponentUpdate is used to check our new props against the current
  * and only update if needed
  **/
  shouldComponentUpdate(nextProps, nextState) {
    //this is easy with 1 prop, using Immutable helpers make
    //this easier to scale

    return nextProps.zoomLevel !== this.props.zoomLevel;
  }
  /**
  * When we get new props, run the appropriate imperative functions
  **/
  componentWillReceiveProps(nextProps) {
    this.updateZoomLevel(nextProps);
  }

  /**
  * Update the stage "zoom" level by setting the scale
  **/
  updateZoomLevel(props) {
    this.stage.scale.x = props.zoomLevel;
    this.stage.scale.y = props.zoomLevel;
  }

 /**
 * Animation loop for updating Pixi Renderer
 **/

  animate() {
    // render the stage container
    this.renderer.render(this.stage);
    this.frame = requestAnimationFrame(this.animate);
  }

  /**
  * Render our container that will store our PixiJS game Renderer. Store the ref
  **/

  render() {
    return (
      <div className="pixi-Renderer-container" ref="gameRenderer"></div>
    );
  }
}

export default Renderer;
