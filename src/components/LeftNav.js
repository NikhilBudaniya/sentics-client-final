import React, { useState } from 'react'
import { MdHomeFilled } from 'react-icons/md';
import { HiMenuAlt2, HiMenuAlt3 } from 'react-icons/hi';
import NotifiDrawer from './utilities/NotifiDrawer';
import ToggleSwith from './utilities/utilComponents/ToggleSwith';

function LeftNav() {

  const [menu, setMenu] = useState(true)

  

  const handlemenu = () => {
    setMenu(!menu);
  }

  return (
    <div className={`shadow-xl navHeight overflow-hidden bg-white sm:w-[250px] xl:w-full absolute z-50 xl:relative ${menu ? 'left-[0px]' : 'xl:left-[0px] left-[-200px]'} ease-in-out duration-300`}>
      <div className=" border-0 border-red-500">
        <ul>
          <li className='text-xl border-0 pl-5 py-3 border-red-500 font-semibold bg-slate-200'>
            <div className='flex  items-center justify-between'>
              <div className='flex items-center'>
                <span className='text-3xl col text-white bg-black p-1 rounded-full mr-3'><MdHomeFilled /></span>
                DashBoard
              </div>
              <div className='p-2 text-[2rem] xl:hidden' onClick={handlemenu}>{!menu?<HiMenuAlt2 />:<HiMenuAlt3/>}</div>
            </div>
            <div>
              <ul className='text-base font-semibold ml-14 '>
                <li className='my-2 font-bold text-blue-600'>Live </li>
                <li className='my-2'>Analytics</li>
              </ul>
            </div>
          </li>
          <li className='pl-5 my-5 border-0 font-semibold flex items-center'>
            <div>
              show Humans : &ensp;
            </div>
            <ToggleSwith />
          </li>
          <li className='pl-5 my-5 border-0 font-semibold flex items-center'>
            <div>
              Show Vehicals : &ensp;
            </div>
            <ToggleSwith />
          </li>
          <li className='pl-5 my-5 font-semibold'></li>
        </ul>
      </div>
      <div className="absolute w-full bottom-0">
        {menu?<NotifiDrawer />:<></>}
      </div>
    </div>
  )
}

export default LeftNav;
