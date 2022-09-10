import React, { useContext } from "react";
import { ParamsDispatch } from "../Detailed";

export function SpaghettiParamsForm({ className }) {
  const { params, dispatch } = useContext(ParamsDispatch);

  return (
    <form className="border-y py-2">
      <div className="flex flex-wrap items-center justify-start">

        <div className="mx-2">
          <label className="">
            <span className="mr-2 block">Line width</span>
            <input
              className="mt-1"
              type="range"
              min={1}
              max={20}
              step={1}
              value={params.spaghetti.linewidth}
              onChange={(e) =>
                e.target.checkValidity() &&
                dispatch({
                  type: "SET_SPAGHETTI_LINEWIDTH",
                  payload: e.target.value,
                })
              }
            />
          </label>
          <input
            type="number"
            min={1}
            max={20}
            step={1}
            value={params.spaghetti.linewidth}
            onChange={(e) =>
              e.target.checkValidity() &&
              dispatch({
                type: "SET_SPAGHETTI_LINEWIDTH",
                payload: e.target.value,
              })
            }
            className="mx-1"
          />
        </div>
      </div>
    </form>
  );
}
