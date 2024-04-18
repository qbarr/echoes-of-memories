// Expose a basic orthographic camera to use for postpro with bigTriangle
import { OrthographicCamera } from 'three';

const screenCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
screenCam.parent = true;

export default screenCam;
