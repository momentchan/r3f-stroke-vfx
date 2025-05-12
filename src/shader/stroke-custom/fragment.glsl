#include "../../r3f-gist/shader/cginc/noise/simplexNoise.glsl"

uniform float uAlpha;

varying vec2 vUv; // Receive UV from the vertex shader

void main() {
    vec3 color = vec3(1.0);
    gl_FragColor = vec4(color, uAlpha);
}