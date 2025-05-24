// src/shaders/colorFilter.glsl
vec4 simulateProtanopia(vec4 color) {
  float r = color.r * 0.56667 + color.g * 0.43333;
  float g = color.r * 0.55833 + color.g * 0.44167;
  float b = color.b;
  return vec4(r, g, b, 1.0);
}
