// NOTE: This is and old heatmap component
import React, { useCallback, useEffect, useRef, useState } from "react";
import heatmap from "heatmap.js";
import styled from "styled-components";
import useResizeObserver from "@react-hook/resize-observer";

const Wrapper = styled.div`
  height: 100%;

  canvas {
    background-image: url(${(props) => props.backgroundImageUrl});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: auto;
    max-width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// zoom to improve resolution
export default function Heatmap({
  min,
  max,
  data,
  onAfterRender,
  backgroundImageUrl,
  width,
  height,
  zoom = 20,
}) {
  const [heatmapInstance, setHeatmapInstance] = useState();
  const heatmapContainerRef = useRef();

  const heatmapContainer = useCallback(
    (node) => {
      if (node == null) {
        // destroy canvas
        heatmapContainerRef.current?.replaceChildren();
      }

      heatmapContainerRef.current = node;

      if (node == null) {
        return;
      }

      const heatmapInstance = heatmap.create({
        width: width * zoom,
        height: height * zoom,
        container: node,
        blur: 0.95,
        minOpacity: 0.0,
        maxOpacity: 0.8,
      });
      node.querySelector("canvas").style.position = "static";
      setHeatmapInstance(heatmapInstance);
    },
    [width, height, zoom]
  );

  useResizeObserver(heatmapContainerRef, (entry) => {
    // force rerender
    heatmapContainer(null);
    heatmapContainer(entry.target);
  });

  useEffect(() => {
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const mappedData = data.map((point) => {
      const radius = Math.floor(point.radius * zoom);
      return {
        // heatmap does not render when radius overlaps with top edge, so clamp it
        x: clamp(Math.floor(point.x * zoom), radius + 1, width * zoom - radius),
        y: clamp(
          Math.floor(point.y * zoom),
          radius + 1,
          height * zoom - radius
        ),
        radius,
        value: clamp(Math.floor(point.value), min, max),
      };
    });
    heatmapInstance?.setData({
      min,
      max,
      data: mappedData,
    });

    if (onAfterRender != null) {
      const canvas = heatmapContainerRef.current?.querySelector("canvas");
      if (canvas != null) {
        onAfterRender(canvas, zoom);
      }
    }
  }, [heatmapInstance, min, max, data, onAfterRender, zoom, width, height]);

  return (
    <Wrapper ref={heatmapContainer} backgroundImageUrl={backgroundImageUrl} />
  );
}
