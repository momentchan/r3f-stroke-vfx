#include "../../r3f-gist/shader/cginc/noise/simplexNoise.glsl"

uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uTime;
uniform float uNoiseStrengthMultiplier;

varying vec2 vUv; // Receive UV from the vertex shader

void main() {
    vec3 color = vec3(vUv, abs(sin(uTime))); // Use UV for color
    color = vec3(1.0);
    gl_FragColor = vec4(color, 1.0);
}