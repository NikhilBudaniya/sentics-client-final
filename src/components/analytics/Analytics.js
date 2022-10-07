import React, {useState} from 'react';
import AreaSelection from './AreaSelection';
import Detailed from './Detailed';


function Analytics() {
    const [Active, setActive] = useState('detailed')

    return (

        <div className='navHeight w-full pt-1 bg-[#d9dee9]'>
            <div className="px-5 h-[35px] flex ">
                <div onClick={() => {
                    setActive('detailed')
                }}
                     className={`flex items-center justify-center h-full w-[150px] rounded-t-[15px] cursor-pointer  ${Active === 'detailed' ? "bg-white" : "hover:bg-[#00000023]"}`}>
                    <p className='font-semibold'>Detailed</p>
                </div>
                <div onClick={() => {
                    setActive('area')
                }}
                     className={`flex items-center justify-center h-full w-[150px] rounded-t-[15px] cursor-pointer  ${Active === 'area' ? "bg-white" : "hover:bg-[#00000023]"}`}>
                    <p className='font-semibold'>Area</p>
                </div>
            </div>
            <div className="h-full pb-[30px] z-50">
                <div className="border-0 h-full border-red-500 shadow-md p-1 bg-white">
                    {Active === 'detailed' ?
                        (<div id='detailed' className="border p-3 h-full overflow-auto scrollbar-hide">
                            <Detailed/>
                        </div>)
                        : (<div id='area' className="border h-full overflow-auto scrollbar-hide">
                            <AreaSelection/>
                        </div>)}
                </div>
            </div>
        </div>

    )
}

export default Analytics
