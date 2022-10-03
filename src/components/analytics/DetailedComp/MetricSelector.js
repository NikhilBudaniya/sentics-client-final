import React, { useContext, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react'
import { AreaSelector } from "@bmunozg/react-image-area";
import styled from "styled-components";
import { BoxArrowUpRight, Trash } from "react-bootstrap-icons";
import { ParamsDispatch } from "../Detailed";

const Wrapper = styled.div`
  pointer-events: none;

  [data-dir] {
    display: none;
  }
`;

const MapWrapper = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export default function MetricSelector() {
  const { params, dispatch } = useContext(ParamsDispatch);

  const metrics = [
    {
      value: "safety-score",
      label: "Safety Score",
      aggregations: ["none", "avg", "max"],
    },
    {
      value: "activity",
      label: "Activity in km/h",
      supportsSum: false,
      aggregations: ["avg", "max", "none"],
    },
    {
      value: "distance",
      label: "Distance in m",
      aggregations: ["sum", "none"],
    },
    {
      value: "count",
      label: "Number of objects",
      aggregations: ["min", "max"],
    },
  ];

  const aggregations = [
    {
      value: "none",
      label: "None",
    },
    {
      value: "avg",
      label: "Average",
    },
    {
      value: "sum",
      label: "Sum",
    },
    {
      value: "min",
      label: "Minimum",
    },
    {
      value: "max",
      label: "Maximum",
    },
  ];

  const setMetric = (metricValue) => {
    const metric = metrics.find((m) => m.value === metricValue);
    dispatch({
      type: "SET_METRIC",
      payload: metric,
    });
    const aggregation = aggregations.find(
      (a) => a.value === metric.aggregations[0]
    );
    dispatch({
      type: "SET_AGGREGATION",
      payload: aggregation,
    });
  };

  const setAggregation = (aggregationValue) =>
    dispatch({
      type: "SET_AGGREGATION",
      payload: aggregations.find((a) => a.value === aggregationValue),
    });

  const from = new Date(params.from);
  from.setMinutes(from.getMinutes() - from.getTimezoneOffset());
  const fromFormatted = from.toISOString().slice(0, 16);

  const to = new Date(params.to);
  to.setMinutes(to.getMinutes() - to.getTimezoneOffset());
  const toFormatted = to.toISOString().slice(0, 16);

  const [showRoiModal, setShowRoiModal] = useState(false);
  const [areas, setAreas] = useState([]);

  const handleOpenRoiModal = () => {
    setAreas(params.areas);
    setShowRoiModal(true);
  };

  const handleCloseRoiModal = () => {
    dispatch({ type: "SET_AREAS", payload: areas });
    setShowRoiModal(false);
  };

  const supportsCategoryFilters = params.metric.value !== "safety-score";

  return (
      <div>
        <p className="text-xl font-semibold">Parameter</p>
        <form className="mt-3">
          <div className="mt-3 flex justify-start flex-wrap">
            <div className="flex flex-col mx-1">
              <label className="mb-2">Metric</label>
              <select type="text"
                value={params.metric.value}
                onChange={(e) =>
                  e.target.checkValidity() && setMetric(e.target.value)
                }
                className="form-select">
                {metrics.map((m) => (
                  <option value={m.value} key={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col mx-1">
              <label className="mb-2">Aggregation</label>
              <select type="text"
                value={params.aggregation.value}
                onChange={(e) =>
                  e.target.checkValidity() && setAggregation(e.target.value)
                }
                className="form-select">
                {aggregations
                  .filter((a) => params.metric.aggregations.includes(a.value))
                  .map((a) => (
                    <option value={a.value} key={a.value}>
                      {a.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col mx-1">
              <label className="mb-2">Beginning</label>
              <input
                type="datetime-local"
                value={fromFormatted}
                max={toFormatted}
                onChange={(e) =>
                  e.target.checkValidity() &&
                  dispatch({
                    type: "SET_TIMESPAN_FROM",
                    payload: new Date(Date.parse(e.target.value)),
                  })
                }
                className="form-input"
              />
            </div>

            <div className="flex flex-col mx-1">
              <label className="mb-2">End</label>
              <input
                type="datetime-local"
                value={toFormatted}
                min={fromFormatted}
                onChange={(e) =>
                  e.target.checkValidity() &&
                  dispatch({
                    type: "SET_TIMESPAN_TO",
                    payload: new Date(Date.parse(e.target.value)),
                  })
                }
                className="form-input"
              />
            </div>


            <div className="flex flex-col mx-1">
              <label className="mb-2">Class</label>
              <div className={`${!supportsCategoryFilters ? "opacity-50" : ""}`}>
                <input
                  type="checkbox"
                  checked={!params.excludeHumans || !supportsCategoryFilters}
                  disabled={!supportsCategoryFilters}
                  label="People"
                  onChange={(e) =>
                    e.target.checkValidity() &&
                    dispatch({
                      type: "SET_EXCLUDE_HUMANS",
                      payload: !e.target.checked,
                    })
                  }
                  className="form-checkbox"
                />
                <label className="ml-2">People</label>
              </div>
              <div className={`${!supportsCategoryFilters ? "opacity-50" : ""}`}>
                <input
                  type="checkbox"
                  checked={!params.excludeVehicles || !supportsCategoryFilters}
                  disabled={!supportsCategoryFilters}
                  label="Vehicles"
                  onChange={(e) =>
                    e.target.checkValidity() &&
                    dispatch({
                      type: "SET_EXCLUDE_VEHICLES",
                      payload: !e.target.checked,
                    })
                  }
                />
                <label className="ml-2">Vehicles</label>
              </div>
            </div>

            <div className="flex flex-col mx-1">
              <label>Region of Interest</label>

              <div>

                <button
                  onClick={handleOpenRoiModal} type="button" className="flex w-full justify-center items-center text-white  transition ease-in duration-200 text-center text-base font-semibold  h-12 rounded-lg ">
                  <BoxArrowUpRight color="black" />
                  <Wrapper>
                    <img
                      src={params.mapUrl}
                      style={{ height: "24px" }}
                      alt="OHLF preview"
                    />
                  </Wrapper>
                </button>
              </div>

              <Transition appear show={showRoiModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={handleCloseRoiModal}>
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                  </Transition.Child>

                  <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                          >
                            Choose Region of Interest
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Mark ROI by clicking and dragging
                            </p>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              className="mb-2 inline-flex justify-center items-center rounded-md border border-transparent bg-red-400 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                              onClick={() => setAreas((a) => a.slice(0, -1))}
                            >
                              <Trash className="mr-2"/> Delete last mark
                            </button>
                            <div className="mt-4">
                              <AreaSelector
                                areas={areas}
                                onChange={setAreas}
                                unit="percentage"
                              >
                                <MapWrapper src={params.mapUrl} />
                              </AreaSelector>
                            </div>
                            <div className="mt-2 justify-evenly flex">
                              <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                onClick={handleCloseRoiModal}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-red-400 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                onClick={() => setShowRoiModal(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
            </div>

            <div className="flex flex-col mx-1">
              <label>Threshold</label>
              <div className="flex items-center bg-gray-200">
                <p className="p-2">&ge;</p>
                <input
                  type="number"
                  value={params.threshold}
                  step={0.1}
                  onChange={(e) =>
                    e.target.checkValidity() &&
                    dispatch({
                      type: "SET_THRESHOLD",
                      payload: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </form>
        <hr className="my-3"/>
      </div>
  );
}
