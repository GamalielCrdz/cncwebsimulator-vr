import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { StereoEffect } from "three/examples/jsm/effects/StereoEffect";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { GCodeParser, GCodeRenderer } from "../lib";
import Controls from "./controls";

// Models for cnc
import baseShaftModel from "../assets/models/EjesBase.3mf";
import xAxisModel from "../assets/models/EjeX.3mf";
import yAxisModel from "../assets/models/EjeY.3mf";
import zAxisModel from "../assets/models/EjeZ.3mf";
import bodyModel from "../assets/models/Body.3mf";
import nutModel from "../assets/models/Nut.3mf";

export default class HomePage extends Component {
  constructor(props) {
    super(props);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.effect = null;
    this.currentgcodeObject = null;
    this.gCodeRenderer = null;
    this.baseShaft = null;
    this.xAxis = null;
    this.yAxis = null;
    this.zAxis = null;
    this.body = null;
    this.nut = null;
    this.targetPoint = new THREE.Vector3(0, 0, 0);

    this.renderElement = React.createRef();
    this.state = {
      index: 0,
    }
  }

  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  /**
   * this function build the scene and components (camera, controls)
   */
  sceneSetup = () => {
    // get container dimensions and use them for scene sizing
    const width = this.renderElement.current.clientWidth;
    const height = this.renderElement.current.clientHeight;

    // set the renderer propierties
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.gammaFactor = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    //
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
    //this.camera.position.set(0, -340, 250);
    this.camera.position.set(0, 200, 300);

    // OrbitControls allow a camera to orbit around the object
    this.controls = new OrbitControls(this.camera, this.renderElement.current);
    //    this.controls. = -1;
    this.controls.enableKeys = true;

    // for vr effect
    this.effect = new StereoEffect(this.renderer);
    this.effect.setSize(width, height);

    this.renderElement.current.appendChild(this.renderer.domElement); // mount using React ref
    this.scene = new THREE.Scene();
    this.scene.background = "#ffffff";
  };

  /**
   * this function add to the scene the custom objects
   * like light, cnc model, etc..
   */
  addCustomSceneObjects = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    ambientLight.position.set(0, 0, -100);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, "#dd8e4c", 0.38);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(0, 5.6, 7);
    dirLight.position.multiplyScalar(30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    const d = 225;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.bias = -0.0001;
    this.scene.add(dirLight);

    //The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(1000);
    this.scene.add(axesHelper);

    let ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(5000, 5000),
      new THREE.MeshPhongMaterial({
        color: "#dd8e4c",
        depthWrite: true,
        side: THREE.DoubleSide
      })
    );
    ground.position.y = -83;

    ground.rotateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), -Math.PI / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // add cnc model
    const models = [
      { model: baseShaftModel, value: 'baseShaft'},
      { model: xAxisModel, value: 'xAxis'},
      { model: yAxisModel, value: 'yAxis'},
      { model: zAxisModel, value: 'zAxis'},
      { model: bodyModel, value: 'body'},
      { model: nutModel, value: 'nut' }
    ];
    const cncModel = new THREE.Group();
    const threeMFLoader = new ThreeMFLoader();
    const CNCMaterial = new THREE.MeshStandardMaterial({
      color: "lightgray",
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
      flatShading: true
    });

    for (const modelObject of models) {
      threeMFLoader.load(modelObject.model, object => {
        object.traverse((child) => {
          child.children.forEach(function(item, index) {
            item.material = CNCMaterial;
          });
          child.castShadow = true;
        });
        object.rotateOnAxis(
          new THREE.Vector3(1, 0, 0).normalize(),
          -Math.PI / 2
        );

        // for some reason this models don't load correctly and need to set the position
        if (modelObject.value === 'nut' || modelObject.value === 'body') {
          object.position.set(0, 0, 35);
        }

        cncModel.add(object);
        
        // assign the object to the correspondent this variable
        this[modelObject.value] = object;
      });
    }

    this.scene.add(cncModel);
  };

  startAnimationLoop = () => {
    if (
      this.gCodeRenderer &&
      this.gCodeRenderer.index <= this.gCodeRenderer.viewModels.length-1
    ) {
      if (this.gCodeRenderer.index === this.gCodeRenderer.viewModels.length-1) {

      } else {
        this.gCodeRenderer.setIndex(this.gCodeRenderer.index + 1);
        this.setState({sliderValue: (this.gCodeRenderer.index/this.gCodeRenderer.viewModels.length)*100 });        
      }
    }

    this.controls.update();
    this.props.isMobile
      ? this.effect.render(this.scene, this.camera)
      : this.renderer.render(this.scene, this.camera);

    // The window.requestAnimationFrame() method tells the browser that you wish to perform
    // an animation and requests that the browser call a specified function
    // to update an animation before the next repaint
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  /**
   * This function is called every time that
   * the screen change of dimensions
   */
  handleWindowResize = () => {
    const width = this.renderElement.current.clientWidth;
    const height = this.renderElement.current.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  handleCNCModelMotion = () => {
    this.xAxis.position.x = this.targetPoint.x; 
    this.zAxis.position.x = this.targetPoint.x;
    this.body.position.x = this.targetPoint.x;
    this.nut.position.x = this.targetPoint.x;

    this.zAxis.position.y = this.targetPoint.y;
    this.body.position.y = this.targetPoint.y;
    this.nut.position.y = this.targetPoint.y;
 
    this.zAxis = this.targetPoint.z -35;

  }

  onLoadGCode = (gcode = "") => {
    //gcode = "G17 G20 G90 G94 G54\nG0 Z0.25\nX-0.5 Y0.\nZ0.1\nG01 Z0. F5.\nG02 X0. Y0.5 I0.5 J0. F2.5\nX0.5 Y0. I0. J-0.5\nX0. Y-0.5 I-0.5 J0.\nX-0.5 Y0. I0. J0.5\nG01 Z0.1 F5.\nG00 X0. Y0. Z0.25\n"
    const gp = new GCodeParser();
    const gm = gp.parse(gcode);
    this.gCodeRenderer = new GCodeRenderer();

    // if previously exist a object, remove it
    if (!!this.currentgcodeObject) {
      this.scene.remove(this.currentgcodeObject);
    }

    this.currentgcodeObject = this.gCodeRenderer.render(gm);
    this.currentgcodeObject.scale.set(0.5, 0.5, 0.5);
    this.currentgcodeObject.rotateOnAxis(
      new THREE.Vector3(1, 0, 0).normalize(),
      -Math.PI / 2
    );
    this.currentgcodeObject.name = "currentgcodeObject";
    this.scene.add(this.currentgcodeObject);
  };

  handlePlay = () => {
    const gcode = this.props.getEditorValue();
    this.onLoadGCode(gcode);
  };

  handleSlider = percent => {
    if (this.gCodeRenderer && this.gCodeRenderer.viewModels.length) {
      const index = Math.floor(
        ((this.gCodeRenderer.viewModels.length-1) * percent) / 100
      );
      if (index <= this.gCodeRenderer.viewModels.length-1) {
        this.gCodeRenderer.setIndex(index);
        this.setState({sliderValue: (this.gCodeRenderer.index/this.gCodeRenderer.viewModels.length)*100 });
      }
    }
  };

  render() {
    return (
      <div>
        <div
          style={{ minHeight: 650, height: "100%", width: "100%" }}
          ref={this.renderElement}
        />
        <Controls sliderValue={this.state.sliderValue} onPlay={this.handlePlay} onChangeSlider={this.handleSlider} />
      </div>
    );
  }
}
