import './Area.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import { Fragment, useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import h337 from "heatmap.js";
import mapImage from "../assets/images/OHLF-Zeichung.png";
import { BiReset, BiPlus, BiMinus, BiRotateRight, BiRotateLeft, BiTrash, BiShow, BiHide, BiSave } from "react-icons/bi";
import { MdOutlineCancel } from "react-icons/md";
import { TbFlipHorizontal } from 'react-icons/tb';
import axios from "axios";
import Moveable from 'react-moveable';
import randomColor from 'randomcolor';

let heatmap;
let pointdata = [{ x: 1000, y: 0, value: 50 }, { x: 1500, y: 400, value: 5 }, { x: 1400, y: 700, value: 5 }];
function addHeatMap(ctn) {
  heatmap = h337.create({
    container: ctn
  });
  heatmap.setData({
    max: 5,
    data: pointdata
  });
}

function Area() {
  const mount = useRef(null);
  const [imgSrc, setImgSrc] = useState("");
  let centerViewFunction = undefined;
  const [creatingArea, setCreatingArea] = useState(false);
  const [selectAreas, setSelectAreas] = useState([]);
  const colorConditions = ["Always", "Human Presence", "Human Absence",
    "Vehicle Presence", "Vehicle Absent", "Never"];
  useEffect(() => {
    mount.current.style.rotate = "0deg";
    removeOldCanvas();
    setImgSrc(mapImage);
    axios.get("/selected_area").then(res => {
      setSelectAreas([...res.data]);
    });
  }, []);

  function removeOldCanvas() {
    document.querySelector(".heatmap canvas")?.remove();
  }

  function imageLoaded(e) {
    removeOldCanvas();
    const imgWidth = e.target.naturalWidth;
    const imgHeight = e.target.naturalHeight;
    const parentWidth = mount.current.parentNode.parentNode.clientWidth;
    const parentHeight = mount.current.parentNode.parentNode.clientHeight;
    e.target.style.width = imgWidth + "px";
    mount.current.style.width = imgWidth + "px";
    e.target.style.height = imgHeight + "px";
    mount.current.style.height = imgHeight + "px";
    let scaleX = imgWidth / parentWidth;
    scaleX = 1 / scaleX;
    let scaleY = imgHeight / parentHeight;
    scaleY = 1 / scaleY;
    centerViewFunction(Math.min(scaleX, scaleY));
    addHeatMap(mount.current);
  }

  function rotate(deg) {
    let initRotateX = parseFloat(mount.current.style.rotate);
    initRotateX += deg;
    mount.current.style.rotate = initRotateX + "deg";
  }

  function onSelectAreaChange() {
    setSelectAreas([...selectAreas]);
  }

  const createArea = (e) => {
    if (e.target.tagName !== "CANVAS" || !creatingArea) return;
    let scale = e.currentTarget.getBoundingClientRect().width / e.currentTarget.clientWidth;
    scale = scale < 1 ? 1 : scale;
    const areas = selectAreas[selectAreas.length - 1].areas;
    const width = 200 / scale;
    const height = 200 / scale;
    const x = e.nativeEvent.offsetX - (width / 2);
    const y = e.nativeEvent.offsetY - (height / 2);
    areas.push({ x: x, y: y, width: width, height: height, rotate: 0 });
    console.log(areas);
    setSelectAreas([...selectAreas]);
  }

  function showThisAreaOnly(selectArea) {
    selectAreas.forEach(area => area.display = false);
    selectArea.display = true;
    setSelectAreas([...selectAreas]);
  }

  function deleteArea(index) {
    selectAreas.splice(index, 1);
    setSelectAreas([...selectAreas]);
  }

  function saveArea() {
    axios.post("/selected_area", selectAreas);
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="heatmap">
          <TransformWrapper
            minScale={0.1}
            limitToBounds={false}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView, ...rest }) => {
              centerViewFunction = centerView;
              return (
                <Fragment>
                  <div className="tools">
                    <button onClick={() => zoomIn()}><BiPlus /></button>
                    <button onClick={() => zoomOut()}><BiMinus /></button>
                    <button onClick={() => rotate(90)}><BiRotateRight /></button>
                    <button onClick={() => rotate(-90)}><BiRotateLeft /></button>
                    <button onClick={() => {
                      mount.current.style.scale = !mount.current.style.scale ? "-1 1" : "";
                    }}><TbFlipHorizontal /></button>
                    <button onClick={() => {
                      mount.current.children[0].dispatchEvent(new Event("load"));
                      mount.current.style.rotate = "0deg";
                    }}><BiReset /></button>
                  </div>
                  <div className="area-panel">
                    <div className="text-center">Area</div>
                    {!creatingArea ?
                      <button onClick={(e) => {
                        setCreatingArea(true);
                        document.querySelector(".area-name").style.display = "block";
                      }}><BiPlus /></button> :
                      <button onClick={(e) => setCreatingArea(false)}><MdOutlineCancel /></button>
                    }
                    <button onClick={saveArea}><BiSave /></button>
                  </div>
                  <div className="area-name">
                    <div>
                      <label htmlFor="area-name" className="text-2xl">Area Name</label>
                      <input name="area-name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <button
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={e => {
                          const areaNameInput = document.getElementsByName("area-name")[0];
                          const name = areaNameInput.value;
                          if (name === "" || selectAreas.find(selectArea => selectArea.name === name))
                            areaNameInput.classList.add("border-red-400");
                          else {
                            areaNameInput.classList.remove("border-red-400");
                            selectAreas.push({
                              name: name,
                              display: true,
                              areas: [],
                              bgColor: randomColor()
                            });
                            setSelectAreas([...selectAreas]);
                            document.querySelector(".area-name").style.display = "none";
                            areaNameInput.value = "";
                          }
                        }}
                      >Save</button>
                    </div>
                  </div>
                  {!creatingArea ?
                    <div className="area-list">
                      <div>
                        <h1 className="text-2xl">Area List</h1>
                        <ul className="overflow-y-scroll max-h-[200px] list-style-none">
                          {selectAreas.map((selectArea, index) =>
                            <li key={index} className="flex justify-between bg-blue-50 items-center rounded-md p-2 select-none my-2">
                              <div className="font-bold">{selectArea.name}</div>
                              <div className="flex justify-between items-center">
                                <div className="area-color flex justify-between items-center">
                                  <div className="pr-1">
                                    <label className="block">Green</label>
                                    <select className="w-[100px]" value={selectArea.green} onChange={e => {
                                      selectArea.green = e.target.value;
                                      setSelectAreas([...selectAreas]);
                                    }}>
                                      <option>Select</option>
                                      {
                                        (colorConditions.filter(item => item !== selectArea.yellow && item !== selectArea.red))
                                          .map(condition => <option key={condition}>{condition}</option>)
                                      }
                                    </select>
                                  </div>
                                  <div className="px-2">
                                    <label className="block">Yellow</label>
                                    <select className="w-[100px]" value={selectArea.yellow} onChange={e => {
                                      selectArea.yellow = e.target.value;
                                      setSelectAreas([...selectAreas]);
                                    }}>
                                      <option>Select</option>
                                      {
                                        (colorConditions.filter(item => item !== selectArea.green && item !== selectArea.red))
                                          .map(condition => <option key={condition}>{condition}</option>)
                                      }
                                    </select>
                                  </div>
                                  <div className="px-2">
                                    <label className="block">Red</label>
                                    <select className="w-[100px]" value={selectArea.red} onChange={e => {
                                      selectArea.red = e.target.value;
                                      setSelectAreas([...selectAreas]);
                                    }}>
                                      <option>Select</option>
                                      {
                                        (colorConditions.filter(item => item !== selectArea.green && item !== selectArea.yellow))
                                          .map(condition => <option key={condition}>{condition}</option>)
                                      }
                                    </select>
                                  </div>
                                </div>
                                <div className="flex">
                                  <div className="mx-2 mt-2" onClick={() => deleteArea(index)}><BiTrash /></div>
                                  <div className="mx-2 mt-2" onClick={() => showThisAreaOnly(selectArea)}>{selectArea.display ? <BiShow /> : <BiHide />}</div>
                                  <div>
                                    <input type="color" value={selectArea.bgColor} className="w-[20px] h-[20px] mx-2 mt-1.5" onChange={e => {
                                      selectArea.bgColor = e.target.value;
                                      setSelectAreas([...selectAreas]);
                                    }} />
                                  </div>
                                </div>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div> : <></>}
                  <TransformComponent>
                    <div ref={mount} style={{ cursor: creatingArea ? "crosshair" : "default" }} onClick={createArea}>
                      <img src={imgSrc} alt="" onLoad={imageLoaded} />
                      {selectAreas.map((selectArea) =>
                        selectArea.areas.map((area, index) =>
                          <div key={index} style={{ display: selectArea.display ? "block" : "none" }}>
                            <SelectArea selectArea={area} onChange={onSelectAreaChange} bgColor={selectArea.bgColor} />
                          </div>
                        )
                      )}
                    </div>
                  </TransformComponent>
                </Fragment>
              )
            }}
          </TransformWrapper>
        </div>
      } />
    </Routes >
  );
}

function SelectArea({ selectArea, onChange, bgColor }) {
  const targetRef = useRef(null);

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <div ref={targetRef} style={{
        position: "absolute", width: selectArea.width, height: selectArea.height,
        zIndex: 10, border: "1px solid black",
        transform: `translate(${selectArea.x}px, ${selectArea.y}px) rotate(${selectArea.rotate}deg)`,
        cursor: "move", backgroundColor: bgColor, opacity: 0.4
      }}>
      </div>
      <Moveable
        target={targetRef}
        container={null}
        origin={true}
        edge={false}
        draggable={true}
        throttleDrag={0}
        onDragStart={({ inputEvent }) => {
          inputEvent.stopPropagation();
        }}

        onDrag={({
          target,
          transform,
        }) => {
          target.style.transform = transform;
        }}

        onDragEnd={({ target }) => {
          const res = target.style.transform.match(/translate\((-?\d+(?:\.\d*)?)px, (-?\d+(?:\.\d*)?)px\)/);
          selectArea.x = res[1];
          selectArea.y = res[2];
          onChange();
        }}

        resizable={true}
        onResizeStart={({ inputEvent }) => {
          inputEvent.stopPropagation();
        }}

        onResize={({
          target, width, height, delta
        }) => {
          delta[0] && (target.style.width = `${width}px`);
          delta[1] && (target.style.height = `${height}px`);
        }}

        onResizeEnd={({ target }) => {
          const { width, height } = target.style;
          selectArea.width = width;
          selectArea.height = height;
          onChange();
        }}

        rotatable={true}
        throttleRotate={0}
        onRotateStart={({ inputEvent }) => {
          inputEvent.stopPropagation();
        }}

        onRotate={({
          target,
          transform,
        }) => {
          target.style.transform = transform;
        }}

        onRotateEnd={({ target }) => {
          const rotate = parseFloat(target.style.transform.split("rotate")[1].split("deg")[0].split("(")[1]);
          selectArea.rotate = rotate;
          onChange();
        }}
      />
    </div>
  )
};

export default Area;
