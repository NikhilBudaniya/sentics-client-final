import React, { useState } from "react";
import Heatmap from "./Heatmap";
import { useInterval } from "usehooks-ts";
import styled from "styled-components";
import { Panzoom } from "../common/Panzoom";
import { useQuery } from "@tanstack/react-query";

const HISTORY_SECONDS = 5; // show trail of positions during last few seconds

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

function loadImage(url) {
  const image = new Image();
  image.src = url;
  return new Promise((resolve) => {
    image.onload = () => resolve(image);
  });
}

function drawArrow(context, fromx, fromy, dx, dy, length = 10) {
  context.beginPath();
  const tox = fromx + dx;
  const toy = fromy + dy;
  const angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(
    tox - length * Math.cos(angle - Math.PI / 6),
    toy - length * Math.sin(angle - Math.PI / 6)
  );
  context.moveTo(tox, toy);
  context.lineTo(
    tox - length * Math.cos(angle + Math.PI / 6),
    toy - length * Math.sin(angle + Math.PI / 6)
  );
  context.stroke();
}

export default function PositionsHeatmap({ getData, interval = 100 }) {
  const { data: environment } = useQuery(["environment"], async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/environment`);
    return await response.json();
  });

  const { data: iconMap } = useQuery(["iconMap", environment], async () => {
    if (environment == null) {
      return;
    }

    const objectIconMapEntries = await Promise.all(
      environment.objects.map(async (object) => {
        const image = await loadImage(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}${object.icon}`);
        return [object.kind, image];
      })
    );

    return Object.fromEntries(objectIconMapEntries);
  });

  const [heatmapState, setHeatmapState] = useState({
    positionHistory: [],
    currentPositions: [],
    heatmapData: [],
  });
  async function updateHeatmap() {
    if (environment == null) {
      return;
    }

    const { data, now } = await getData();
    const newCurrentPositions = data.positions.map((position) => ({
      ...position,
      timestamp: new Date(Date.parse(position.timestamp)),
    }));

    const secondsToNow = (date1) => (now.getTime() - date1.getTime()) / 1000;
    const newPositionHistory = [
      ...heatmapState.positionHistory,
      ...newCurrentPositions,
    ].filter(
      (position) =>
        secondsToNow(position.timestamp) <= HISTORY_SECONDS &&
        secondsToNow(position.timestamp) >= 0
    );

    // map current positions DTO to heatmap.js objects
    const newHeatmapData = newPositionHistory.map((position) => ({
      x: position.x,
      y: position.y,
      radius: environment.objects.find((o) => o.kind === position.kind)
        .radiusMeters,
      value: HISTORY_SECONDS - secondsToNow(position.timestamp), // decrease value over time
    }));

    setHeatmapState({
      currentPositions: newCurrentPositions,
      positionHistory: newPositionHistory,
      heatmapData: newHeatmapData,
    });
  }
  useInterval(() => {
    updateHeatmap();
  }, interval);

  function drawCurrentPositions(canvas, zoom) {
    if (iconMap == null || environment == null) {
      return;
    }

    const ctx = canvas.getContext("2d");

    heatmapState.currentPositions.forEach((position) => {
      const icon = iconMap[position.kind];
      const radius = environment.objects.find(
        (o) => o.kind === position.kind
      ).radiusMeters;

      const sourceRatio = icon.width / icon.height;
      const w = sourceRatio * radius * zoom;
      const h = radius * zoom;
      const x = position.x * zoom - w / 2;
      const y = position.y * zoom - h / 2;

      ctx.drawImage(icon, x, y, w, h);
      drawArrow(
        ctx,
        position.x * zoom,
        position.y * zoom,
        position.dx * zoom,
        position.dy * zoom
      );
      ctx.fillText("id: " + position.id, position.x * zoom, position.y * zoom);
    });
  }

  return (
    <Container>
      {environment != null && (
        <Panzoom>
          <Heatmap
            min={0}
            max={HISTORY_SECONDS}
            data={heatmapState.heatmapData}
            onAfterRender={drawCurrentPositions}
            width={environment.map.widthMeters}
            height={environment.map.heightMeters}
            // only in this component the building image is provided from python backend, elsewhere image is defined on frontend
            backgroundImageUrl={`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}${environment.map.image}`}
          />
        </Panzoom>
      )}
    </Container>
  );
}
