import React, { useContext, useState } from "react";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import { AreaSelector } from "@bmunozg/react-image-area";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { BoxArrowUpRight, Trash } from "react-bootstrap-icons";
import { ParamsDispatch } from "./Analytics";
import InputGroup from "react-bootstrap/InputGroup";

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
      label: "Aktivität in km/h",
      supportsSum: false,
      aggregations: ["avg", "max", "none"],
    },
    {
      value: "distance",
      label: "Distanz in m",
      aggregations: ["sum", "none"],
    },
    {
      value: "count",
      label: "Objektanzahl",
      aggregations: ["min", "max"],
    },
  ];

  const aggregations = [
    {
      value: "none",
      label: "Keine",
    },
    {
      value: "avg",
      label: "Durchschnitt",
    },
    {
      value: "sum",
      label: "Summe",
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
    <Card>
      <Card.Body>
        <Card.Title>Parameter</Card.Title>
        <Form className="mt-3">
          <div className="mt-3 d-flex flex-wrap gap-4">
            <Form.Group>
              <Form.Label>Metrik</Form.Label>
              <Form.Select
                value={params.metric.value}
                onChange={(e) =>
                  e.target.checkValidity() && setMetric(e.target.value)
                }
              >
                {metrics.map((m) => (
                  <option value={m.value} key={m.value}>
                    {m.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Aggregation</Form.Label>
              <Form.Select
                value={params.aggregation.value}
                onChange={(e) =>
                  e.target.checkValidity() && setAggregation(e.target.value)
                }
              >
                {aggregations
                  .filter((a) => params.metric.aggregations.includes(a.value))
                  .map((a) => (
                    <option value={a.value} key={a.value}>
                      {a.label}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Beginn</Form.Label>
              <Form.Control
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
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Ende</Form.Label>
              <Form.Control
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
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Klasse</Form.Label>
              <Form.Check
                type="checkbox"
                checked={!params.excludeHumans || !supportsCategoryFilters}
                disabled={!supportsCategoryFilters}
                label="Menschen"
                onChange={(e) =>
                  e.target.checkValidity() &&
                  dispatch({
                    type: "SET_EXCLUDE_HUMANS",
                    payload: !e.target.checked,
                  })
                }
              />
              <Form.Check
                type="checkbox"
                checked={!params.excludeVehicles || !supportsCategoryFilters}
                disabled={!supportsCategoryFilters}
                label="Fahrzeuge"
                onChange={(e) =>
                  e.target.checkValidity() &&
                  dispatch({
                    type: "SET_EXCLUDE_VEHICLES",
                    payload: !e.target.checked,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Region of Interest</Form.Label>

              <div>
                <Button
                  variant="light"
                  onClick={handleOpenRoiModal}
                  className="d-flex align-items-center gap-2"
                >
                  <BoxArrowUpRight />
                  <Wrapper>
                    <img
                      src={params.mapUrl}
                      style={{ height: "24px" }}
                      alt="OHLF preview"
                    />
                  </Wrapper>
                </Button>
              </div>

              <Modal size="lg" show={showRoiModal} onHide={handleCloseRoiModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Region of Interest auswählen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>ROI durch Klicken und Ziehen markieren.</p>
                  <Button
                    variant="secondary"
                    onClick={() => setAreas((a) => a.slice(0, -1))}
                    className="d-flex align-items-center gap-2"
                  >
                    <Trash /> Letzte Markierung löschen
                  </Button>

                  <div className="mt-4">
                    <AreaSelector
                      areas={areas}
                      onChange={setAreas}
                      unit="percentage"
                    >
                      <MapWrapper src={params.mapUrl} />
                    </AreaSelector>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" onClick={handleCloseRoiModal}>
                    Übernehmen
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowRoiModal(false)}
                  >
                    Abbrechen
                  </Button>
                </Modal.Footer>
              </Modal>
            </Form.Group>

            <Form.Group>
              <Form.Label>Schwellwert</Form.Label>
              <InputGroup>
                <InputGroup.Text>&ge;</InputGroup.Text>
                <Form.Control
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
                />
              </InputGroup>
            </Form.Group>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
