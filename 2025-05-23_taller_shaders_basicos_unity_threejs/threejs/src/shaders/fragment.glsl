uniform float uTime;
varying vec3 vNormal;

void main() {
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float light = dot(normalize(vNormal), lightDir);

  // Toon shading: cuantizar luz
  float levels = 3.0;
  float quantized = floor(light * levels) / levels;

  // Color animado base
  vec3 baseColor = vec3(
    0.5 + 0.5 * sin(uTime + gl_FragCoord.x * 0.1),
    0.5 + 0.5 * cos(uTime + gl_FragCoord.y * 0.1),
    1.0
  );

  vec3 finalColor = baseColor * quantized;

  gl_FragColor = vec4(finalColor, 1.0);
}
