// common code that can be used in all shaders

struct CameraUniforms {
    viewProjMat: mat4x4f,
    invProjMat: mat4x4f,
    viewMat: mat4x4f,
    viewDir: vec4f,
    cameraWidth: f32,
    cameraHeight: f32,
    nearPlane: f32,
    farPlane: f32,
}

struct DirectionalLightUniforms {
    lightViewProjMatrix: mat4x4f,
    lightPos: vec3f,
}

struct MeshUniforms {
    size: f32,
    resolution: f32,
}

struct Vertex {
    pos: vec3<f32>,
    nor: vec3<f32>,
    uv: vec2<f32>,
};

struct InstanceVertex {
    pos: vec3<f32>,
    nor: vec3<f32>,
    uv: vec2<f32>,
    rotMat: mat3x3<f32>,
};
