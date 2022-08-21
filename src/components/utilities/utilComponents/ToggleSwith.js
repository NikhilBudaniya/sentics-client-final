import React, { useState } from 'react'

function ToggleSwith() {
    const [state, setstate] = useState(true);

    const handleToggleSwitch = () => {
        setstate(!state);
    }
  return (
    <div>
      <div className={`border-2 ${state?'bg-blue-600 border-blue-800':'bg-gray-200 border-gray-300'} rounded-full w-11 h-[28px] flex items-center border border-gray-300 px-[3px] ease-in-out duration-300`}>
        <div onClick={handleToggleSwitch} className={`cursor-pointer bg-white w-5 h-5 rounded-full border ${state?'border-blue-800 translate-x-[16px]':'border-gray-300'} ease-in-out duration-300`}></div>
      </div>
    </div>
  )
}

export default ToggleSwith
