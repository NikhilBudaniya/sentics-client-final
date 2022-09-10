import React, { useContext } from "react";
import { ParamsDispatch } from "../Detailed";

export function KdeParamsForm() {
  const { params, dispatch } = useContext(ParamsDispatch);

  const colorSchemes = [
    "rocket",
    "mako",
    "flare",
    "crest",
    "magma",
    "viridis",
    "vlag",
    "icefire",
    "Spectral",
    "coolwarm",
  ];
  // reversed: + '_r'

  return (
    <form className="border-y py-2">
      <div className="flex flex-wrap justify-start flex-col">
        <div className="mx-2">
          <label>
            <span className="mr-2">Colour scheme</span>
            <select className="form-select"
              value={params.kde.colorScheme}
              onChange={(e) =>
                e.target.checkValidity() &&
                dispatch({
                  type: "SET_KDE_COLORSCHEME",
                  payload: e.target.value,
                })
              }
            >
              {colorSchemes.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}
                </option>
              ))}
            </select>
          </label>

          <span className="mx-2">
            <label className="inline-flex items-center">
              <input
                className="form-checkbox"
                type="checkbox"
                checked={params.kde.colorSchemeReversed}
                onChange={(e) =>
                  e.target.checkValidity() &&
                  dispatch({
                    type: "SET_KDE_COLORSCHEME_REVERSED",
                    payload: e.target.checked,
                  })
                }
              />
              <span className="ml-2">Reverse</span>
            </label>
          </span>

        </div>


        <div className="mx-2">
          <label className="">
            <span className="mr-2 block">Intensity</span>
            <input
              className="mt-1"
              type="range"
              min={0}
              max={1.0}
              step={0.01}
              value={params.kde.bandwidth}
              onChange={(e) =>
                e.target.checkValidity() &&
                dispatch({
                  type: "SET_KDE_BANDWIDTH",
                  payload: e.target.value,
                })
              }
            />
          </label>
          <input
            type="number"
            min={0}
            max={1.0}
            step={0.01}
            value={params.kde.bandwidth}
            onChange={(e) =>
              e.target.checkValidity() &&
              dispatch({
                type: "SET_KDE_BANDWIDTH",
                payload: e.target.value,
              })
            }
            className="mx-1"
          />
        </div>

        <div className="mx-2">
          <label className="">
            <span className="mr-2 block">Transparency</span>
            <input
              className="mt-1"
              type="range"
              min={0}
              max={1.0}
              step={0.01}
              value={params.kde.transparency}
              onChange={(e) =>
                e.target.checkValidity() &&
                dispatch({
                  type: "SET_KDE_TRANSPARENCY",
                  payload: e.target.value,
                })
              }
            />
          </label>
          <input
            type="number"
            min={0}
            max={1.0}
            step={0.01}
            value={params.kde.transparency}
            onChange={(e) =>
              e.target.checkValidity() &&
              dispatch({
                type: "SET_KDE_TRANSPARENCY",
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
