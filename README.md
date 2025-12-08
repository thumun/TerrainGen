# TerrainGen

_Final project for University of Pennsylvania, CIS5650 GPU Programming and Architecture, Fall 2025_

Raymond Feng, Neha Thumu, Thomas Shaw

<img width="1195" height="569" alt="Screenshot 2025-12-07 231302" src="https://github.com/user-attachments/assets/b1dab04f-0c98-46ac-9cde-09d7cb394e71" />

[Link to website! ](https://thumun.github.io/TerrainGen/)

## Overview

TerrainGen is a single-page web application using WebGPU to create a real-time node-based procedural terrain generation and rendering tool. Our motivation for the project was to create an accessible modelling tool on the web to showcase the power of WebGPU.

<img width="500" height="400" alt="image" src="https://github.com/user-attachments/assets/830e006d-f6ba-4b15-9daf-a802301df2bf" />
<img width="500" height="400" alt="Screenshot 2025-12-07 233712" src="https://github.com/user-attachments/assets/9a188925-c8d5-4b1d-ad1a-db0ab446be80" />

### Milestones

1. [Milestone 1 Progress Slides](https://docs.google.com/presentation/d/1IfnNaKhCkMEOW8t8lHOAx6w-G378lC401EXVFlAbnQ0/edit?usp=sharing)
2. [Milestone 2 Progress Slides](https://docs.google.com/presentation/d/1EiJf1spHf-v6SMP9DFZE5cckQX3vl9SmCcZ-_3t7WVw/edit?usp=sharing)
3. [Milestone 3 Progress Slides](https://docs.google.com/presentation/d/1SY8XgbtOQOwFCNqlIhqCft3_o6H0uVIyBBi3s_v93jw/edit?usp=sharing)
4. [Final Presentation](https://docs.google.com/presentation/d/1d1kF9o0qythf8vgfsJAXlKPUyjCBU8piUQctd_OLzT8/edit?usp=sharing)

## How to Use

For a more in-depth look at how to use each node/feature, check out the **[project wiki](https://github.com/thumun/TerrainGen/wiki)**.

### Window Layout

<img width="900" height="945" alt="image" src="https://github.com/user-attachments/assets/3572e3e8-1551-47da-ae8d-d7ba98b7e206" />

Nodes can be added to the canvas element on the left-hand side of the screen and will be renderer on the right side window when the output nodes have the appropriate inputs. The terrain has two additional settings that can be adjusted with the terrain size and resolution sliders below the render screen.

### Import/Export

<img width="385" height="213" alt="Screenshot 2025-12-07 232242" src="https://github.com/user-attachments/assets/1a66c0e5-335a-4202-ab53-0feba296e9d6" />

A user can import/export their node graph.

As an example, here is a saved node graph layout [file](https://github.com/user-attachments/files/23843108/nodegraph-692ce3b8.tgen.json).
If this is imported, then the following node graph will be loaded in.

<img width="500" height="968" alt="image" src="https://github.com/user-attachments/assets/91ac03f7-4fad-4dd1-a62b-5bd242054c49" />

The skybox can also be changed by uploading an HDR file.

## Project Features

- [x] 🔌 Node-based description system for procedural terrain
- [x] 🏭 Just-in-time WebGPU shader code generation
- [x] 🏔️ Real-time terrain rendering
  - [x] Adjustable tesselation and terrain size
  - [x] Varied terrain type rendering (grass, rock, snow, etc)
  - [x] Shadow mapping
  - [x] Distance fog
- [x] 🌲 Mesh instancing across terrain
  - [x] glTF/OBJ import for instancing
     
### JIT Shader Code Generation

Once there is a valid node graph connected to one of our output pipelines (Terrain, Instancing, and Water) our pipeline gets computed and the shader code is generated. Our nodes of type input create uniform keys and each subsequent output handle generates a key on the fly. Each node has specific code that is generated and added to our vertex shader along with references to the aforementioned uniform keys.

### Terrain Rendering

The terrain is a tesselated plane with an adjustable size and resolution. Whenever the size and resolution sliders are changed, a compute shader populates a vertex buffer and an index buffer. A second compute pass gives each vertex on the terrain a normal value, which is calculated based on the position of neighboring vertices.

Once the terrain is created with the compute shaders, it is rendered every frame with lambertian shading, shadow mapping, and distance fog.

The terrain's color can be changed with a dropdown in the Terrain (Output) node.

### Mesh Instancing

TerrainGen also supports OBJ and glTF import, which can be used as part of the instancing pipeline. Users can create multiple instancing pipelines, each of which creates a separate buffer of instancing points on which the desired mesh will be placed. These instancing points are randomly generated on top of the terrain using the Scatter node.

With glTFs, base color textures can be displayed.

## Node Types

- General-purpose
  - [x] Basic math (add, sub, mult, div)
  - [x] Trig math (sin, cos, tan)
- Terrain source
  - [x] Worley noise
- Terrain input
  - [x] Vertex XYZ position
- Terrain output
  - [x] Height
  - [x] Terrain type
  - [x] Water level
- Scattering source
  - [x] Terrain height
  - [x] Instancing node
- Scattering geometry
  - [x] Built-in objects: trees, rocks, bushes
  - [x] Primitive geometry: sphere, cube, plane
  - Custom models
    - [x] OBJ import
    - [x] glTF import

## Appendix

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
- [io-rgbe](https://github.com/DerSchmale/io-rgbe) for HDR loading
