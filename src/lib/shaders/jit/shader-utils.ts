export const fbmNoise =
  // TODO: import actual wgsl noise method
  () => `fn fbm_noise(pos: vec3f, numOctaves: u32) -> f32 {
	let result = 0.0;
	let amplitude = 1.0;
	let frequency = 0.005;

	for (let octave = 0; octave < numOctaves; octave++) {
		const n = amplitude * Noise2D(x * frequency, y * frequency);
		result += n;

		amplitude *= 0.5;
		frequency *= 2.0;
	}

	return result;
}`;

export const random3D = () => `fn random3D(seed: vec3f) -> vec3f {
	let dot_product = dot(seed, vec3f(12.9898, 78.233, 45.164));
	let sin_value = sin(dot_product) * 43758.5453;
	let fract_value = fract(sin_value);
	
	return vec3f(fract_value, fract_value, fract_value);
}`;

export const worleyNoise = () => `fn worley_noise(pos: vec3f) -> f32 {
	var posInt = floor(pos);
	var posFract = fract(pos);
	var minDist = 1.0; // max val

	for (var z: i32 = -1; z <= 1; z = z + 1) {
		for (var y: i32 = -1; y <= 1; y = y + 1) {
			for (var x: i32 = -1; x <= 1; x = x + 1) {
				var neighbor = vec3f(f32(x), f32(y), f32(z)); // dir of neighbor 
				var point = random3D(posInt + neighbor); // gets voronoi point in neighboring cell 
				var diff = neighbor + point - posFract; // gets distance of point and currPos
				var dist = length(diff); 
				minDist = min(minDist, dist); // updates min if new min reached 
			}
		} 
	}

	return minDist;
}`;
