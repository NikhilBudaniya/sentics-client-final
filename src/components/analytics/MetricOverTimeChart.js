import React, { useContext, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { cloneDeep, debounce } from "lodash";
import Spinner from "react-bootstrap/Spinner";
import { RangeButtons } from "./RangeButtons";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ParamsDispatch } from "./Summary";
import { useQuery } from "@tanstack/react-query";

function getReducer(type) {
  switch (type) {
    case "sum":
      return (bucket) => bucket.reduce((a, b) => a + b, 0);
    case "avg":
      return (bucket) => bucket.reduce((a, b) => a + b, 0) / bucket.length;
    case "max":
      return (bucket) => bucket.reduce((a, b) => Math.max(a, b), 0);
    case "min":
      return (bucket) =>
        bucket.reduce(
          (a, b) => Math.min(a, b),
          bucket.length > 0 ? bucket[0] : 0
        );
    case "none":
      return (bucket) => bucket;
    default:
      throw new Error("Please define aggregation");
  }
}

function formatDuration(ms) {
  const time = {
    Dawn: Math.floor(ms / 86400000),
    Hours: Math.floor(ms / 3600000) % 24,
    Minutes: Math.floor(ms / 60000) % 60,
    Seconds: Math.floor(ms / 1000) % 60,
    Milliseconds: Math.floor(ms) % 1000,
  };
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map((val) => val[1] + " " + val[0])
    .join(", ");
}

export function MetricOverTimeChart() {
  const { params, dispatch } = useContext(ParamsDispatch);

  const layout = useMemo(() => {
    const today = new Date(new Date().toDateString());

    return {
      yaxis: {
        rangemode: "tozero",
      },
      xaxis: {
        range: [params.from, params.to],
        rangeslider: {
          range: [params.range.value, today],
        },
        type: "date",
      },
      shapes: [
        ...(params.replay.timestamp !== undefined
          ? [
              {
                type: "line",
                x0: params.replay.timestamp,
                x1: params.replay.timestamp,
                y0: 0,
                y1: 1,
                yref: "paper",
                line: {
                  width: 1,
                  color: "red",
                },
              },
            ]
          : []),
      ],
      autosize: true,
      margin: { t: 50, l: 50, b: 10, r: 50 },
    };
  }, [params.from, params.to, params.range.value, params.replay.timestamp]);

  const onUpdateTimespanDebounced = debounce(
    (v) => dispatch({ type: "SET_TIMESPAN", payload: v }),
    200
  );

  const handleRelayout = (event) => {
    if (
      "xaxis.range" in event ||
      "xaxis.range[0]" in event ||
      "xaxis.range[1]" in event ||
      "xaxis.autorange" in event
    ) {
      const from = new Date(layout.xaxis.range[0]);
      const to = new Date(layout.xaxis.range[1]);
      onUpdateTimespanDebounced({ from, to });
    }
  };

  const [revision, setRevision] = useState(0);

  const handleLegendClick = (event) => {
    setTimeout(() => {
      const excludeHumans =
        event.data.find((d) => d.name === "People")?.visible === "legendonly";
      const excludeVehicles =
        event.data.find((d) => d.name === "Vehicles")?.visible ===
        "legendonly";
      dispatch({
        type: "SET_EXCLUDES",
        payload: { excludeHumans, excludeVehicles },
      });
      setRevision((r) => r + 1); // trigger gauge recalculation - `useMemo` doesn't recognize plotly's changes
    }, 500); // wait for plot update
  };

  const { isLoading: loading, data } = useQuery(
    ["metrics", params.range.value, params.areas, params.metric.value],
    async () => {
      const urlParams = new URLSearchParams();
      urlParams.append("from", params.range.value.toISOString());
      urlParams.append("to", new Date().toISOString());
      urlParams.append(
        "areas",
        params.areas
          .map(
            (a) =>
              `${a.x / 100},${a.y / 100},${a.width / 100},${a.height / 100}`
          )
          .join(";")
      );
      const url = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/statistics/${
        params.metric.value
      }-over-time?${urlParams.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      return data;
    }
  );

  const visibleMilliSeconds = params.to.valueOf() - params.from.valueOf();
  // build approx. 200 buckets with values in multiples of 500ms
  const bucketSize = Math.max(
    100,
    Math.floor(visibleMilliSeconds / 200 / 500) * 500
  );
  const bucketName = formatDuration(bucketSize);

  const traces = useMemo(() => {
    if (data == null) {
      return null;
    }

    const traces = cloneDeep(data);

    const humanTrace = traces.find((d) => d.name === "People");
    if (humanTrace !== undefined) {
      humanTrace.visible = params.excludeHumans ? "legendonly" : true;
    }

    const vehicleTrace = traces.find((d) => d.name === "Vehicles");
    if (vehicleTrace !== undefined) {
      vehicleTrace.visible = params.excludeVehicles ? "legendonly" : true;
    }

    for (let trace of traces) {
      const buckets = new Set();
      const x = [];
      const y = [];

      for (let index = 0; index < trace.x.length; index++) {
        const bucket =
          Math.floor(Date.parse(trace.x[index]) / bucketSize) * bucketSize;
        if (!buckets.has(bucket)) {
          buckets.add(bucket);
          x.push(new Date(bucket));
          y.push([]);
        }
        y[y.length - 1].push(trace.y[index]);
      }

      if (params.aggregation.value !== "none") {
        const reducer = getReducer(params.aggregation.value);
        trace.x = x;
        trace.y = y.map(reducer).map((y) => (y >= params.threshold ? y : null));
      } else {
        trace.mode = "markers";
        trace.x = trace.x.filter(
          (x, index) => trace.y[index] >= params.threshold
        );
        trace.y = trace.y.filter((y) => y >= params.threshold);
      }
    }

    return traces;
  }, [
    data,
    params.excludeHumans,
    params.excludeVehicles,
    bucketSize,
    params.aggregation.value,
    params.threshold,
  ]);

  const gaugeTraces = useMemo(() => {
    if (traces == null) {
      return null;
    }
    const visibleTraces = traces.filter((t) => t.visible !== "legendonly");
    const allY = visibleTraces.flatMap((d) => d.y);
    const allX = visibleTraces
      .flatMap((d) => d.x)
      .map((x) => new Date(Date.parse(x)));
    const filteredY = allY.filter(
      (y, index) =>
        // filter zero-values to exclude events without data
        allX[index] >= params.from && allX[index] <= params.to && y > 0
    );

    const reducer = getReducer(
      "none" === params.aggregation.value ? "avg" : params.aggregation.value
    );
    const yMetric = reducer(filteredY);
    const yMax = Math.max(
      yMetric,
      filteredY.reduce((max, v) => (max >= v ? max : v), -Infinity)
    );

    return [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: yMetric,
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: {
            range: [null, yMax],
          },
        },
      },
    ];
  }, [params.from, params.to, params.aggregation.value, traces, revision]);

  return (
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Body>
            <Card.Title>{params.metric.label} after Time</Card.Title>
            {params.aggregation.value !== "none" && (
              <Card.Subtitle>
                Summarized {params.aggregation.label} after Intervals
                from {bucketName}
              </Card.Subtitle>
            )}
            <div className="mt-2 d-flex align-items-center">
              <RangeButtons />
              {loading && (
                <Spinner
                  animation="border"
                  size="sm"
                  className="ms-3"
                ></Spinner>
              )}
            </div>
            <Plot
              data={traces}
              layout={layout}
              config={{}}
              style={{
                width: "100%",
                height: "250px",
              }}
              useResizeHandler={true}
              onRelayout={handleRelayout}
              onLegendClick={handleLegendClick}
              className="mt-3"
            />
          </Card.Body>
        </Card>
      </Col>

      {gaugeTraces != null && (
        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>
                {params.metric.label}{" "}
                {params.aggregation.value === "none"
                  ? "Average"
                  : params.aggregation.label}
              </Card.Title>
              <Plot
                data={gaugeTraces}
                layout={{}}
                config={{}}
                style={{
                  width: "100%",
                  height: "295px",
                }}
                useResizeHandler={true}
                className="mt-3"
              />
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  );
}
