import React, { useEffect, useState } from 'react';
import Detailed from './Detailed';
import Summary from './Summary';


function Analytics() {
  const [SumActive, setSumActive] = useState(true)
  const [DetailActive, setDetailActive] = useState(false)

  return (

    <div className='navHeight w-full pt-1 bg-[#d9dee9]'>
      <div className="px-5 h-[35px] flex ">
        <div onClick={() => { setSumActive(true); setDetailActive(false) }} className={`flex items-center justify-center h-full w-[150px] rounded-t-[15px] cursor-pointer  ${SumActive ? "bg-white " : "hover:bg-[#00000023]"}`}>
          <p className='font-semibold'>Summary</p>
        </div>
        <div onClick={() => { setSumActive(false); setDetailActive(true) }} className={`flex items-center justify-center h-full w-[150px] rounded-t-[15px] cursor-pointer  ${DetailActive ? "bg-white" : "hover:bg-[#00000023]"}`}>
          <p className='font-semibold'>Detailed</p>
        </div>
      </div>
      <div className="h-full pb-[30px] z-50">
        <div className="border-0 h-full border-red-500 shadow-md p-1 bg-white">
          {SumActive ?
            <div id='summary' className="border p-3 h-full">
              <Summary />
            </div>
            :
            <div id='detailed' className="border p-3 h-full">
              <Detailed />
            </div>}
        </div>
      </div>
    </div>

  )
}

export default Analytics
