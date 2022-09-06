import React, { useState } from 'react'

function ToggleSwith(props) {
  let {id} = props;
  const [state, setstate] = useState(true);

  const handleToggleSwitch = () => {
    setstate(!state);
  }
  return (
    <div>
      <div className={`border-2 ${state ? 'bg-blue-600 border-blue-800' : 'bg-gray-200 border-gray-300'} rounded-full w-9 h-[23px] flex items-center border border-gray-300 px-[2px] ease-in-out duration-300`}>
        <div onClick={handleToggleSwitch} className={`cursor-pointer bg-white w-4 h-4 rounded-full border ${state ? 'border-blue-800 translate-x-[14px]' : 'border-gray-300'} ease-in-out duration-300`}></div>
      </div>
    </div>
  )
}

export default ToggleSwith
