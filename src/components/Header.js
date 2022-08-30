import React from 'react'
import { useSelector } from 'react-redux';
import logo from "../assets/logo.png";

function Header() {
  const systemStatus = useSelector((state) => state.systemStatus.active);

  return (
    <div className="flex w-full items-center h-[50px] justify-end sm:justify-between px-1 sm:px-4 md:px-6 shadow-md">
      <div className="sm:hidden">
        <div className="flex items-center p-2 bg-blue-50 rounded-full space-between mx-5 border border-blue-100">
          <p className='w-[12px] h-[12px] rounded-full' style={{ backgroundColor: systemStatus ? "#2CB816" : "#FF0000" }}></p>
        </div>
      </div>
      <div className='w-[120px]'>
        <img src={logo} alt="logo" />
      </div>
      <div className="hidden sm:flex">
        <div className="flex items-center px-[15px] bg-blue-50 rounded-full space-between mx-5 border border-blue-100">
          <p className='text-xs'>System status :</p>
          <p className='w-[10px] h-[10px] rounded-full ml-2' style={{ backgroundColor: systemStatus ? "#2CB816" : "#FF0000" }}></p>
        </div>
        <button className='border px-[20px] py-[3px] bg-blue-500 text-white font-semibold rounded hover:bg-blue-600'>Sign In</button>
      </div>
    </div>
  )
}

export default Header