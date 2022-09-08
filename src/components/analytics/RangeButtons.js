import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { ParamsDispatch } from ".";

export function RangeButtons({ className }) {
  const { params, dispatch } = useContext(ParamsDispatch);

  const [ranges] = useState(() => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const oneDayAgo = new Date(new Date().toDateString());
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneWeekAgo = new Date(new Date().toDateString());
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);

    return [
      {
        label: "Woche",
        value: oneWeekAgo,
      },
      {
        label: "Tag",
        value: oneDayAgo,
      },
      {
        label: "Stunde",
        value: oneHourAgo,
      },
    ];
  });

  useEffect(() => {
    if (params.from < params.range.value) {
      const range = ranges
        .slice()
        .reverse()
        .find((r) => params.from >= r.value);
      if (range !== undefined) {
        dispatch({ type: "SET_RANGE", payload: range });
      } else {
        dispatch({
          type: "SET_RANGE",
          payload: {
            label: "Vor langer Zeit",
            value: params.from,
          },
        });
      }
    }
  }, [dispatch, ranges, params.from, params.range.value]);

  return (
    <ButtonGroup className={className}>
      {ranges.map((r) => (
        <Button
          variant="secondary"
          active={Math.abs(params.range.value - r.value) < 1000}
          onClick={() => {
            dispatch({ type: "SET_TIMESPAN_FROM", payload: r.value });
            dispatch({ type: "SET_RANGE", payload: r });
          }}
          key={r.value}
        >
          {r.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
