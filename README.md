# TerrainGen

_Final project for CIS5650_

![Milestone 1 Demo](./docs/images/milestone_01_demo.webp)

## Motivation

This is a single-page web application using WebGPU to create a real-time node-based procedural terrain generation tool.

### Milestones

1. [Milestone 1 Progress Slides](https://docs.google.com/presentation/d/1IfnNaKhCkMEOW8t8lHOAx6w-G378lC401EXVFlAbnQ0/edit?usp=sharing)
2. [Milestone 2 Progress Slides](https://docs.google.com/presentation/d/1EiJf1spHf-v6SMP9DFZE5cckQX3vl9SmCcZ-_3t7WVw/edit?usp=sharing)

### Feature checklist

- [x] 🔌 Node-based description system for procedural terrain
- [x] 🏭 Just-in-time WebGPU shader code generation
- [x] 🏔️ Real-time terrain rendering
  - [x] Adjustable tesselation and terrain size
  - [ ] Varied terrain type rendering (grass, rock, snow, etc)
- [ ] 🔎 Real-time in-editor node previews
- [x] 🌲 Mesh instancing across terrain
  - [ ] Mesh import for instancing
- [ ] 💾 Export to glTF or similar format

#### Node types:

- General-purpose
  - [x] Basic math (add, sub, mult, div)
  - [x] Trig math (sin, cos, tan)
  - [ ] Masking/graphics util (mix, lt, gt, min, max)
- Terrain source
  - [ ] Perlin noise
  - [ ] Custom image texture
- Terrain input
  - [x] Vertex XYZ position
- Terrain output
  - [x] Height
  - [ ] Terrain type
- Scattering source
  - [ ] Terrain height
  - [ ] Voronoi scattering
- Scattering geometry
  - [ ] Built-in objects: trees, rocks, bushes
  - [ ] Primitive geometry: sphere, cube, plane, line
  - Custom models
    - [x] OBJ import
    - [ ] glTF import
  - [ ] Vegetation → like Unreal’s PCG

## Development

To run this application:

```bash
npm install
npm run dev
```

### Building For Production

To build this application for production:

```bash
npm run build
```

The resulting static content will be in the `dist` folder. You can preview these with `npm run preview`.

We have created a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically deploy static content to GitHub Pages.

### Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

### Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
npm run typecheck  # just runs tsc
npm run lint
npm run lint:fix  # automatically fix issues
npm run format
npm run format:check  # don't write to any files, just report issues
```

## Third-party libraries

- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [React](https://react.dev/) for DOM manipulation
- [TanStack Router](https://tanstack.com/router). The initial setup is a code based router. Which means that the routes are defined in code (in the `./src/main.tsx` file). If you like you can also use a file based routing setup by following the [File Based Routing](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing) guide.
- [React Flow](https://reactflow.dev/) for node editor functionality
- [loaders.gl](https://loaders.gl/) for reading/writing of external files
