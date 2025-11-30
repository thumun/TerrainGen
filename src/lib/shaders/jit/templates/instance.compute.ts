import commonShaderContent from '@/lib/shaders/common.wgsl?raw';
import * as shaders from '@/lib/shaders/jit/types/shaders';

export const instanceComputeShaderTemplate: shaders.InstancingShaderTemplate = {
  content: ({ uniforms, utils, body, posKey }) => `${commonShaderContent}

@group(0) @binding(0) var<storage, read_write> vertices: array<f32>;
@group(0) @binding(1) var<storage, read_write> indices: array<u32>;

@group(1) @binding(0) var<uniform> meshUniforms : MeshUniforms;

@group(2) @binding(0) var<storage, read_write> instance_pts: array<f32>;
@group(2) @binding(1) var<uniform> instanceCount: u32;

${uniforms}

fn vertexOffset(i: u32) -> u32 { 
    return i * 8u; 
}

${utils}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= instanceCount) {
        return;
    }

${body}

    let vOffset = vertexOffset(id.x);
    let instancePos = ${posKey};
    
    instance_pts[vOffset + 0] = ${posKey}.x;
    instance_pts[vOffset + 1] = ${posKey}.y;
    instance_pts[vOffset + 2] = ${posKey}.z;
    instance_pts[vOffset + 3] = 0.0; // nor.x
    instance_pts[vOffset + 4] = 1.0; // nor.y
    instance_pts[vOffset + 5] = 0.0; // nor.z
    instance_pts[vOffset + 6] = 0.0; // uv.x
    instance_pts[vOffset + 7] = 0.0; // uv.y
}
`,
};
