// This file contains functions for calculating the forward kinematics of the robotic arm. 
// It computes the position and orientation of each link based on the angles of the joints.

export function calculateForwardKinematics(jointAngles, linkLengths) {
    const positions = [];
    let currentPosition = { x: 0, y: 0, z: 0 };
    let currentAngle = 0;

    for (let i = 0; i < jointAngles.length; i++) {
        currentAngle += jointAngles[i];

        const x = currentPosition.x + linkLengths[i] * Math.cos(currentAngle);
        const y = currentPosition.y + linkLengths[i] * Math.sin(currentAngle);

        currentPosition = { x, y, z: 0 }; // Assuming a 2D plane for simplicity
        positions.push(currentPosition);
    }

    return positions;
}

export function getTransformationMatrix(angle, translation) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return [
        [cos, -sin, 0, translation.x],
        [sin, cos, 0, translation.y],
        [0, 0, 1, translation.z],
        [0, 0, 0, 1]
    ];
}