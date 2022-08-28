import React from 'react'
import "./DataCards.css";

function DataCards() {
  return (
    <div className="data-cards overflow-x-scroll">
      <Card title="Safety Score" overall_score="90%" monthly_score="90%" daily_score="90%" />
      <Card title="Productivity Score" overall_score="90%" monthly_score="90%" daily_score="90%" />
      <Card title="Forklift Speed Violations" overall_score="90%" monthly_score="90%" daily_score="90%" />
      <Card title="Walking Area Violations" overall_score="90%" monthly_score="90%" daily_score="90%" />
    </div>
  )
}

function Card({ title, overall_score, monthly_score, daily_score }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      <div>
        <div>
          <h2>Overall</h2>
          <p>{overall_score}</p> 
        </div>
        <div>
          <h2>Monthly</h2>
          <p>{monthly_score}</p>
        </div>
        <div>
          <h2>24h</h2>
          <p>{daily_score}</p>
        </div>
      </div>
    </div>
  )
}

export default DataCards;