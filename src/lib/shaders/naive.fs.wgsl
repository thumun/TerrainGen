// default fragment shader

override shadowBias: f32 = 0.002;

struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f,
    @location(3) shadow_pos: vec3f,
    @location(4) camera_view_pos: vec3f,
}

struct BiomeUniforms {
    biomeType: u32,
}

struct WaterHeightUniforms {
    height: f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(1) @binding(0) var<uniform> waterHeight : WaterHeightUniforms;
@group(2) @binding(0) var<uniform> biome : BiomeUniforms;

// Simple hash function for noise
fn hash(p: vec2f) -> f32 {
    let p3 = fract(vec3f(p.x, p.y, p.x) * 0.13);
    let dot_product = dot(p3, vec3f(p3.y, p3.z, p3.x) + 3.333);
    return fract((p3.x + p3.y) * dot_product);
}

// thanks copilot
fn noise(p: vec2f) -> f32 {
    let i = floor(p);
    let f = fract(p);

    // Cubic interpolation
    let u = f * f * (3.0 - 2.0 * f);

    // Sample corners
    let a = hash(i);
    let b = hash(i + vec2f(1.0, 0.0));
    let c = hash(i + vec2f(0.0, 1.0));
    let d = hash(i + vec2f(1.0, 1.0));

    // Interpolate
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p: vec2f) -> f32 {
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var pos = p;

    for (var i = 0; i < 4; i++) {
        value += amplitude * noise(pos * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}

fn celShade(value: f32, bands: f32) -> f32 {
    return floor(value * bands) / bands;
}

fn grassTexture(pos: vec3f) -> vec3f {
    let noise1 = fbm(pos.xz * 8.0);
    let noise2 = noise(pos.xz * 2.0);

    let combinedNoise = noise1 * 0.6 + noise2 * 0.4;

    let grassBright = vec3f(0.45, 0.85, 0.15);
    let grassMid = vec3f(0.25, 0.65, 0.10);
    let grassDark = vec3f(0.15, 0.45, 0.05);

    let t1 = smoothstep(0.3, 0.5, combinedNoise);
    let t2 = smoothstep(0.4, 0.8, combinedNoise);

    var grassColor = grassDark;
    grassColor = mix(grassColor, grassMid, t1);
    grassColor = mix(grassColor, grassBright, t2);

    return grassColor;
}

fn sandTexture(pos: vec3f) -> vec3f {
    let sandScale = 20.0;
    let sandNoise = fbm(pos.xz * sandScale);

    let sandBase = vec3f(0.95, 0.88, 0.71);
    let sandDark = vec3f(0.85, 0.78, 0.61);

    return mix(sandDark, sandBase, sandNoise);
}

fn snowTexture(pos: vec3f) -> vec3f {
    let sandScale = 20.0;
    let sandNoise = fbm(pos.xz * sandScale);

    let sandBase = vec3f(0.94, 0.99, 1.0);
    let sandDark = vec3f(0.812, 0.953, 0.969);

    return mix(sandDark, sandBase, sandNoise);
}

fn mountainTexture(pos: vec3f) -> vec3f {
    let noise1 = fbm(pos.xz * 3.0);
    let noise2 = noise(pos.xz * 10.0);
    let noise3 = noise(pos.xz * 30.0);

    let combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;

    let rockDark = vec3f(0.35, 0.35, 0.38);
    let rockMid = vec3f(0.50, 0.48, 0.45);
    let rockLight = vec3f(0.65, 0.62, 0.58);

    let t1 = smoothstep(0.25, 0.45, combinedNoise);
    let t2 = smoothstep(0.55, 0.75, combinedNoise);

    var rockColor = rockDark;
    rockColor = mix(rockColor, rockMid, t1);
    rockColor = mix(rockColor, rockLight, t2);

    return rockColor;
}

@group(0) @binding(1) var<uniform> directionalLightUniforms: DirectionalLightUniforms;
@group(0) @binding(2) var shadow_map: texture_depth_2d;
@group(0) @binding(3) var shadow_sampler: sampler;

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
    let biomeType = biome.biomeType;
    var baseColor: vec3f;
    let underwater = vec3f(0.2, 0.3, 0.4);

    if (biomeType == 0) {
        // grassland
        let sandScale = 20.0;
        let sandNoise = fbm(vec2f(in.pos.x, in.pos.z) * sandScale);

        let grass = grassTexture(in.pos);
        let sand = sandTexture(in.pos);

        let grassStart = waterHeight.height + 0.8;
        let sandEnd = waterHeight.height + 0.4;

        baseColor = grass;
        if (waterHeight.height > in.pos.y) {
            baseColor = underwater;
        } else if (in.pos.y <= sandEnd) {
            baseColor = sand;
        } else if (in.pos.y <= grassStart) {
            let t = (in.pos.y - sandEnd) / (grassStart - sandEnd);
            baseColor = mix(sand, grass, t);
        } else {
            baseColor = grass;
        }
    } else if (biomeType == 1) {
        // desert
        let sandScale = 20.0;
        let sandNoise = fbm(vec2f(in.pos.x, in.pos.z) * sandScale);

        let sand = sandTexture(in.pos);

        baseColor = sand;
        if (waterHeight.height > in.pos.y) {
            baseColor = underwater;
        } else {
            baseColor = sand;
        }
    } else if (biomeType == 2) {
        // mountain
        baseColor = mountainTexture(in.pos);

        if (waterHeight.height > in.pos.y) {
            baseColor = underwater;
        }
    } else if (biomeType == 3) {
        // tundra
        let sandScale = 20.0;
        let sandNoise = fbm(vec2f(in.pos.x, in.pos.z) * sandScale);

        let snow = snowTexture(in.pos);

        baseColor = vec3f(1.0, 1.0, 1.0);
        if (waterHeight.height > in.pos.y) {
            baseColor = underwater;
        } else {
            baseColor = snow;
        }
    }
    else {
        // Default to grass texture
        baseColor = grassTexture(in.pos);
    }

    let shadowSample = textureSample(shadow_map, shadow_sampler, in.shadow_pos.xy);
    let isShadowed = shadowSample < in.shadow_pos.z - shadowBias;

    // do lambertian shading
    let lightDir = normalize(directionalLightUniforms.lightDir);
    var directionalLightStrength = max(dot(in.nor, lightDir), 0.0);
    if (isShadowed) {
        directionalLightStrength = mix(directionalLightStrength, 0.0, 0.95);
    }
    let directLight = vec3f(1.0, 0.95, 0.8) * directionalLightStrength;

    let ambientLight = vec3f(0.1, 0.1, 0.2);

    let fogStrength = 1.0 - exp(-camera.fogIntensity * length(in.camera_view_pos));

    var color = mix(baseColor * (directLight + ambientLight), camera.fogColor, fogStrength);
    return vec4f(color, 1.0);
}
