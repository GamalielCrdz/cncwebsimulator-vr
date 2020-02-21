import * as THREE from "three";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import CNCMODELS from "../lib/cncModels.json";
const modelsPath = require.context("../assets/models", true);

class CNCModel {
  constructor(modelName = "cncmodel1") {
    this.model = CNCMODELS.find(model => model.name === modelName);
    this.body = null;
    this.xAxisMotions = [];
    this.yAxisMotions = [];
    this.zAxisMotions = [];
  }

  getCNCModel = async () => {
    const models = this.model.models;
    const cncModel = new THREE.Group();

    for (const modelObject of models) {
      const object = await this.loader(modelObject);
      cncModel.add(object)
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

  defineMotions = (motions = [], object) => {
    for (const motion of motions) {
      if (motion.axis === "x") {
        this.xAxisMotions.push(object);
      } else if (motion.axis === "y") {
        this.yAxisMotions.push(object);
      } else if (motion.axis === "z") {
        this.zAxisMotions.push(object);
      }
    }
  };

  setObjectProperties(modelObject, object) {
    if (modelObject.position) {
      const { x, y, z } = modelObject.position;
      object.position.set(x, y, z);
    }

    if (modelObject.rotation) {
      const { x, y, z } = modelObject.rotation;
      object.rotation.set(
        THREE.Math.degToRad(x),
        THREE.Math.degToRad(y),
        THREE.Math.degToRad(z)
      );
    }

    if (modelObject.motions) {
      this.defineMotions(modelObject.motions, object);
    }

    if (modelObject.material) {
      if (modelObject.loader === "3mf") {
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
    }
    return object;
  }

  loader(modelObject) {
    return new Promise((resolve, reject) => {
      if (modelObject.loader === "3mf") {
        const threeMFLoader = new ThreeMFLoader();
        threeMFLoader.load(modelsPath("./" + modelObject.path), object => {
          object = this.setObjectProperties(modelObject, object);
          resolve(object);
        });
      } else if (modelObject.loader === "obj") {
        if (modelObject.material) {
          const mtlLoader = new MTLLoader();
          mtlLoader.load(
            modelsPath("./" + modelObject.material.path),
            material => {
              material.preload();
              const objLoader = new OBJLoader();
              objLoader.setMaterials(material);
              objLoader.load(modelsPath("./" + modelObject.path), object => {
                object = this.setObjectProperties(modelObject, object);
                resolve(object);
              });
            }
          );
        } else {
          const objLoader = new OBJLoader();
          objLoader.load(modelsPath("./" + modelObject.path), object => {
            object = this.setObjectProperties(modelObject, object);
            resolve(object);
          });
        }
      }
    });
  }
}

export { CNCModel };
