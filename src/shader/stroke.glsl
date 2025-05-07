#include "../r3f-gist/shader/cginc/noise/simplexNoise.glsl"

uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uTime;

void main() {
    vec3 noisePos = position * uNoiseScale;
    noisePos.z += uTime * 0.1;
    
    vec3 noise = curlNoise(noisePos) * vec3(1.0);
    vec3 displaced = position + noise * uNoiseStrength * 100.0;
    
    csm_Position = displaced;
}
