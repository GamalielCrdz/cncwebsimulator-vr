import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { StereoEffect } from "three/examples/jsm/effects/StereoEffect";
import { GCodeParser, GCodeRenderer } from "../lib";
import Controls from "./controls";
import Editor from "./editor";
import { notification } from "antd";
import { CNCModel } from "../lib/cncModel";
var Stats = require("stats-js");
var MemoryStats = require("memory-stats");

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.memPanel = new MemoryStats();
    this.fpsPanel = new Stats();
    this.cncModel = new CNCModel("cncmodel1");
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.effect = null;
    this.renderElement = React.createRef();

    this.gCodeRenderer = null;
    this.currentgcodeObject = null;
    this.targetPoint = new THREE.Vector3(0, 0, 0);
    this.pause = true;

    this.inputFile = React.createRef();

    this.state = {
      index: 0,
      editorValue: "",
      currentLine: 0,
      height: window.innerHeight,
      activeVr: false
    };
  }

  async componentDidMount() {
    this.sceneSetup();
    await this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
    window.addEventListener("deviceorientation", e => {
      const alphaRotation = e.alpha ? e.alpha * (Math.PI / 180) : 0;
      this.scene.rotation.y = -alphaRotation;
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.removeEventListener("deviceorientation", this.handleWindowResize);
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
	  this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 260, 400);
    // if (this.props.isMobile) {
    // this.controls = new DeviceOrientationControls(this.camera);
    // } else {
    // OrbitControls allow a camera to orbit around the object
    this.controls = new OrbitControls(this.camera, this.renderElement.current);
    //    this.controls. = -1;
    this.controls.enableKeys = true;
    // this.controls.panSpeed = -1;
    // this.controls.autoRotateSpeed = -1;
    //this.controls.maxDistance = 2000;
    //this.controls.minDistance = 2;
    // this.controls.maxAzimuthAngle = Math.PI/2;
    // this.controls.minAzimuthAngle = -Math.PI/2;
    //this.controls.maxPolarAngle = Math.PI/2
    // this.controls.autoRotate = true;
    // }

    // for vr effect
    this.effect = new StereoEffect(this.renderer);
    this.effect.setSize(width, height);

    this.renderElement.current.appendChild(this.renderer.domElement); // mount using React ref
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#170d2f");
  };

  /**
   * this function add to the scene the custom objects
   * like light, cnc model, etc..
   */
  addCustomSceneObjects = async () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.21);
    ambientLight.position.set(0, 0, -100);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, "#286e7d", 0.2);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(0, 7, 7);
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

    // const helper = new THREE.DirectionalLightHelper(dirLight, 5 );
    // this.scene.add( helper );

    //The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(1000);
    this.scene.add(axesHelper);

    let ground = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(5000, 5000),
      new THREE.MeshPhongMaterial({
        color: "#286e7d",
        depthWrite: true,
        side: THREE.DoubleSide
      })
    );
    ground.rotateX(THREE.Math.degToRad(90));
    ground.receiveShadow = true;
    this.scene.add(ground);

    const modelo = await this.cncModel.getCNCModel();
    modelo.rotateOnAxis(
      new THREE.Vector3(1, 0, 0).normalize(),
      -Math.PI / 2
    );
    modelo.position.y = 82.8;
    this.scene.add(modelo);

    this.fpsPanel.domElement.style.cssText =
      "position:absolute; top:0px; left:200px; float:left; display:block";
    this.fpsPanel.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custo

    this.memPanel.domElement.style.position = "absolute";
    this.memPanel.domElement.style.top = "0px";
    this.memPanel.domElement.style.left = "90px";
    this.renderElement.current.appendChild(this.memPanel.domElement);
    this.renderElement.current.appendChild(this.fpsPanel.dom);

    return true;
  };

  startAnimationLoop = () => {
    if (
      this.gCodeRenderer &&
      this.gCodeRenderer.index <= this.gCodeRenderer.viewModels.length - 1 &&
      this.pause
    ) {
      if (
        this.gCodeRenderer.index ===
        this.gCodeRenderer.viewModels.length - 1
      ) {
        this.setCNCModelInitialPosition();
        this.gCodeRenderer = null;
        this.targetPoint = new THREE.Vector3(0, 0, 0);
        this.pause = true;
        notification["success"]({
          message: "Finalizado",
          description: "Finalizo el proceso"
        });
      } else {
        this.gCodeRenderer.setIndex(this.gCodeRenderer.index + 1);
        const lastVerticeIndex = this.gCodeRenderer.feedGeo.vertices.length - 1;
        const lastVertice = this.gCodeRenderer.feedGeo.vertices[
          lastVerticeIndex
        ];

        this.handleCNCModelMotion({
          x: lastVertice.x,
          y: lastVertice.y,
          z: lastVertice.z,
        });
        this.setState({
          currentLine:
            this.gCodeRenderer.viewModels[this.gCodeRenderer.index].code
              .words[0].lineNumber - 1,
          sliderValue:
            (this.gCodeRenderer.index / this.gCodeRenderer.viewModels.length) *
            100
        });
      }
    }
    this.memPanel.update();

    this.controls.update();
		this.fpsPanel.begin();

    this.state.activeVr
      ? this.effect.render(this.scene, this.camera)
      : this.renderer.render(this.scene, this.camera);
      this.fpsPanel.end();

    // The window.requestAnimationFrame() method tells the browser that you wish to perform
    // an animation and requests that the browser call a specified function
    // to update an animation before the next repaint
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  handleCNCModelMotion = ({ x, y, z }) => {
    console.log({ x, y, z });
    
    // if (this.xAxis && this.zAxis && this.body && this.nut) {
    this.cncModel.setCNCPosition({ x, y, z});

    // this.yAxis.position.z = this.targetPoint.z;

    this.currentgcodeObject.position.z = this.targetPoint.z;
    // }

    this.targetPoint.x = x * 0.5;
    this.targetPoint.y = y * 0.5 - 35;
    this.targetPoint.z = z * 0.5 + 35;
  };

  setCNCModelInitialPosition() {
    this.xAxis.position.x = 0;
    this.zAxis.position.x = 0;
    this.zAxis.position.y = -35;
    this.body.position.x = 0;
    this.body.position.y = -35;
    this.nut.position.x = 0;
    this.nut.position.y = -35;
    this.yAxis.position.z = 35;
  }

  /**
   * This function is called every time that
   * the screen change of dimensions
   */
  handleWindowResize = () => {
    const width = this.props.toggle
      ? window.innerWidth - 350
      : window.innerWidth;
    const height = window.innerHeight - this.props.navbarHeigth;
    console.log(height);

    this.setState({ height });

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  onLoadGCode = (gcode = "") => {
    const gp = new GCodeParser();
    const gm = gp.parse(gcode);
    this.gCodeRenderer = new GCodeRenderer();

    // if previously exist a object, remove it
    if (!!this.currentgcodeObject) {
      this.scene.remove(this.currentgcodeObject);
    }

    this.currentgcodeObject = this.gCodeRenderer.render(gm);
    this.currentgcodeObject.scale.set(0.5, 0.5, 0.5);
    this.currentgcodeObject.position.y = 85
    this.currentgcodeObject.rotateOnAxis(
      new THREE.Vector3(1, 0, 0).normalize(),
      -Math.PI / 2
    );
    this.currentgcodeObject.name = "currentgcodeObject";
    this.scene.add(this.currentgcodeObject);
  };

  handlePlay = gcode => {
    if (gcode && gcode.length > 0) {
      this.onLoadGCode(gcode);
    } else {
      notification["info"]({
        message: "No hay codigo",
        description: "No hay gcode"
      });
    }
  }

  handleSlider = percent => {
    if (this.gCodeRenderer && this.gCodeRenderer.viewModels.length) {
      const index = Math.floor(
        ((this.gCodeRenderer.viewModels.length - 1) * percent) / 100
      );
      if (index <= this.gCodeRenderer.viewModels.length - 1) {
        this.gCodeRenderer.setIndex(index);
        this.setState({
          sliderValue:
            (this.gCodeRenderer.index / this.gCodeRenderer.viewModels.length) *
            100
        });
      }
    }
  };

  setEditorValue = value => {
    this.setState({ editorValue: value });
  };

  requestVR = () => {
    this.setState({ activeVr: !this.state.activeVr });
  };

  render() {
    const { navbarHeigth, style } = this.props;
    const { height } = this.state;

    return (
      <div style={{ ...style, height: height }} ref={this.renderElement} />
    );
  }
}
