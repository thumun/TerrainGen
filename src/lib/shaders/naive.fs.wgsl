struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

struct WaterHeightUniforms {
    height: f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;
@group(1) @binding(0) var<uniform> waterHeight : WaterHeightUniforms;

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

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
    let sandScale = 20.0; // Controls grain size
    let sandNoise = fbm(vec2f(in.pos.x, in.pos.z) * sandScale);
    
    // Base colors with slight variation
    let grass = vec3f(0.32, 0.41, 0.06);
    let sandBase = vec3f(0.95, 0.88, 0.71);
    let sandDark = vec3f(0.85, 0.78, 0.61);
    let underwater = vec3f(0.2, 0.3, 0.4);
    
    let sand = mix(sandDark, sandBase, sandNoise);

    var baseColor = grass;
    if (waterHeight.height > in.pos.y) {
        baseColor = underwater;
    } else if (in.pos.y <= waterHeight.height + 0.2) {
        baseColor = sand;
    } else if (in.pos.y <= waterHeight.height + 0.5) {
        let t = (in.pos.y - (waterHeight.height + 0.2)) / ((waterHeight.height + 0.5) - (waterHeight.height + 0.2));
        baseColor = mix(sand, grass, t);
    } else {
        baseColor = grass;
    }

    let lightDir = normalize(vec3f(-1.0, 1.0, -1.0));
    let diffuse = max(dot(in.nor, lightDir), 0.0);
    let color = baseColor * diffuse;

    return vec4f(color, 1.0);
}