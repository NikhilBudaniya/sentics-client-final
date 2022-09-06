import React, { useState } from 'react'
import { MdHomeFilled } from 'react-icons/md';
import { HiMenuAlt2, HiMenuAlt3 } from 'react-icons/hi';
import NotifiDrawer from './utilities/NotifiDrawer';
import ToggleSwith from './utilities/utilComponents/ToggleSwith';
import { Link, NavLink } from 'react-router-dom';
import ResourceBtns from './LeftNav/ResourceBtns';

function LeftNav() {

  const [menu, setMenu] = useState(false);

  const handlemenu = () => {
    setMenu(!menu);
  }

  return (
    <div className={`shadow-xl h-full bg-white w-[250px] xl:w-full absolute top-0 sm:top-auto z-50 xl:relative ${menu ? 'left-[0px]' : 'xl:left-[0px] sm:left-[-200px] left-[-250px]'} ease-in-out duration-300`}>
      <div className=" border-0 border-red-500">
        <ul>
          <li className='text-xl border-0 pl-5 py-3 border-red-500 font-semibold bg-slate-200'>
            <div className='flex  items-center justify-between'>
              <div className='flex items-center'>
                <span className='text-3xl col text-white bg-black p-1 rounded-full mr-3'><MdHomeFilled /></span>
                DashBoard
              </div>
              <div className={`relative ${menu?'left-[0px] top-[0px]':'left-[45px] sm:left-[0px] top-[-10.5px]'}  p-2 text-[2rem] xl:hidden ease-in-out duration-300`} onClick={handlemenu}>{!menu ? <HiMenuAlt2 /> : <HiMenuAlt3 />}</div>
            </div>
            <div>
              <ul className='text-base font-semibold ml-14 '>
                <NavLink
                  to="/"
                  style={({ isActive }) => {
                    return {
                      color: isActive ? "blue" : "",
                      fontWeight: isActive ? "bold" : "",
                    };
                  }}>
                  <li className='my-2'>Live </li>
                </NavLink>
                <NavLink
                  to="/analytics"
                  style={({ isActive }) => {
                    return {
                      color: isActive ? "blue" : "",
                      fontWeight: isActive ? "bold" : "",
                    };
                  }}>
                  <li className='my-2'>Analytics</li>
                </NavLink>
              </ul>
            </div>
          </li>
          <ResourceBtns />
          <li className='pl-5 my-5 font-semibold'></li>
        </ul>
      </div>
      <div className="absolute w-full bottom-0">
         <NotifiDrawer /> 
      </div>
    </div>
  )
}

export default LeftNav;
