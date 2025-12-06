struct VertexInput {
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32
};

@group(0) @binding(0) var<uniform> directionalLight : DirectionalLightUniforms;
// struct has members 'lightViewProjMatrix' and 'lightPos'

@group(1) @binding(0) var<storage, read> instance_pts: array<InstanceVertex>; // 8 floats per instance- pos, nor, uv

@vertex
fn vs_main(in : VertexInput) -> @builtin(position) vec4f {

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

    // do transformations
    let rot = instance_pts[in.instance_index].rotMat;
    let rotated = rot * local;   // apply orientation
    let world = vec4(pos + rotated, 1.0);
    //let world = vec4(pos + local, 1.0);

    return directionalLight.lightViewProjMatrix * world;
}
