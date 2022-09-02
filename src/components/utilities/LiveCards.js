import React, { useEffect, useRef } from 'react'
import "./LiveCards.css";

function LiveCards() {
  return (
    <div className="live-cards flex h-full justify-between p-3 w-full max-w-full overflow-x-scroll xl:overflow-hidden">
      <Card title="Safety Score" overall_score="90%" monthly_score="80%" weekly_score="70%" daily_score="99%" />
      <Card title="Productivity Score" overall_score="90%" monthly_score="80%" weekly_score="70%" daily_score="99%" />
      <Card title="Forklift Speed Violations" overall_score="90%" monthly_score="80%" weekly_score="70%" daily_score="99%" />
      <Card title="Walking Area Violations" overall_score="90%" monthly_score="80%" weekly_score="70%" daily_score="99%" />
    </div>
  )
}

function Card({ title, overall_score, monthly_score, weekly_score, daily_score }) {
  const mount = useRef(undefined);
  useEffect(() => {
    const length = mount.current.children.length;
    const timer = setInterval(() => {
      let j = 0;
      for (let i = 0; i < length; i++) {
        if (!mount.current.children[i].classList.contains("hidden")) j = i;
        mount.current.children[i].classList.add("hidden");
      }
      if (j + 1 >= length) j = -1;
      j += 1;
      mount.current.children[j].classList.remove("hidden");
    }, 5000);

    return function () {
      clearInterval(timer);
    }
  }, []);

  return (
    <div className="flex justify-between min-w-[270px] w-full px-5 py-3 shadow-lg bg-blue-100 rounded-xl mr-5">
      <div className='font-semibold text-lg mb-3 mr-5'>{title}</div>
      <div ref={mount}>
        <div className="scroll-up min-w-max">
          <h2>Overall</h2>
          <p className="font-bold mt-1.5">{overall_score}</p>
        </div>
        <div className="hidden scroll-up min-w-max">
          <h2>This month</h2>
          <p className="font-bold mt-1.5">{monthly_score}</p>
        </div>
        <div className="scroll-up hidden min-w-max">
          <h2>This week</h2>
          <p className="font-bold mt-1.5">{weekly_score}</p>
        </div>
        <div className="hidden scroll-up min-w-max">
          <h2>This day</h2>
          <p className="font-bold mt-1.5">{daily_score}</p>
        </div>
      </div>
    </div>
  )
}

export default LiveCards;

/*
<Card title="Safety Score" overall_score="90%" monthly_score="90%" daily_score="90%" />
<Card title="Productivity Score" overall_score="90%" monthly_score="90%" daily_score="90%" />
<Card title="Forklift Speed Violations" overall_score="90%" monthly_score="90%" daily_score="90%" />
<Card title="Walking Area Violations" overall_score="90%" monthly_score="90%" daily_score="90%" />*/

/*
function Card({ title, overall_score, monthly_score, daily_score }) {
  return (
    <div className="flex flex-col justify-evenly w-1/4 min-w-[270px] px-5 py-3 shadow-lg bg-blue-100 rounded-xl mr-5">
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
}*/