import * as THREE from "three";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import CNCMODELS from "../lib/cncModels.json";
const modelsPath = require.context("../assets/models", true);

class CNCModel {
  constructor(modelName = "cncmodel2") {
    this.model = CNCMODELS.find(model=>model.name === modelName)
    this.body = null;
    this.xAxis = null;
    this.yAxis = null;
    this.zAxiz = null;
    this.body = null;
    this.nut = null;
    
  }

  getCNCModel = () => {
    const models = this.model.models;    
    const cncModel = new THREE.Group();

    for (const modelObject of models) {

      if (modelObject.loader === "3mf") {
        const threeMFLoader = new ThreeMFLoader();
        threeMFLoader.load(modelsPath("./" + modelObject.path), object => {
          if (modelObject.material) {
            object.traverse(child => {
              child.children.forEach(function(item, index) {
                item.material = new THREE.MeshStandardMaterial({
                  ...modelObject.material,
                  side: THREE[modelObject.material.side]
                });
              });
              child.castShadow = true;
            });
          }

          if (modelObject.position) {
            const { x, y, z } = modelObject.position;
            object.position.set(x, y, z);
          }
          cncModel.add(object);
          // assign the object to the correspondent this variable
          this[modelObject.name] = object;
        });
      } else if (modelObject.loader === "obj") {
        const objLoader = new OBJLoader();
        objLoader.load(modelsPath("./" + modelObject.path), object => {
          if (modelObject.position) {
            const { x, y, z } = modelObject.position;
            object.position.set(x, y, z);
          }
          cncModel.add(object);
          // assign the object to the correspondent this variable
          this[modelObject.name] = object;
        });
      }
    }

    return cncModel;
  };

  setCNCPosition = ({ x, y, z }) => {
    this.xAxis.position.x = x;
    this.zAxis.position.x = x;
    this.body.position.x = x;
    this.nut.position.x = x;

    this.zAxis.position.y = y;
    this.body.position.y = y;
    this.nut.position.y = y;

    this.yAxis.position.z = z;
  };

  setInitialPosition = () => {
    this.model.models.forEach(model => {
      const { x, y, z } = model.position;
      model.position.set(x || 0, y || 0, z || 0);
    });
  };
}

export { CNCModel };
