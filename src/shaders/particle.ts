export const particleVertexShader = /* glsl */ `
uniform float uTime;

#include <common>

// Manual instanceColor varying (avoids timing issues with color_pars includes)
varying vec3 vInstanceColor;
varying vec3 vNormal_VS;
varying vec3 vViewPosition;
varying float vPulse;

void main() {
  // Instance color with white fallback
  #ifdef USE_INSTANCING_COLOR
    vInstanceColor = instanceColor;
  #else
    vInstanceColor = vec3(1.0);
  #endif

  #include <begin_vertex>

  // World position for color temperature shift
  #ifdef USE_INSTANCING
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
  #else
    vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
  #endif

  float distFromOrigin = length(worldPos.xyz);

  // Color temperature: warmer/brighter near center (1.3x), dimmer far away (0.8x)
  float warmth = smoothstep(4.0, 0.5, distFromOrigin);
  float tempMult = mix(0.8, 1.3, warmth);
  vInstanceColor *= tempMult;

  // Per-particle animated pulse from position-derived seed
  #ifdef USE_INSTANCING
    float seed = instanceMatrix[3][0] * 12.9898 + instanceMatrix[3][1] * 78.233;
  #else
    float seed = transformed.x * 12.9898 + transformed.y * 78.233;
  #endif
  float randomOffset = fract(sin(seed) * 43758.5453);
  vPulse = 0.85 + 0.15 * sin(uTime * 1.5 + randomOffset * 6.283);

  #include <project_vertex>

  // View-space normal for glow falloff
  #ifdef USE_INSTANCING
    vNormal_VS = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  #else
    vNormal_VS = normalize(normalMatrix * normal);
  #endif
  vViewPosition = mvPosition.xyz;
}
`;

export const particleFragmentShader = /* glsl */ `
#include <common>

varying vec3 vInstanceColor;
varying vec3 vNormal_VS;
varying vec3 vViewPosition;
varying float vPulse;

void main() {
  // Soft glow: brightest where normal faces camera, fading at silhouette edges
  vec3 viewDir = normalize(-vViewPosition);
  float facing = max(dot(normalize(vNormal_VS), viewDir), 0.0);
  float glow = smoothstep(0.0, 0.7, facing);
  glow = pow(glow, 0.6);

  vec3 color = vInstanceColor * vPulse * glow;
  float alpha = glow * 0.9;

  gl_FragColor = vec4(color, alpha);
}
`;
