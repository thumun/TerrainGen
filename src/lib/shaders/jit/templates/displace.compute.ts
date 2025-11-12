import commonShaderContent from '@/lib/shaders/common.wgsl?raw';
import * as shaders from '@/lib/shaders/jit/types/shaders';

/**
 * This template is for a compute shader which takes an array of vertices (in 8-float-offset
 * groups) and sets Y positions as output.
 */
export const displaceComputeShaderTemplate: shaders.DisplaceShaderTemplate = {
  content: ({ uniforms, utils, body, heightKey }) => `${commonShaderContent}

@group(0) @binding(0) var<storage, read_write> vertices: array<f32>;

@group(1) @binding(0) var<uniform> meshUniforms : MeshUniforms;

${uniforms}

fn vertexOffset(i: u32) -> u32 {
    return i * 8u;
}

${utils}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let offset = vertexOffset(id.x);

    let terrain_pos = vec3f(
        vertices[offset],
        vertices[offset + 1u],
        vertices[offset + 2u],
    );

${body}

    vertices[offset + 1u] = ${heightKey};
}
`,
  localKeys: { terrainPos: 'terrain_pos' },
};
