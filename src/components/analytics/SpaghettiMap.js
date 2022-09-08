import React, { useContext, useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import { Panzoom } from "../common/Panzoom";
import styled from "styled-components";
import Card from "react-bootstrap/Card";
import { isEqual } from "lodash";
import { ParamsDispatch } from "./Analytics";
import { SpaghettiParamsForm } from "./SpaghettiParamsForm";

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
    <Card>
      <Card.Body>
        <Card.Title>Spaghetti-Diagramm</Card.Title>
        <Card.Subtitle>Visualisierung der Laufwege</Card.Subtitle>
        <SpaghettiParamsForm className="mt-3" />
        <div className="mt-3 d-flex align-items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setAppliedConfig(config)}
            active={!isEqual(appliedConfig, config)}
            disabled={isEqual(appliedConfig, config)}
          >
            Laden
          </Button>
          {intervalTooLong && (
            <span className="text-danger">
              Zeitintervall sollte maximal 30 Minuten sein
            </span>
          )}
          {loading && <Spinner animation="border" size="sm"></Spinner>}
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
      </Card.Body>
    </Card>
  );
}
