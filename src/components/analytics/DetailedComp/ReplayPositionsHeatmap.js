import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import PositionsHeatmap from "../live/PositionsHeatmap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { isEqual } from "lodash";
import { PauseCircle, PlayCircle } from "react-bootstrap-icons";
import { ParamsDispatch } from "./Analytics";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import styled from "styled-components";

const REFRESH_MS = 1000 / 10;

const TimeContainer = styled.span`
  width: 6vw;
`;

export default function ReplayPositionsHeatmap() {
  const { params, dispatch } = useContext(ParamsDispatch);
  const [appliedConfig, setAppliedConfig] = useState();

  const { data, isLoading } = useQuery(["replay", appliedConfig], async () => {
    if (appliedConfig === undefined) {
      return {
        data: [],
        max: 0,
      };
    }

    const data = await fetch(
      `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/replay?from=${appliedConfig.from.toISOString()}&to=${appliedConfig.to.toISOString()}`
    ).then((r) => r.json());

    // create a map of render ticks to positions
    const parse = (d) =>
      new Map(
        Object.entries(d).map(([time, values]) => [
          Math.ceil(parseInt(time) / REFRESH_MS),
          values,
        ])
      );

    return {
      human: parse(data.human),
      vehicle: parse(data.vehicle),
    };
  });

  const [playerState, setPlayerState] = useState({
    timestamp: undefined,
    playing: false,
    speedFactor: 1.0,
    offsetMs: 0,
  });

  const config = { from: params.from, to: params.to };

  const start = () => {
    dispatch({
      type: "SET_REPLAY_TIMESTAMP",
      payload: config.from,
    });
    setAppliedConfig(config);
    setPlayerState({
      timestamp: config.from,
      playing: true,
      speedFactor: 1.0,
      offsetMs: 0,
    });
  };

  // limit state updates to once per second
  const roundedReplayTimestamp = useMemo(() => {
    if (playerState.timestamp === undefined) {
      return undefined;
    }
    const timestamp = new Date(playerState.timestamp);
    timestamp.setMilliseconds(0);
    return timestamp.valueOf(); // memoize primitive because equal Date objects are not Object.is()-equal
  }, [playerState.timestamp]);

  useEffect(() => {
    dispatch({
      type: "SET_REPLAY_TIMESTAMP",
      payload:
        roundedReplayTimestamp !== undefined
          ? new Date(roundedReplayTimestamp)
          : undefined,
    });
  }, [dispatch, roundedReplayTimestamp]);

  useEffect(
    () => () =>
      dispatch({
        type: "SET_REPLAY_TIMESTAMP",
        payload: undefined,
      }),
    [dispatch]
  );

  const intervalTooLong = (params.to - params.from) / 1000 > 30 * 60;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Replay</Card.Title>
        <Card.Subtitle>Wiederholung der Live-Ansicht</Card.Subtitle>
        <div className="mt-3 d-flex align-items-center gap-2">
          <Button
            variant="primary"
            onClick={start}
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
          {isLoading && <Spinner animation="border" size="sm"></Spinner>}
        </div>
        {appliedConfig !== undefined ? (
          <div className="mt-3 d-flex gap-3 align-items-center">
            <div className="flex-shrink-0">
              <InputGroup>
                <Form.Control
                  size="sm"
                  type="number"
                  min={0.25}
                  max={10.0}
                  step={0.25}
                  value={playerState.speedFactor}
                  onChange={(e) =>
                    e.target.checkValidity() &&
                    setPlayerState({
                      ...playerState,
                      speedFactor: e.target.value,
                    })
                  }
                  className="text-end"
                ></Form.Control>
                <InputGroup.Text>fach</InputGroup.Text>
              </InputGroup>
            </div>
            <Button
              variant="light"
              className="d-flex align-items-center px-2"
              onClick={() =>
                setPlayerState((playerState) => ({
                  ...playerState,
                  playing: !playerState.playing,
                }))
              }
            >
              {playerState.playing ? (
                <PauseCircle></PauseCircle>
              ) : (
                <PlayCircle></PlayCircle>
              )}
            </Button>
            <TimeContainer className="flex-shrink-0">
              {playerState.timestamp.toLocaleTimeString()}
            </TimeContainer>
            <Form.Control
              type="range"
              min={0}
              max={(params.to - params.from) / 1000}
              value={(playerState.timestamp - params.from) / 1000}
              onChange={(e) =>
                e.target.checkValidity() &&
                setPlayerState((playerState) => ({
                  ...playerState,
                  timestamp: new Date(
                    params.from.getTime() + e.target.value * 1000
                  ),
                }))
              }
              className="w-100"
            />
          </div>
        ) : (
          <div className="mt-3" style={{ height: "38px" }} />
        )}
        <div
          className="mt-3 border"
          style={{
            height: "400px",
            filter:
              isLoading || !isEqual(appliedConfig, config)
                ? "grayscale(60%)"
                : "",
            opacity:
              isLoading || !isEqual(appliedConfig, config) ? 0.6 : undefined,
          }}
        >
          <PositionsHeatmap
            from={params.from}
            interval={REFRESH_MS}
            getData={() => {
              if (isLoading || appliedConfig === undefined) {
                return {
                  data: {
                    positions: [],
                  },
                  now: new Date(),
                };
              }

              let timestamp = playerState.timestamp;

              if (playerState.playing) {
                timestamp = new Date(
                  playerState.timestamp.valueOf() +
                    REFRESH_MS * playerState.speedFactor
                );
                setPlayerState((playerState) => ({
                  ...playerState,
                  timestamp:
                    timestamp > appliedConfig.to
                      ? appliedConfig.from
                      : timestamp,
                }));
              }

              // find closest timestamp that is earlier than timestamp (up to 1s in the past)
              const getPositions = (data) => {
                for (let n = 0; n * REFRESH_MS < 1000; n++) {
                  const key =
                    Math.floor(timestamp.valueOf() / REFRESH_MS) - n;
                  if (data.has(key)) {
                    return data.get(key);
                  }
                }
                return [];
              };

              const positions = [
                ...getPositions(data.human),
                ...getPositions(data.vehicle),
              ];

              return {
                data: {
                  positions,
                },
                now: timestamp,
              };
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
}
