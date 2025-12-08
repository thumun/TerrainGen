override shadowBias: f32 = 0.002;

struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f,
    @location(3) shadow_pos: vec3f,
    @location(4) camera_view_pos: vec3f,
}

fn random3D(seed: vec3f) -> vec3f {
	let dot_product = dot(seed, vec3f(12.9898, 78.233, 45.164));
	let sin_value = sin(dot_product) * 43758.5453;
	let fract_value = fract(sin_value);

	return vec3f(fract_value, fract_value, fract_value);
}

fn worley_noise(pos: vec3f, time: f32) -> f32 {
    var posInt = floor(pos);
    var posFract = fract(pos);
    var minDist = 1.0;

    for (var z: i32 = -1; z <= 1; z = z + 1) {
        for (var y: i32 = -1; y <= 1; y = y + 1) {
            for (var x: i32 = -1; x <= 1; x = x + 1) {
                var neighbor = vec3f(f32(x), f32(y), f32(z));
                var point = random3D(posInt + neighbor);

                let timeSpeed = 0.8;
                let offsetX = sin(time * timeSpeed + point.x * 6.28) * 0.5;
                let offsetY = cos(time * timeSpeed * 0.7 + point.y * 6.28) * 0.5;
                let offsetZ = sin(time * timeSpeed * 0.5 + point.z * 6.28) * 0.5;

                point = point + vec3f(offsetX, offsetY, offsetZ) * 0.3;

                var diff = neighbor + point - posFract;
                var dist = length(diff);
                minDist = min(minDist, dist);
            }
        }
    }

    return minDist;
}

fn celShade(value: f32, bands: f32) -> f32 {
    return max(floor(value * bands) / bands, 0.0);
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(0) @binding(1) var<uniform> directionalLightUniforms: DirectionalLightUniforms;
@group(0) @binding(2) var shadow_map: texture_depth_2d;
@group(0) @binding(3) var shadow_sampler: sampler;

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
    let shadowSample = textureSample(shadow_map, shadow_sampler, in.shadow_pos.xy);
    let isShadowed = shadowSample < in.shadow_pos.z - shadowBias;

    let scale = 3.0;
    let scaledPos = vec3f(
        in.pos.x * scale,
        in.pos.z * scale,
        in.pos.y * 2.0
    );

    let noise1 = worley_noise(scaledPos, camera.time);
    let noise2 = worley_noise(scaledPos * 2.0, camera.time * 1.5);

    let combinedNoise = noise1 * 0.7 + noise2 * 0.3;

    let deepOceanColor = vec3f(0.0, 0.3, 0.6);
    let midOceanColor = vec3f(0.1, 0.5, 0.8);
    let shallowColor = vec3f(0.3, 0.7, 0.9);
    let foamColor = vec3f(0.9, 0.95, 1.0);

    let t1 = smoothstep(0.15, 0.3, combinedNoise);
    let t2 = smoothstep(0.4, 0.55, combinedNoise);
    let t3 = smoothstep(0.65, 0.8, combinedNoise);

    var waterC = deepOceanColor;
    waterC = mix(waterC, midOceanColor, t1);
    waterC = mix(waterC, shallowColor, t2);
    waterC = mix(waterC, foamColor, t3);

    let lightDir = normalize(vec3f(-1.0, 1.0, -1.0));
    let diffuse = max(dot(in.nor, lightDir), 0.2);
    var finalColor = waterC * diffuse;

    finalColor = mix(finalColor, waterC, combinedNoise * combinedNoise * 0.5);

    if isShadowed {
        finalColor *= 0.5;
    }

    let fogStrength = 1.0 - exp(-0.08 * length(in.camera_view_pos));
    let fogColor = vec3f(0.686, 0.702, 0.725);

    finalColor = mix(finalColor, fogColor, fogStrength);

    return vec4f(finalColor, 0.85);
}
