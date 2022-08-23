import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BiRotateRight, BiRotateLeft, BiMinus } from 'react-icons/bi';
import { BsPlusLg } from 'react-icons/bs';

function ThreeD() {
    const path_image = '../data/images/layout_16_02.jpg';
    const pixel_to_meter_ratio = 0.2;
    const size_m_x = 26.22
    const size_m_y = 83.50
    const offset_x = 0;//size_m_x / 2;
    const offset_y = 10; // size_m_y / 2;
    // rotation of image (0 -> 3)
    const rotate_image = 2;


    // show vehicles
    var show_vehicles = true;

    // Camera reset
    function cameraReset() {
        controls.reset();
        camera.position.setY(60);
        camera.position.setX(1)
        // camera.setRotationFromAxisAngle("y", Math.PI/2)
        // camera.position.setZ (0)
        camera.lookAt(0, 0, 0)
    };

    // Setup
    let renderer;
    let controls;
    useEffect(() => {
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("threedcanvas")
        });
        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = 1 * Math.PI / 3;

        // buttons
        var btn_resetView = document.getElementById('btn_resetView');
        btn_resetView.onclick = function () {
            console.log("[INFO] reset view");
            cameraReset()
        }

        var btn_toggleGrid = document.getElementById('btn_toggleGrid');
        btn_toggleGrid.onclick = function () {
            console.log("[INFO] toggle grid");
            scene.getObjectByName("gridHelper").visible = !scene.getObjectByName("gridHelper").visible;
        }

        var btn_hideDoubles = document.getElementById('btn_hideDoubles');
        btn_hideDoubles.onclick = function () {
            console.log("[INFO] hide doubles");
            for (var i = 0; i < person_cubes.length; i++) {
                person_cubes[i].visible = false;
            }
            for (var i = 0; i < vehicle_cubes.length; i++) {
                vehicle_cubes[i].visible = false;
            }
        }

        var btn_toggleVehicles = document.getElementById('btn_toggleVehicles');
        btn_toggleVehicles.onclick = function () {
            console.log("[INFO] toggle vehicles");
            show_vehicles = !show_vehicles;
            for (var i = 0; i < vehicle_cubes.length; i++) {
                vehicle_cubes[i].visible = false;
            }
        }

        function resizeCanvasToDisplaySize() {
            const canvas = renderer?.domElement;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (canvas.width !== width || canvas.height !== height) {
                // you must pass false here or three.js sadly fights the browser
                renderer?.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();

                // set render target sizes here
            } else {
                console.log(width, height);
            }
        }

        resizeCanvasToDisplaySize();

        // Render
        function animate() {
            // postData();
            // updateLabels();
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        animate();
        cameraReset();
    }, [])



    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 1000);

    // Lights
    const pointLight = new THREE.PointLight(0xffff00);
    pointLight.position.set(20, 20, 20);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(pointLight, ambientLight);

    document.addEventListener("keydown", onDocumentKeyDown, false);
    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 82) {
            cameraReset()
        }
        if (keyCode == 76) {
            // loadValues();
            console.log("loadvalue()");
        }
    };

    // load image
    var img = new Image();
    var img_height = 0;
    var img_width = 0;
    img.onload = function () {
        img_height = pixel_to_meter_ratio * img.height;
        img_width = pixel_to_meter_ratio * img.width;
        loadImages()
    }
    img.src = path_image;
    function loadImages() {
        // display grid
        if (size_m_x > size_m_y) {
            const gridHelper = new THREE.GridHelper(size_m_x, size_m_x)
            gridHelper.name = "gridHelper";
            gridHelper.visible = false;
            scene.add(gridHelper);
        } else {
            const gridHelper = new THREE.GridHelper(size_m_y, size_m_y)
            gridHelper.name = "gridHelper";
            gridHelper.visible = false;
            scene.add(gridHelper);
        }



        const geometry = new THREE.PlaneGeometry(size_m_x, size_m_y);
        const texture = new THREE.TextureLoader().load(path_image);
        texture.repeat.set(1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x -= Math.PI / 2;
        plane.rotation.z += rotate_image * (Math.PI / 2);
        // plane.rotation.z += Math.PI;
        plane.position.y -= 0.01;
        plane.position.x += offset_x;
        plane.position.z += offset_y;
        scene.add(plane);
    }


    // materials
    const p_geometry = new THREE.BoxGeometry(0.5, 2.0, 0.5);
    const p_material = new THREE.MeshBasicMaterial({ color: 0x9756B8 });
    const v_geometry = new THREE.BoxGeometry(1, 2.0, 2);
    const v_material = new THREE.MeshBasicMaterial({ color: 0x726E74 });

    // forklift
    const objloader = new GLTFLoader();

    // load a resource
    objloader.load(
        // resource URL
        '../data/models/forklift.gltf',
        function (object) {
            var element = object.scene;
            element.name = "forklift";
            element.scale.set(0.0100, 0.0100, 0.0100);
            // console.log(typeof element);
            element.visible = false;
            scene.add(element);
            return element;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened', error);
            return new THREE.Mesh(v_geometry, v_material);
        }
    );

    // load a resource
    objloader.load(
        '../data/models/human_v3.glb',
        function (object) {
            var element = object.scene;
            element.name = "human";
            element.scale.set(0.5, 0.5, 0.5);
            element.position.setY(0);
            element.visible = false;
            scene.add(element);
            return element;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened', error);
            return new THREE.Mesh(v_geometry, v_material);
        }
    );

    // load map
    objloader.load(
        // resource URL
        '../data/models/OHLF_V1.gltf',
        function (gltf) {
            var element = gltf.scene;
            element.name = "OHLF_map";
            element.scale.set(1, 1, 1);
            element.position.x -= 13.4;//12
            element.position.y += 0;
            element.position.z += 52;//5
            // element.rotation.x += Math.PI / 2;//Math.PI / 2;
            element.rotation.y -= Math.PI / 2;
            // element.center();
            // element.rotation.z += Math.PI / 2; //rotate_image * (Math.PI / 2);
            //element.applyMatrix( new THREE.Matrix4().makeTranslation(x, y, z) );
            //console.log(typeof element);
            //element.visible = true;

            const box = new THREE.BoxHelper(element, 0xffff00);
            scene.add(box);
            //var objAxis = new THREE.AxesHelper(10);
            //element.add(objAxis);
            //objAxis.translateX(low.x);
            //objAxis.translateY(low.y);
            //objAxis.translateZ(low.z);
            scene.add(element);
            //var target = new THREE.Vector3(); // create once an reuse it
            //element.getWorldPosition( target );
            //element.translateX(target.x);
            //element.translateY(target.y);
            //element.translateZ(target.z);

            return element;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened', error);
            return new THREE.Mesh(v_geometry, v_material);
        }
    );

    // wait for models to load correctly
    // await new Promise(r => setTimeout(r, 2000));

    // vars for 
    var counter = 1000;
    var person_ids = [];
    var person_cubes = [];
    var person_timeout = [];
    var persons_active = 0;

    var vehicle_ids = [];
    var vehicle_cubes = [];
    var vehicle_timeout = [];
    var vehicles_active = 0;



    return (
        <div>
            <div className="w-52 h-52">

                <canvas width="200px" height="200px" className="bg-red-200" id="threedcanvas">

                </canvas>

            </div>
            <div>
                <button id="btn_toggleGrid" type="button" className="text-[#10449A] mx-1 flex justify-center w-10 py-2 px-4 hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-200 w-full transition ease-in duration-200 text-center font-semibold heatmapButton focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl ">
                    <BsPlusLg size="20px" />
                    TG
                </button>
                <button id="btn_hideDoubles" type="button" className="text-[#10449A] mx-1 flex justify-center w-10 py-2 px-4 hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-200 w-full transition ease-in duration-200 text-center font-semibold heatmapButton focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl ">
                    <BiMinus size="20px" />
                    HD
                </button>
                <button id="btn_resetView" type="button" className="text-[#10449A] mx-1 flex justify-center w-14 py-2 px-4 hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-200 w-full transition ease-in duration-200 text-center font-semibold heatmapButton focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl ">
                    Reset
                </button>
                <button id="btn_toggleVehicles" type="button" className="text-[#10449A] mx-1 w-14 py-2 px-4 flex justify-center hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-200 w-full transition ease-in duration-200 text-center font-semibold heatmapButton focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl ">
                    <BiRotateLeft size="20px" />
                    TV
                </button>
                <button type="button" className="text-[#10449A] mx-1 w-14 py-2 px-4 flex justify-center hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-200 w-full transition ease-in duration-200 text-center font-semibold heatmapButton focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl ">
                    <BiRotateRight size="20px" />
                </button>
            </div>
        </div>
    )
}

export default ThreeD