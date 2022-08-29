import React, { useState } from 'react'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';

function NotifiDrawer() {
    const [Drawer, setDrawer] = useState(false);

    const handleNotifiToggle = () => {
        console.log('clicked on button');
        setDrawer(!Drawer);
    }
    return (
        <div className="w-full h-full">
            <div className={`bg-white border-0  border-red-400 rounded-t-2xl shadow-[0_0_10px_rgba(0,0,0,0.15)] ${Drawer ? `h-[300px]` : `h-[45px]`} overflow-hidden ease-in-out duration-300`}>
                <div className="font-semibold flex items-center py-2 content-between px-5 h-[45px] border-b-2 border-gray-300">
                    <h6 className="flex items-center w-full">Notifications <span className="ml-1 rounded-full px-1 py-[2px] text-white bg-blue-700 text-xs">12</span></h6>
                    <button onClick={handleNotifiToggle} className="toggle text-2xl cursor-pointer">{!Drawer ? <BiChevronUp /> : <BiChevronDown />}</button>
                </div>
                <div className='overflow-y-scroll scrollbar border-0 height-full border-red-500 h-[255px]'>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                    <div className="px-5 flex items-end justify-between py-3 border-b-2">
                        <h4 className='font-medium text-sm'>Collision found at...</h4>
                        <p className='font-normal text-xs'>7.00 pm</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotifiDrawer