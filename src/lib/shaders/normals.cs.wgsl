// compute shader for generating terrain geo

@group(0) @binding(0)
var<storage, read_write> vertices: array<f32>;

@group(0) @binding(1)
var<storage, read_write> indices: array<u32>;

@group(1) @binding(0)
var<uniform> meshUniforms : MeshUniforms;


fn vertexOffset(i: u32) -> u32 { 
    return i * 8u; 
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let subdivisions = u32(meshUniforms.resolution);
    let size = meshUniforms.size;
    let step = size / f32(subdivisions);

    let vertexCount = (subdivisions + 1u) * (subdivisions + 1u);
    let indexCount = subdivisions * subdivisions * 6u;

    // generate vertices
    if (id.x >= vertexCount) {
        return;
    }

    // do something

}
