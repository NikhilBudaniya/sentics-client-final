import React from 'react'
import { MdHomeFilled } from 'react-icons/md';

function LeftNav() {
  return (
    <div className="shadow-xl navHeight">
      <div className=" border-0 border-red-500 py-5">
        <ul>
          <li className='text-xl border-0 pl-5 py-3 border-red-500 font-semibold bg-slate-200'>
            <div className='flex items-center'>
              <span className='text-3xl col text-white bg-black p-1 rounded-full mr-3'><MdHomeFilled /></span>
              DashBoard
            </div>
            <div>
              <ul className='text-base font-semibold ml-14 '>
                <li className='my-2'>Live : </li>
                <li className='my-2'>Analytics</li>
              </ul>
            </div>
          </li>
          <li className='pl-5 my-5 border-2 font-semibold flex items-center'>
            <div>
              show Humans : &ensp;
            </div>
            <div className='w-10 h-6 bg-gray-200 rounded-full border border-gray-300 cursor-pointer click:border-2 click:border-black'>
                
            </div>

          </li>
          <li className='pl-5 my-5 font-semibold'>Show Vehicals :</li>
        </ul>
      </div>
    </div>
  )
}

export default LeftNav;
