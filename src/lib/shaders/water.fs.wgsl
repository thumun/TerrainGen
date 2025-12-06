struct FragmentInput
{
    @location(0) pos: vec3f,
    @location(1) nor: vec3f,
    @location(2) uv: vec2f
}

fn random3D(seed: vec3f) -> vec3f {
	let dot_product = dot(seed, vec3f(12.9898, 78.233, 45.164));
	let sin_value = sin(dot_product) * 43758.5453;
	let fract_value = fract(sin_value);
	
	return vec3f(fract_value, fract_value, fract_value);
}

fn worley_noise(pos: vec3f) -> f32 {
	var posInt = floor(pos);
	var posFract = fract(pos);
	var minDist = 1.0;

	for (var z: i32 = -1; z <= 1; z = z + 1) {
		for (var y: i32 = -1; y <= 1; y = y + 1) {
			for (var x: i32 = -1; x <= 1; x = x + 1) {
				var neighbor = vec3f(f32(x), f32(y), f32(z));
				var point = random3D(posInt + neighbor);
				var diff = neighbor + point - posFract;
				var dist = length(diff); 
				minDist = min(minDist, dist);
			}
		} 
	}

	return minDist;
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;

@fragment
fn main(in: FragmentInput) -> @location(0) vec4f
{
    // Use Y (height) as time component for animation
    let scale = 3.0;
    let animatedPos = vec3f(
        in.pos.x * scale,
        in.pos.z * scale,
        in.pos.y * 2.0  // Use height as pseudo-time
    );
    
    // Sample Worley noise at multiple scales for detail
    let noise1 = worley_noise(animatedPos);
    let noise2 = worley_noise(animatedPos * 2.0 + vec3f(100.0, 100.0, 100.0));
    let noise3 = worley_noise(animatedPos * 4.0 + vec3f(200.0, 200.0, 200.0));
    
    // Combine noises for layered caustic effect
    let combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    
    // Create caustics by inverting and applying power
    let caustic = pow(1.0 - combinedNoise, 2.5);
    
    // Define water colors
    let deepWaterColor = vec3f(0.0, 0.15, 0.3);      // Deep blue
    let shallowWaterColor = vec3f(0.2, 0.5, 0.7);    // Lighter cyan-blue
    let causticColor = vec3f(0.6, 0.8, 1.0);         // Bright highlights
    
    // Mix based on caustic pattern
    var waterColor = mix(deepWaterColor, shallowWaterColor, caustic);
    waterColor = mix(waterColor, causticColor, caustic * caustic * 0.5);
    
    // Add lighting
    let lightDir = normalize(vec3f(-1.0, 1.0, -1.0));
    let diffuse = max(dot(in.nor, lightDir), 0.2);
    var finalColor = waterColor * diffuse;
    
    // Add specular highlights for water sparkle
    let viewDir = normalize(camera.viewDir.xyz);
    let halfDir = normalize(lightDir + viewDir);
    let specular = pow(max(dot(in.nor, halfDir), 0.0), 64.0);
    finalColor = finalColor + vec3f(specular * 0.8);
    
    // Add edge foam/fresnel effect
    let viewDotNormal = abs(dot(viewDir, in.nor));
    let fresnel = pow(1.0 - viewDotNormal, 3.0);
    finalColor = mix(finalColor, vec3f(0.9, 0.95, 1.0), fresnel * 0.3);
    
    return vec4f(finalColor, 0.85); // Semi-transparent for depth feel
}