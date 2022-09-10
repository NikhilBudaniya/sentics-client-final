import React, { useContext, useEffect, useState } from "react";
import { ParamsDispatch } from "../Detailed";

export function RangeButtons() {
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
        label: "Week",
        value: oneWeekAgo,
      },
      {
        label: "Day",
        value: oneDayAgo,
      },
      {
        label: "Hour",
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
            label: "A long time ago",
            value: params.from,
          },
        });
      }
    }
  }, [dispatch, ranges, params.from, params.range.value]);

  return (


    <div class="inline-flex rounded-md shadow-sm" role="group">
      {ranges.map((r) => (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "SET_TIMESPAN_FROM", payload: r.value });
            dispatch({ type: "SET_RANGE", payload: r });
          }}
          key={r.value}
          class="py-2 px-4 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
          {r.label}
        </button>
      ))}
    </div>

    // <ButtonGroup className={className}>
    //   {ranges.map((r) => (
    //     <Button className="text-black"
    //       variant="secondary"
    //       active={Math.abs(params.range.value - r.value) < 1000}
    //       onClick={() => {
    //         dispatch({ type: "SET_TIMESPAN_FROM", payload: r.value });
    //         dispatch({ type: "SET_RANGE", payload: r });
    //       }}
    //       key={r.value}
    //     >
    //       {r.label}
    //     </Button>
    //   ))}
    // </ButtonGroup>
  );
}
