import * as THREE from 'three';

class JointControls {
  constructor(joint, minAngle = -Math.PI / 2, maxAngle = Math.PI / 2) {
    this.joint = joint;
    this.minAngle = minAngle;
    this.maxAngle = maxAngle;
    this.angle = 0;

    this.createSlider();
  }

  createSlider() {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = this.minAngle;
    slider.max = this.maxAngle;
    slider.step = 0.01;
    slider.value = this.angle;

    slider.addEventListener('input', (event) => {
      this.angle = parseFloat(event.target.value);
      this.updateJointRotation();
    });

    document.body.appendChild(slider);
  }

  updateJointRotation() {
    this.joint.rotation.z = this.angle;
  }
}

export default JointControls;