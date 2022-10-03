// Camera reset
export function cameraReset(controls, camera) {
    controls.reset();
    camera.position.setY(60);
    camera.position.setX(1)
    // camera.setRotationFromAxisAngle("y", Math.PI/2)
    // camera.position.setZ (0)
    console.log("clicked")
    camera.lookAt(0, 0, 0)
};