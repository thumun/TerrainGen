@group(0) @binding(0)
var<uniform> camera : CameraUniforms;

// add another uniform for whether or not texture is being used

@group(1) @binding(0)
var<storage, read> instance_pts: array<InstanceVertex>; // 8 floats per instance- pos, nor, uv

@group(1) @binding(1)
var<storage, read> vertices: array<f32>; // 8 floats per vertex

@group(1) @binding(2)
var<storage, read> indices: array<u32>;

// insert binding for array of image textures
@group(2) @binding(0) var ourSampler: sampler;
@group(2) @binding(1) var ourTexture: texture_2d<f32>;

struct VertexIn {
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32
};

struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) pos : vec3f,
    @location(1) nor : vec3f,
    @location(2) uv : vec2f,
};

@vertex
fn vs_main(in : VertexIn) -> VertexOut {
    var out : VertexOut;

    let vOffset = in.instance_index * 8u;

     // get point position
    var pos = instance_pts[in.instance_index].pos;

    // point nor for testing...
    var nor = normalize(instance_pts[in.instance_index].nor);

    let idx = indices[in.vertex_index];
    let base = idx * 8u;
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

    // do transformations
    let rot = instance_pts[in.instance_index].rotMat;
    let rotated = rot * local;   // apply orientation
    let world = vec4(pos + rotated, 1.0);
    let world_pos = camera.viewProjMat * world;

    // transform normals too
    let new_nor = rot * vert_nor;

    // set output
    out.position = world_pos;
    out.pos = world_pos.xyz;
    out.nor = new_nor;
    out.uv = vert_uv;
    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f
{
  // do lambertian shading
  let lightDir = normalize(vec3f(-1.0, 1.0, -1.0));
  let diffuse = max(dot(in.nor, lightDir), 0.0);

  let texcoord = vec2f(in.uv.x, 1.0 - in.uv.y);
  let color = textureSample(ourTexture, ourSampler, texcoord);
  //color = vec4(in.uv.x, in.uv.y, 0.0, 1.0);
  return color;

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
