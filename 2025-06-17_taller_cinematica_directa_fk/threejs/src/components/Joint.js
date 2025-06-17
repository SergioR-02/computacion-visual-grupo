import * as THREE from 'three';

class Joint {
  constructor(length, angle) {
    this.length = length;
    this.angle = angle;
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler(0, 0, angle);
    this.updatePosition();
  }

  updatePosition() {
    this.position.x = this.length * Math.cos(this.angle);
    this.position.y = this.length * Math.sin(this.angle);
  }

  setAngle(newAngle) {
    this.angle = newAngle;
    this.rotation.z = newAngle;
    this.updatePosition();
  }

  getPosition() {
    return this.position;
  }

  getRotation() {
    return this.rotation;
  }
}

export default Joint;