import React from 'react'
// import "./DataCards.css";

function DataCards() {
  return (
    <div className="flex justify-between p-5 w-full max-w-full overflow-x-scroll xl:overflow-hidden">
      <Card title="Safety Score" overall_score="90%" monthly_score="90%" daily_score="90%" />
      <Card title="Productivity Score" overall_score="90%" monthly_score="90%" daily_score="90%" />
      <Card title="Forklift Speed Violations" overall_score="90%" monthly_score="90%" daily_score="90%" />
      <Card title="Walking Area Violations" overall_score="90%" monthly_score="90%" daily_score="90%" />
    </div>
  )
}

function Card({ title, overall_score, monthly_score, daily_score }) {
  return (
    <div className="w-1/4 min-w-[270px] px-5 py-3 shadow-lg bg-blue-100 rounded-xl mr-5">
      <h1 className='font-semibold text-lg mb-3'>{title}</h1>
      <div className='flex justify-between'>
        <div className='min-w-[20%]'>
          <h2 className='font-medium'>Overall</h2>
          <p>{overall_score}</p>
        </div>
        <div className='min-w-[20%]'>
          <h2 className='font-medium'>Monthly</h2>
          <p>{monthly_score}</p>
        </div>
        <div className='min-w-[20%]'>
          <h2 className='font-medium'>24h</h2>
          <p>{daily_score}</p>
        </div>
      </div>
    </div>
  )
}

export default DataCards;