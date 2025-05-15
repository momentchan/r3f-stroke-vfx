#include "../../r3f-gist/shader/cginc/noise/simplexNoise.glsl"

uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uTime;
uniform float uNoiseStrengthMultiplier;
varying vec2 vUv;
varying vec3 vViewDirection;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 noisePos = position * uNoiseScale;
    noisePos.z += uTime * 0.1;
    
    vec3 noise = curlNoise(noisePos);
    
    // Apply noise along normal direction with falloff based on normal angle
    float normalInfluence = dot(normalize(normal), vec3(0.0, 0.0, 1.0)) * 0.5 + 0.5;
    vec3 normalNoise = normal * noise.z * normalInfluence;
    
    vec3 tangent;
    if (abs(dot(normal, vec3(0.0, 1.0, 0.0))) > 0.999) {
        tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    } else {
        tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    }
    
    vec3 tangentNoise = tangent * noise.x;
    vec3 bitangentNoise = normalize(cross(normal, tangent)) * noise.y;
    
    vec3 displaced = position + (normalNoise + tangentNoise + bitangentNoise) * uNoiseStrength * uNoiseStrengthMultiplier;
    
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    vNormal = normalMatrix * normal;
    
    vUv = uv; // Pass UV attribute to the fragment shader
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
