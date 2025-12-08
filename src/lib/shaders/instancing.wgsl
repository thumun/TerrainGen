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

@vertex
fn vs_main(in : VertexIn) -> VertexOut {
    var out : VertexOut;

    let vOffset = in.instance_index * 9u;

     // get point position
    var pos = instance_pts[in.instance_index].pos;

    // point nor for testing...
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
    let rotated = rot * local;
    let world = transform_matrix * vec4(pos + rotated, 1.0);
    let world_pos = camera.viewProjMat * world;

    // transform normals too
    let normal_matrix = mat3x3<f32>(
        transform_matrix[0].xyz,
        transform_matrix[1].xyz,
        transform_matrix[2].xyz
    );
    let transformed_nor = rot * vert_nor;
    let new_nor = normalize(normal_matrix * transformed_nor);

    // set output
    out.position = world_pos;
    out.pos = world_pos.xyz;
    out.nor = normalize(new_nor);
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

  // do lambertian shading
  let lightDir = normalize(vec3f(-1.0, 1.0, -1.0));
  let diffuse = max(dot(in.nor, lightDir), 0.0);

  let texcoord = vec2f(in.uv.x, 1.0 - in.uv.y);
  let color = textureSample(ourTexture, ourSampler, texcoord, in.tex_id);
  //let color = vec4(in.uv.x, in.uv.y, 0.0, 1.0);

  if (color.a < 0.5) {
    discard;
  }

  let fogStrength = 1.0 - exp(-camera.fogIntensity * length(in.camera_view_pos));

  let finalColor = mix(color.xyz, camera.fogColor, fogStrength);

  return vec4f(finalColor, color.a);

  // var color = vec3f(0.0, 0.0, 0.0);

  // if (diffuse > 0.75) {
  //   color = vec3f(0.58, 1.0, 0.235);
  // } else if (diffuse > 0.5) {
  //   color = vec3f(0.447, 0.749, 0.313);
  // } else if (diffuse > 0.25) {
  //   color = vec3f(0.309, 0.490, 0.396);
  // } else {
  //   color = vec3f(0.176, 0.235, 0.478);
  // }

  // return vec4f(color, 1.0);
}
