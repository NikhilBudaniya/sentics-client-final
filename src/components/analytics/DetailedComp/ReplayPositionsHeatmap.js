import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import PositionsHeatmap from "../../LiveData/PositionsHeatmap";
import { isEqual } from "lodash";
import { PauseCircle, PlayCircle } from "react-bootstrap-icons";
import { ParamsDispatch } from "../Detailed";
import styled from "styled-components";
import CustomSpinner from "../../utilities/utilComponents/spinner";

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
    <div>
      <p className="font-semibold text-xl">Replay</p>
      <p className="text-sm">View Repetition of the live view</p>
      <div className="mt-3 flex items-center">
        <button
          className='mr-1 border px-[20px] cursor-pointer py-[3px] bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600'
          onClick={start}
          active={!isEqual(appliedConfig, config)}
          disabled={isEqual(appliedConfig, config)}
        >
          Show
        </button>
        {intervalTooLong && (
          <span className="text-red-500">
            Time interval should be a maximum of 30 minutes
          </span>
        )}
        {isLoading && <CustomSpinner />}
      </div>
      {appliedConfig !== undefined ? (
        <div className="mt-3 flex items-center">
          <div className="mr-5">
            <from className="flex flex-col bg-gray-200">
              <input
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
                className=""
              />
              <label className="mx-1">compartment</label>
            </from>
          </div>
          <button
            className="px-2"
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
          </button>
          <TimeContainer className="">
            {playerState.timestamp.toLocaleTimeString()}
          </TimeContainer>
          <input
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
        <div className="" style={{ height: "38px" }} />
      )}
      <div
        className="border-2"
        style={{
          height: "500px",
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
    </div>
  );
}
