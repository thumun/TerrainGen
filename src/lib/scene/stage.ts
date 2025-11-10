import { Camera } from "./camera";

export class Stage {
    camera: Camera;

    constructor(camera: Camera) {
        this.camera = camera;
    }
}
