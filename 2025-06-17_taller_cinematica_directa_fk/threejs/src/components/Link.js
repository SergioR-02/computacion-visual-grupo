import * as THREE from 'three';

class Link {
  constructor(length, angle, color) {
    this.length = length;
    this.angle = angle;
    this.color = color;

    this.geometry = new THREE.BoxGeometry(this.length, 0.1, 0.1);
    this.material = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  update(position, rotation) {
    this.mesh.position.copy(position);
    this.mesh.rotation.z = rotation + this.angle;
  }

  getMesh() {
    return this.mesh;
  }
}

export default Link;