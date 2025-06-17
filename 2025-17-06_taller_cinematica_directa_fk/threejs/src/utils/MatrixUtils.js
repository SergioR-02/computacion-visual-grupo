// This file provides utility functions for matrix operations, which are essential for transforming the positions and orientations of the links and joints.

export function createIdentityMatrix() {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

export function multiplyMatrices(a, b) {
    const result = createIdentityMatrix();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j] + a[i][3] * b[3][j];
        }
    }
    return result;
}

export function translateMatrix(matrix, tx, ty, tz) {
    const translationMatrix = [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(matrix, translationMatrix);
}

export function rotateXMatrix(matrix, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotationMatrix = [
        [1, 0, 0, 0],
        [0, cos, -sin, 0],
        [0, sin, cos, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(matrix, rotationMatrix);
}

export function rotateYMatrix(matrix, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotationMatrix = [
        [cos, 0, sin, 0],
        [0, 1, 0, 0],
        [-sin, 0, cos, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(matrix, rotationMatrix);
}

export function rotateZMatrix(matrix, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotationMatrix = [
        [cos, -sin, 0, 0],
        [sin, cos, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrices(matrix, rotationMatrix);
}