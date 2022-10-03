import React, { useContext, useEffect, useState } from "react";
import { Panzoom } from "../../common/Panzoom";
import styled from "styled-components";
import { isEqual } from "lodash";
import { ParamsDispatch } from "../Detailed";
import { SpaghettiParamsForm } from "./SpaghettiParamsForm";
import CustomSpinner from "../../utilities/utilComponents/spinner";

const MapWrapper = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export function SpaghettiMap() {
  const { params, dispatch } = useContext(ParamsDispatch);
  const [loading, setLoading] = useState(false);

  const config = {
    from: params.from,
    params: {
      from: params.from.toISOString(),
      to: params.to.toISOString(),
      excludeHumans: params.excludeHumans,
      excludeVehicles: params.excludeVehicles,
      linewidth: params.spaghetti.linewidth,
      areas: params.areas
        .map(
          (a) => `${a.x / 100},${a.y / 100},${a.width / 100},${a.height / 100}`
        )
        .join(";"),
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
    const url = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/spaghetti?${urlParams.toString()}`;
    dispatch({
      type: "SET_MAP_URL",
      payload: url,
    });
    setMapUrl(url);
  }, [dispatch, appliedConfig]);

  const intervalTooLong = (params.to - params.from) / 1000 > 30 * 60;

  return (
    <div className=" broder border-red-500">
      <div className="mt-3">
        <h1 className="font-semibold text-xl">Spaghetti-Diagramm</h1>
        <div className="text-sm mb-5">Visualization of the walkways</div>
        <SpaghettiParamsForm className="mt-3" />
        <div className="mt-3 d-flex align-items-center gap-2">
          <button
            className='border px-[20px] cursor-pointer py-[3px] bg-blue-500 text-white font-semibold rounded hover:bg-blue-600'
            variant="primary"
            onClick={() => setAppliedConfig(config)}
            active={!isEqual(appliedConfig, config)}
            disabled={isEqual(appliedConfig, config)}
          >
            Show
          </button>
          {intervalTooLong && (
            <span className="text-red-600 font-medium text-sm ml-3">
              Time interval should be a maximum of 30 minutes
            </span>
          )}
          {loading && <CustomSpinner/>}
        </div>

        <div
          className="mt-3 border"
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
  );
}
