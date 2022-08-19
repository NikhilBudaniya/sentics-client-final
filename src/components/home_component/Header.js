import React from 'react'

function Header() {
  return (
    <div className="flex justify-between p-2 bg-green-200">
        <img src="#" alt="logo" />
        <div className="flex">
            <p className="mr-2">System Status</p>
            <img src="#" alt="pp" />
        </div>
    </div>
  )
}

export default Header