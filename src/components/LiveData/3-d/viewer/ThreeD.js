import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// import {GUI} from './jsm/libs/lil-gui.module.min.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { BiRotateRight, BiRotateLeft, BiMinus } from 'react-icons/bi';
import { BsPlusLg, BsSkype } from 'react-icons/bs';
import model from './OHLF_V1.gltf';
import forklift from '../data/models/forklift.glb';
import human from '../data/models/human_v2.glb';
import path_image from '../data/images/layout_16_02.jpg';
import scene_bg from '../data/images/bgImg1.jpg';
// import { Sky } from 'three-sky';

// import model from "../data/models/OHLF_V1.gltf";

function ThreeD() {
    const mountRef = useRef(null);

    useEffect(() => {

        // creating scene & camera
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 2, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer();

        // changing scene bg
        const globalLoader = new THREE.TextureLoader();
        scene.background = globalLoader.load(scene_bg);

        // CAMERA POSITIONS/CONFIG
        // camera.position.x = 0;
        // camera.position.y = 0;
        // camera.position.z = 5;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = 1 * Math.PI / 3;

        camera.position.setY(60);
        camera.position.setX(1);
        camera.lookAt(0, 0, 0);

        // size of the rendering window
        renderer.setSize(1000, 500);
        mountRef.current.appendChild(renderer.domElement);

        // SKY DOME
        // var skyGeo = new THREE.SphereGeometry(100000, 25, 25);
        // var skyTexture = new THREE.TextureLoader().load(sky_img);
        // var skyMaterial = new THREE.MeshPhongMaterial({
        //     map: skyTexture,
        // });
        // var sky = new THREE.Mesh(skyGeo, skyMaterial);
        // sky.material.side = THREE.BackSide;
        // scene.add(sky);
        // const sky = new Sky();
        // sky.scale.setScalar(450000);
        // scene.add(sky);

        // BACKGROUND PLANE / PNG
        const geometry = new THREE.PlaneGeometry(26.22, 83.50);
        const texture = new THREE.TextureLoader().load(path_image);
        texture.repeat.set(1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, color: '#fff' });
        // material.alphaMap
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x -= Math.PI / 2;
        plane.rotation.z += 2 * (Math.PI / 2);
        // plane.rotation.z += Math.PI;
        plane.position.y -= 0.01;
        plane.position.x += 0;
        plane.position.z += 10;
        scene.add(plane);

        // SAMPLE GEOMETRY
        var geometry2 = new THREE.BoxGeometry(1, 1, 1);
        var material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry2, material2);


        // FLYING CONTROLS TO FLY AROUND THE SPACE FREELY
        // var controls = new FlyControls(camera, renderer.domElement);
        // controls.movementSpeed = 5000;
        // controls.rollSpeed = Math.PI / 24;
        // controls.autoForward = false;
        // controls.dragToLook = true;


        // LIGHT SOURCES
        // const light = new THREE.AmbientLight(0x404040); // soft white light
        const pointLight = new THREE.PointLight(0x01baef);
        pointLight.position.set(20, 20, 20);
        const ambientLight = new THREE.PointLight(0x404040, 1, 100);
        ambientLight.position.set(0, 0, 0);
        scene.add(ambientLight, pointLight);

        // MODEL LOADER
        const loader = new GLTFLoader();

        loader.load(model, function (gltf) {
            var element = gltf.scene;
            element.scale.set(1, 1, 1);
            element.position.x -= 13.4;//12
            element.position.y += 0;
            element.position.z += 52;//5
            // element.rotation.x += Math.PI / 2;//Math.PI / 2;
            element.rotation.y -= Math.PI / 2;

            // BOX AROUND THE 3D MODEL FOR HELPING IN DEVELOPMENT
            const box = new THREE.BoxHelper(element, 0xffff00);
            scene.add(box);
            // scene.add(cube);
            scene.add(element);
        }, undefined, function (error) {
            console.error(error);
        });


        const v_geometry = new THREE.BoxGeometry(1, 2.0, 2);
        const v_material = new THREE.MeshBasicMaterial({ color: 0x726E74 });

        // load a froklift
        loader.load(forklift, function (object) {
            let element = object.scene;
            element.scale.set(0.0090, 0.0090, 0.0090);
            // object.layer
            // console.log(element);
            element.visible = false
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

        // load a human
        loader.load(human, function (object) {
            let element = object.scene;
            element.scale.set(0.0090, 0.0090, 0.0090);
            element.translateX(10);
            // object.layer
            // console.log(element);
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

        // scene.add(cube);

        var animate = function () {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
            controls.update(0.01)
        }

        animate();
        return () => mountRef.current.removeChild(renderer.domElement);

    }, [])


    return (
        <div>
            <div ref={mountRef} className="threedModel w-[500px] h-[500px]">

                {/* <canvas ref={mountRef} width="500px" height="500px" className="" id="threedcanvas">

                </canvas> */}

            </div>
        </div>
    )
}

export default ThreeD