import React from 'react'


function Summary() {

  return (
    <ParamsDispatch.Provider value={{ params, dispatch }}>
      <div className="w-full h-100">

        <div className="my-1">
          <MetricSelector />
        </div>

        <div className="my-1">
          <MetricOverTimeChart />
        </div>

        <div className="border-l-2 border-t-2 border-r-2 mt-1 w-full">
          <nav className="flex justify-start items-center px-2">
            <NavLink style={({ isActive }) => {
              return {
                color: isActive ? "red" : "black",
                fontWeight: isActive ? 'bold' : '',
              };
            }} to="/analytics" className="block mt-3 lg:mt-0 mr-10 hover:text-indigo-600">
              Home
            </NavLink>
            <NavLink style={({ isActive }) => {
              return {
                color: isActive ? "blue" : "black",
                fontWeight: isActive ? 'bold' : '',
              };
            }} to="/analytics/replay" className="block mt-3 lg:mt-0 mr-10 hover:text-indigo-600">
              Team
            </NavLink>
            <NavLink style={({ isActive }) => {
              return {
                color: isActive ? "blue" : "black",
                fontWeight: isActive ? 'bold' : '',
              };
            }} to="/analytics/spaghetti" className="block mt-3 lg:mt-0 hover:text-indigo-600">
              Gallery
            </NavLink>
          </nav>
        </div>

        <div>
          <Routes>
            <Route path="/" element={<MetricKdeMap />}></Route>
            <Route path="/spaghetti" element={<SpaghettiMap />}></Route>
          </Routes>
        </div>

      </div>
    </ParamsDispatch.Provider>
  )
}

export default Summary
