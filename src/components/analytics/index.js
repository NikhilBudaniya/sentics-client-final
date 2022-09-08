import React, { useReducer } from "react";
import Container from "react-bootstrap/Container";
import MetricSelector from "./MetricSelector";
import { MetricOverTimeChart } from "./MetricOverTimeChart";
import { MetricKdeMap } from "./MetricKdeMap";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { API_URL } from "../../config";
import ReplayPositionsHeatmap from "./ReplayPositionsHeatmap";
import { SpaghettiMap } from "./SpaghettiMap";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Nav from "react-bootstrap/Nav";

export const ParamsDispatch = React.createContext(null);

const ohlfUrl = `${API_URL}/image/ohlf.png`;

export default function LiveView() {
  const init = () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return {
      metric: {
        value: "safety-score",
        label: "Safety Score",
        aggregations: ["none", "avg", "min", "max"],
      },
      aggregation: {
        value: "avg",
        label: "Durchschnitt",
      },
      range: { value: oneHourAgo, label: "1 Stunde" },
      from: oneHourAgo,
      to: new Date(),
      excludeHumans: false,
      excludeVehicles: false,
      threshold: 0,
      mapUrl: ohlfUrl,
      mapDefaultUrl: ohlfUrl,
      areas: [],
      kde: {
        bandwidth: 0.1,
        transparency: 0.3,
        colorScheme: "Spectral",
        colorSchemeReversed: true,
      },
      spaghetti: {
        linewidth: 5,
      },
      replay: {
        timestamp: undefined,
      },
    };
  };
  const [params, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "RESET":
        return init();
      case "SET_METRIC":
        return { ...state, metric: action.payload };
      case "SET_AGGREGATION":
        return { ...state, aggregation: action.payload };
      case "SET_RANGE":
        return { ...state, range: action.payload };
      case "SET_TIMESPAN":
        return { ...state, from: action.payload.from, to: action.payload.to };
      case "SET_TIMESPAN_FROM":
        const to = new Date(action.payload);
        to.setHours(to.getHours() + 1);
        return { ...state, from: action.payload, to };
      case "SET_TIMESPAN_TO":
        return { ...state, to: action.payload };
      case "SET_KDE_BANDWIDTH":
        return { ...state, kde: { ...state.kde, bandwidth: action.payload } };
      case "SET_KDE_TRANSPARENCY":
        return {
          ...state,
          kde: { ...state.kde, transparency: action.payload },
        };
      case "SET_KDE_COLORSCHEME":
        return {
          ...state,
          kde: { ...state.kde, colorScheme: action.payload },
        };
      case "SET_KDE_COLORSCHEME_REVERSED":
        return {
          ...state,
          kde: { ...state.kde, colorSchemeReversed: action.payload },
        };
      case "SET_EXCLUDES":
        return {
          ...state,
          excludeHumans: action.payload.excludeHumans,
          excludeVehicles: action.payload.excludeVehicles,
        };
      case "SET_EXCLUDE_HUMANS":
        return { ...state, excludeHumans: action.payload };
      case "SET_THRESHOLD":
        return { ...state, threshold: action.payload };
      case "SET_EXCLUDE_VEHICLES":
        return { ...state, excludeVehicles: action.payload };
      case "SET_AREAS":
        return { ...state, areas: action.payload };
      case "SET_MAP_URL":
        return { ...state, mapUrl: action.payload };
      case "SET_SPAGHETTI_LINEWIDTH":
        return {
          ...state,
          spaghetti: { ...state.spaghetti, linewidth: action.payload },
        };
      case "SET_REPLAY_TIMESTAMP":
        return {
          ...state,
          replay: { ...state.replay, timestamp: action.payload },
        };
      default:
        throw new Error("Invalid action type " + action.type);
    }
  }, init());

  const { pathname } = useLocation();

  return (
    <ParamsDispatch.Provider value={{ params, dispatch }}>
      <Container className="mb-4">
        <Row>
          <Col xs={12} className="mt-4">
            <MetricSelector />
          </Col>

          <Col xs={12} className="mt-4">
            <MetricOverTimeChart />
          </Col>

          <Col xs={12} className="mt-4">
            <Nav variant="tabs" defaultActiveKey={pathname}>
              <Nav.Item>
                <Nav.Link as={Link} eventKey="/analytics" to="/analytics">
                  Heatmap
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  eventKey="/analytics/replay"
                  to="/analytics/replay"
                >
                  Wiederholung
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  eventKey="/analytics/spaghetti"
                  to="/analytics/spaghetti"
                >
                  Laufwege
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col xs={12} className="mt-2">
            <Routes>
              <Route path="/" element={<MetricKdeMap />}></Route>
              <Route
                path="/replay"
                element={<ReplayPositionsHeatmap />}
              ></Route>
              <Route path="/spaghetti" element={<SpaghettiMap />}></Route>
            </Routes>
          </Col>
        </Row>
      </Container>
    </ParamsDispatch.Provider>
  );
}
