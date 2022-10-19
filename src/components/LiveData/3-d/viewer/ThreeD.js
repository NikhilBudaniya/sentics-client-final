import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import model from './OHLF_V1.gltf';
import forklift from '../data/models/forklift.glb';
import human from '../data/models/human_v3.glb';
import path_image from '../data/images/layout_16_02.jpg';
import { useSelector } from 'react-redux';
import { cameraReset } from '../../../common/functions';

function ThreeD(props) {
    let { liveData } = props;
    // some redux states used for threed model data rendering
    const person_cubes = useSelector((store) => store.threedVars.value.person_cubes);
    const vehicle_cubes = useSelector((store) => store.threedVars.value.vehicle_cubes);
    let show_vehicles = useSelector((store) => store.threedVars.value.showVehicles);
    let show_humans = useSelector((store) => store.threedVars.value.showHumans);

    let img_height = 0;
    let img_width = 0;


    const mountRef = useRef(null);

    let camera, controls;

    useEffect(() => {
        // dimensions used to make model fit
        const pixel_to_meter_ratio = 0.2;
        const size_m_x = 26.22
        const size_m_y = 83.50
        const offset_x = 0;//size_m_x / 2;
        const offset_y = 10; //size_m_y / 2;
        // rotation of image (0 -> 3)
        const rotate_image = 2;

        // creating scene & camera
        const scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, 2, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: mountRef.current
        });

        // changing scene bg
        const globalLoader = new THREE.TextureLoader();
        // scene.background = globalLoader.load(scene_bg);
        scene.background = new THREE.Color("0xffffff")

        // CAMERA POSITIONS/CONFIG
        controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = 1 * Math.PI / 3;

        // load image
        const img = new Image();
        img.onload = function () {
            img_height = pixel_to_meter_ratio * img.height;
            img_width = pixel_to_meter_ratio * img.width;
            loadImages()
        }
        img.src = path_image;
        function loadImages() {
            const geometry = new THREE.PlaneGeometry(size_m_x, size_m_y);
            const texture = new THREE.TextureLoader().load(path_image);
            texture.repeat.set(1, 1);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0 });
            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x -= Math.PI / 2;
            plane.rotation.z += rotate_image * (Math.PI / 2);
            // plane.rotation.z += Math.PI;
            plane.position.y -= 0.01;
            plane.position.x += offset_x;
            plane.position.z += offset_y;
            scene.add(plane);
        }

        // making canvas responsive
        function resizeCanvasToDisplaySize() {
            const canvas = renderer.domElement;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (canvas.width !== width || canvas.height !== height) {
                // you must pass false here or three.js sadly fights the browser
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();

                // set render target sizes here
            } else {
                console.log(width, height);
            }
        }

        resizeCanvasToDisplaySize();

        // set initial camera look at position
        camera.position.setY(60);
        camera.position.setX(1);
        camera.lookAt(0, 0, 0);

        // SAMPLE GEOMETRY
        const geometry2 = new THREE.BoxGeometry(1, 1, 1);
        const material2 = new THREE.MeshBasicMaterial({color: 0x00ff00});
        const cube = new THREE.Mesh(geometry2, material2);


        // LIGHT SOURCES
        // const light = new THREE.AmbientLight(0x404040); // soft white light
        const pointLight = new THREE.PointLight(0x01baef);
        pointLight.position.set(20, 20, 20);
        const ambientLight = new THREE.PointLight(0x404040, 1, 100);
        ambientLight.position.set(0, 0, 0);
        scene.add(ambientLight, pointLight);

        // MODEL LOADER
        const loader = new GLTFLoader();

        // load building model
        loader.load(model, function (gltf) {
            const element = gltf.scene;
            element.name = "OHLF_map";
            element.scale.set(1, 1, 1);
            element.position.x -= 13.4;//12
            element.position.y += 0;
            element.position.z += 52;//5
            // element.rotation.x += Math.PI / 2;//Math.PI / 2;
            element.rotation.y -= Math.PI / 2;

            // BOX AROUND THE 3D MODEL FOR HELPING IN DEVELOPMENT
            // const box = new THREE.BoxHelper(element, 0xffff00);
            // scene.add(box);
            // scene.add(cube);
            scene.add(element);
        }, undefined, function (error) {
            console.error(error);
        });


        // load a froklift
        loader.load(forklift, function (object) {
            let element = object.scene;
            element.name = "forklift";
            element.scale.set(0.0090, 0.0090, 0.0090);
            element.visible = false;
            scene.add(element);
        },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened', error);
            }
        );

        // load a human
        loader.load(human, function (object) {
            let element = object.scene;
            element.name = "human";
            element.scale.set(1, 1, 1);
            element.visible = false;
            element.translateX(10);
            scene.add(element);
        },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened', error);
                // return new THREE.Mesh(v_geometry, v_material);
            }
        );

        // LIVE DATA FUNCTION
        // vars for live data
        const person_ids = [];
        const person_timeout = [];
        const temp_person_cubes = [...person_cubes];

        const vehicle_ids = [];
        const vehicle_timeout = [];
        const temp_vehicle_cubes = [...vehicle_cubes];
        const tempHandle = async (data) => {
            for (let i = 0; i < data.length; i++) {
                const positions = (data[i].value);
                if (data[i].type == "human" && show_humans) {
                    for (let c = 0; c < person_timeout.length; c++) {
                        if (person_timeout[c] > 0) {
                            person_timeout[c] -= 1;
                        } else {
                            temp_person_cubes[c].visible = false;
                        }
                    }
                    for (var pos_id in positions) {
                        var object = scene.getObjectByName("human").clone();
                        object.visible = true;
                        object.position.setX(parseFloat(positions[pos_id].x - 13.4));
                        object.position.setY(parseFloat(1.5));
                        object.position.setZ(parseFloat(-positions[pos_id].y + 52));

                        if (!person_ids.includes(pos_id)) {
                            person_ids.push(pos_id);
                            temp_person_cubes.push(object);
                            person_timeout.push(10);
                            scene.add(object);
                        } else {
                            for (let c = 0; c < person_ids.length; c++) {
                                if (person_ids[c] == pos_id) {
                                    temp_person_cubes[c].position.setX(parseFloat(positions[pos_id]["x"] - 13.4));
                                    temp_person_cubes[c].position.setZ(parseFloat(-positions[pos_id]["y"] + 52));
                                    temp_person_cubes[c].visible = true;
                                }
                            }
                        }
                    }
                }
                else if (data[i].type == "vehicle" && show_vehicles) {
                    var object = scene.getObjectByName("forklift").clone();
                    object.visible = true;
                    for (var pos_id in positions) {
                        for (let c = 0; c < vehicle_timeout.length; c++) {
                            if (vehicle_timeout[c] > 0) {
                                vehicle_timeout[c] -= 1;
                            } else {
                                temp_vehicle_cubes[c].visible = false;
                            }
                        }
                        if (!vehicle_ids.includes(pos_id)) {
                            vehicle_ids.push(pos_id);
                            temp_vehicle_cubes.push(object);
                            scene.add(object);
                            object.position.setX(parseFloat(positions[pos_id].x - 13.4));
                            object.position.setY(parseFloat(1.0));
                            object.position.setZ(parseFloat(-positions[pos_id].y + 52));
                            object.rotation.y += Math.PI / 2;
                        } else {
                            for (let c = 0; c < vehicle_ids.length; c++) {
                                if (vehicle_ids[c] == pos_id) {
                                    temp_vehicle_cubes[c].position.setX(parseFloat(positions[pos_id].x - 13.4));
                                    temp_vehicle_cubes[c].position.setZ(parseFloat(-positions[pos_id].y + 52));
                                    temp_vehicle_cubes[c].visible = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        let myInterval = setInterval(async () => {
            console.log("fetching live data");
            tempHandle(liveData);
        }, 500);

        const animate = function () {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
            controls.update(0.01)
        };


        animate();
        return () => clearInterval(myInterval);
    }, [show_humans, show_vehicles]);

    // BUTTON FUNCTIONS

    return (
        <>
            <div className="w-[100%] h-full overflow-hidden">

                <div className="viewer responsiveDim">
                    <canvas ref={mountRef} className="threedModel">

                    </canvas>
                </div>
                <div className="absolute flex bottom-2 lg:bottom-12 ml-5">
                    <button onClick={() => {cameraReset(controls, camera); console.log(camera);}} type="button" className="text-[#10449A] bg-white m-1 flex justify-center py-2 px-4 hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-200  transition ease-in duration-200 text-center font-semibold heatmapButton focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl ">
                        Reset
                    </button>
                </div>
            </div>

        </>
    )
}

export default ThreeD