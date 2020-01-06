import * as THREE from "three";

const G1ColorDone = new THREE.Color('green');
const G2ColorDone = new THREE.Color('blue');
const G0ColorDone = new THREE.Color('blue');
const ColorTBD = new THREE.Color('red');

class GCodeViewModel {
	constructor(code) {
		this.code = code;
		this.vertexIndex = 0;
		this.vertexLength = 0;
	}
}

class GCodeRenderer {
	constructor() {
		this.viewModels = [];
		this.index = 0;
		this.baseObject = new THREE.Object3D();

		this.motionGeo = new THREE.Geometry();
		this.motionMat = new THREE.LineBasicMaterial({
			opacity: 0.2,
			transparent: true,
			linewidth: 1,
			vertexColors: THREE.VertexColors
		});

		this.motionIncGeo = new THREE.Geometry();
		this.motionIncMat = new THREE.LineBasicMaterial({
			opacity: 0.2,
			transparent: true,
			linewidth: 1,
			vertexColors: THREE.VertexColors
		});

		this.feedAllGeo = new THREE.Geometry();

		this.feedGeo = new THREE.Geometry();
		this.feedMat = new THREE.LineBasicMaterial({
			opacity: 0.8,
			transparent: true,
			linewidth: 2,
			vertexColors: THREE.VertexColors
		});

		this.feedIncGeo = new THREE.Geometry();
		this.feedIncMat = new THREE.LineBasicMaterial({
			opacity: 0.2,
			transparent: true,
			linewidth: 2,
			vertexColors: THREE.VertexColors
		});

		this.lastLine = { x: 0, y: 0, z: 0, e: 0, f: 0 };
		this.relative = false;

		this.bounds = {
			min: { x: 100000, y: 100000, z: 100000 },
			max: { x: -100000, y: -100000, z: -100000 }
		};
	}
	G0GeometryHandler(viewModel) {
		let self = this;
		let newLine = {};

		viewModel.code.words.forEach(function (word) {
			// TODO: handle non-numerical values
			switch (word.letter) {
				case 'X':
				case 'Y':
				case 'Z':
				case 'E':
				case 'F':
					let p = word.letter.toLowerCase();
					newLine[p] = self.absolute(self.lastLine[p], parseFloat(word.value));
					break;
			}
		});

		['x', 'y', 'z', 'e', 'f'].forEach(function (prop) {
			if (newLine[prop] === undefined) {
				newLine[prop] = self.lastLine[prop];
			}
		});

		viewModel.vertexIndex = self.motionGeo.vertices.length;

		//let color = GCodeRenderer.motionColors[viewModel.code.index % GCodeRenderer.motionColors.length];
		let color = G0ColorDone
		self.motionGeo.vertices.push(new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z));
		self.motionGeo.vertices.push(new THREE.Vector3(newLine.x, newLine.y, newLine.z));

		self.motionGeo.colors.push(color);
		self.motionGeo.colors.push(color);

		viewModel.vertexLength = self.motionGeo.vertices.length - viewModel.vertexIndex;

		self.lastLine = newLine;

		return self.motionGeo;
	}
	G1GeometryHandler(viewModel) {
		let self = this;
		let newLine = {};
		viewModel.code.words.forEach(function (word) {
			// TODO: handle non-numerical values
			switch (word.letter) {
				case 'X':
				case 'Y':
				case 'Z':
				case 'E':
				case 'F':
					let p = word.letter.toLowerCase();
					newLine[p] = self.absolute(self.lastLine[p], parseFloat(word.value));
					break;
			}
		});

		['x', 'y', 'z', 'e', 'f'].forEach(function (prop) {
			if (newLine[prop] === undefined) {
				newLine[prop] = self.lastLine[prop];
			}
		});

		// let color =  new THREE.Color(GCodeRenderer.feedColors[viewModel.code.index%GCodeRenderer.feedColors.length]);
		let color = ColorTBD;
		let p1 = new THREE.Vector3(self.lastLine.x, self.lastLine.y, self.lastLine.z);
		let p2 = new THREE.Vector3(newLine.x, newLine.y, newLine.z);

		viewModel.vertexIndex = self.feedAllGeo.vertices.length;

		if (viewModel.code.index <= self.index) {
			self.feedGeo.vertices.push(p1);
			self.feedGeo.vertices.push(p2);
			self.feedGeo.colors.push(color);
			self.feedGeo.colors.push(color);
		} else {
			self.feedIncGeo.vertices.push(p1);
			self.feedIncGeo.vertices.push(p2);
			self.feedIncGeo.colors.push(color);
			self.feedIncGeo.colors.push(color);
		}

		self.feedAllGeo.vertices.push(p1);
		self.feedAllGeo.vertices.push(p2);
		self.feedAllGeo.colors.push(G1ColorDone);
		self.feedAllGeo.colors.push(G1ColorDone);

		viewModel.vertexLength = self.feedAllGeo.vertices.length - viewModel.vertexIndex;

		self.lastLine = newLine;

		return self.feedGeo;

	}
/*
	materialHandlers(functionType) {
		switch (functionType) {
			case 'G0': return function (viewModel) {
				return this.motionMat;
			};
			case 'G1': return function (viewModel) {
				return this.feedMat;
			};
			case 'G2': return function (viewModel) {
				return this.feedMat;
			};
		};

	}; // end materialHandlers
 */
	absolute(v1, v2) {
		return this.relative ? v1 + v2 : v2;
	};
	getFeedGeo() {
		return this.feedGeo;
	};
	render(model) {
		let self = this
		this.model = model;
		this.model.codes.forEach(function (code) {
			self.renderGCode(code);
		});

		this.updateLines();

		// Center
		this.feedAllGeo.computeBoundingBox();
		this.bounds = this.feedAllGeo.boundingBox;

		this.center = new THREE.Vector3(
			this.bounds.min.x + ((this.bounds.max.x - this.bounds.min.x) / 2),
			this.bounds.min.y + ((this.bounds.max.y - this.bounds.min.y) / 2),
			this.bounds.min.z + ((this.bounds.max.z - this.bounds.min.z) / 2));

		return this.baseObject;
	};

	updateLines() {
		while (this.baseObject.children.length > 0) {
			this.baseObject.remove(this.baseObject.children[0]);
		}
		let motionLine = new THREE.Line(this.motionGeo, this.motionMat, THREE.LineSegments);
		let feedLine = new THREE.Line(this.feedGeo, this.feedMat, THREE.LineSegments);
		let feedIncLine = new THREE.Line(this.feedIncGeo, this.feedIncMat, THREE.LineSegments);
		this.baseObject.add(motionLine);
		this.baseObject.add(feedLine);
		this.baseObject.add(feedIncLine);
	};

	/* returns THREE.Object3D */
	renderGCode(code) {
		let cmd = code.words[0].letter + code.words[0].value;
		let viewModel = new GCodeViewModel(code);

		switch (cmd) {
			case 'G0':
			case 'G00':
				this.G0GeometryHandler(viewModel);
			case 'G1':
			case 'G01':
				this.G1GeometryHandler(viewModel)
			case 'G2': break;
		}
/*
		switch (cmd) {
			case 'G0': this.motionMat;
			break;
			case 'G1': this.feedMat;
			break;
			case 'G2': this.feedMat;
			break;
		}
*/
		if (viewModel.vertexLength > 0) {
			this.viewModels.push(viewModel);
		}
	};

	setIndex(index) {
		index = Math.floor(index);

		if (this.index == index) { return; }
		if (index < 0 || index >= this.viewModels.length) {
			throw new Error("invalid index");
		}

		let vm = this.viewModels[index];		

		this.feedGeo.dispose();
		this.feedGeo = new THREE.Geometry();
		let vertices = this.feedAllGeo.vertices.slice(0, vm.vertexIndex + vm.vertexLength);
		Array.prototype.push.apply(this.feedGeo.vertices, vertices);

		let colors = this.feedAllGeo.colors.slice(0, vm.vertexIndex + vm.vertexLength);
		Array.prototype.push.apply(this.feedGeo.colors, colors);


		this.index = index;
		this.updateLines();
	};
};
export { GCodeRenderer };