import React, { useContext, useEffect, useState } from "react";
import { KdeParamsForm } from "./KdeParamsForm";
import styled from "styled-components";
import { isEqual } from "lodash";
import { ParamsDispatch } from "../Detailed";
import CustomSpinner from "../../utilities/utilComponents/spinner";
import Panzoom from "@panzoom/panzoom";

const MapWrapper = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export function MetricKdeMap() {
  const { params, dispatch } = useContext(ParamsDispatch);
  const [loading, setLoading] = useState(false);

  const config = {
    metric: params.metric.value,
    params: {
      from: params.from.toISOString(),
      to: params.to.toISOString(),
      bw: params.kde.bandwidth,
      transparency: params.kde.transparency,
      colorScheme:
        params.kde.colorScheme + (params.kde.colorSchemeReversed ? "_r" : ""),
      excludeHumans: params.excludeHumans,
      excludeVehicles: params.excludeVehicles,
      areas: params.areas
        .map(
          (a) => `${a.x / 100},${a.y / 100},${a.width / 100},${a.height / 100}`
        )
        .join(";"),
      threshold: params.threshold,
    },
  };

  const [appliedConfig, setAppliedConfig] = useState();

  useEffect(() => setAppliedConfig(), [params.metric.value]);

  const [mapUrl, setMapUrl] = useState();
  useEffect(() => {
    if (appliedConfig == null) {
      setMapUrl();
      return;
    }

    const urlParams = new URLSearchParams(appliedConfig.params);
    setLoading(true);
    const url = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/graphs/${appliedConfig.metric
      }-kde?${urlParams.toString()}`;
    dispatch({
      type: "SET_MAP_URL",
      payload: url,
    });
    setMapUrl(url);
  }, [dispatch, appliedConfig]);

  const intervalTooShort = (params.to - params.from) / 1000 < 30 * 60;

  return (
    <div className="border-0 border-red-500">
      <div>
        <div className="mt-3">
          <div><h1 className="font-semibold text-xl">{params.metric.label} Heatmap</h1></div>
          <div className="text-sm mb-5">
            Presentation of the {params.metric.label}-Distribution by means of Kernel
            Density Estimation
          </div>
          <KdeParamsForm className="mt-3" />
          <div className=" broder border-red-600 mt-3 d-flex align-items-center gap-2">
            <button
              className='border px-[20px] cursor-pointer py-[3px] bg-blue-500 text-white font-semibold rounded hover:bg-blue-600'
              onClick={() => setAppliedConfig(config)}
              active={!isEqual(appliedConfig, config)}
              disabled={
                isEqual(appliedConfig, config) ||
                params.aggregation.value !== "none"
              }
            >
              Show
            </button>
            {intervalTooShort && (
              <span className="text-red-600 font-medium text-sm ml-3">
                Time interval should be at least 30 minutes
              </span>
            )}
            {params.aggregation.value !== "none" && (
              <span className="text-red-600 font-medium text-sm ml-3">
                Only available for unaggregated data
              </span>
            )}
            {loading && <CustomSpinner />}
          </div>

          <div
            className="mt-3 rounded-md border border-gray-300"
            style={{
              height: "400px",
              filter:
                loading || !isEqual(appliedConfig, config)
                  ? "grayscale(60%)"
                  : "",
              opacity:
                loading || !isEqual(appliedConfig, config) ? 0.6 : undefined,
            }}
          >
            <Panzoom>
              <MapWrapper
                src={mapUrl ?? params.mapDefaultUrl}
                onLoad={() => setLoading(false)}
              />
            </Panzoom>
          </div>
        </div>
      </div>
    </div>
  );
}
