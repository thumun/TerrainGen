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
