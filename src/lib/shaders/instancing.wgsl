@group(0) @binding(0)
var<uniform> camera : CameraUniforms;

// add another uniform for whether or not texture is being used

@group(1) @binding(0)
var<storage, read> instance_pts: array<InstanceVertex>;

@group(1) @binding(1)
var<storage, read> vertices: array<f32>; // 8 floats + 1 u32 per vertex

@group(1) @binding(2)
var<storage, read> indices: array<u32>;

// insert binding for array of image textures
@group(2) @binding(0) var ourSampler: sampler;
@group(2) @binding(1) var ourTexture: texture_2d_array<f32>;

@group(3) @binding(0)
var<uniform> transform_matrix: mat4x4<f32>;

struct VertexIn {
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32
};

struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) pos : vec3f,
    @location(1) nor : vec3f,
    @location(2) uv : vec2f,
    @location(3) @interpolate(flat) tex_id: u32,
    @location(4) @interpolate(flat) used: u32,
    @location(5) camera_view_pos: vec3f,
};

fn hash11(n: f32) -> f32 {
    let x = fract(sin(n) * 43758.5453123);
    return x;
}

fn rotateAroundAxis(v: vec3f, axis: vec3f, angle: f32) -> vec3f {
  let cosA = cos(angle);
  let sinA = sin(angle);
  return v * cosA +
          cross(axis, v) * sinA +
          axis * dot(axis, v) * (1.0 - cosA);
}

@vertex
fn vs_main(in : VertexIn) -> VertexOut {
    var out : VertexOut;

    let vOffset = in.instance_index * 9u;

     // get point data
    var pos = instance_pts[in.instance_index].pos;
    var nor = normalize(instance_pts[in.instance_index].nor);
    var used = instance_pts[in.instance_index].used;

    let idx = indices[in.vertex_index];
    let base = idx * 9u;
    let local = vec3f(
        vertices[base + 0],
        vertices[base + 1],
        vertices[base + 2],
    );
    let vert_nor = vec3f(
        vertices[base + 3],
        vertices[base + 4],
        vertices[base + 5],
    );
    let vert_uv = vec2f(vertices[base + 6], vertices[base + 7]);
    let texture_id = u32(vertices[base + 8]);

    // do transformations
    let rot = instance_pts[in.instance_index].rotMat;
    let rotatedLocal = rot * local;
    //let rotatedLocal = local;
    let transformedLocal = (transform_matrix * vec4(rotatedLocal, 0.0)).xyz;

    // translate
    let worldPos = pos + transformedLocal;
    let clipPos = camera.viewProjMat * vec4(worldPos, 1.0);

    // transform normals too
    let normal_matrix = mat3x3<f32>(
        transform_matrix[0].xyz,
        transform_matrix[1].xyz,
        transform_matrix[2].xyz
    );
    let transformedNor = normal_matrix * (rot * vert_nor);
    let newNor = normalize(transformedNor);

    // set output
    out.position = clipPos;
    out.pos = worldPos;
    out.nor = normalize(newNor);
    out.uv = vert_uv;
    out.tex_id = texture_id;
    out.used = used;
    out.camera_view_pos = (camera.viewMat * world_pos).xyz;
    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f
{
  if (in.used == 0u) {
    discard;
  }

  let texcoord = vec2f(in.uv.x, 1.0 - in.uv.y);
  let diffuse = textureSample(ourTexture, ourSampler, texcoord, in.tex_id);

  if (diffuse.a < 0.5) {
    discard;
  }

  // do lambertian shading
  let lightDir = normalize(vec3f(0.2, 0.25, 0.1));
  var directionalLightStrength = max(dot(in.nor, lightDir), 0.0);
  let directLight = vec3f(1.0, 0.95, 0.8) * directionalLightStrength;

  let ambientLight = vec3f(0.1, 0.1, 0.1);

  let fogStrength = 1.0 - exp(-0.08 * length(in.camera_view_pos));
  let fogColor = vec3f(0.686, 0.702, 0.725);

  var color = diffuse.xyz * (directLight + ambientLight);
  color = mix(color.xyz, fogColor, fogStrength);
  return vec4f(color, 1.0);
}
