#include "../../r3f-gist/shader/cginc/noise/simplexNoise.glsl"
#include './../../r3f-gist/shader/cginc/noise/gradientNoise.glsl';
#include './../../r3f-gist/shader/cginc/utility.glsl';
#include './../../r3f-gist/shader/cginc/fog.glsl';

uniform float uAlpha;
uniform float uFresnelPower;
uniform vec3 uFresnelColor;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vViewDirection;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    float n = remap(noise(vPosition.xy), vec2(0.0, 1.0), vec2(0.9, 1.0));
    float fresnel = pow(1.0 - abs(dot(normalize(vViewDirection), normalize(vNormal))), uFresnelPower);

    vec3 color = mix(uColor, uFresnelColor, fresnel);

    float fog = getFog(uFogDensity);
    color = mix(uFogColor, color, fog);

    gl_FragColor = vec4(color * n, uAlpha * fresnel);
}