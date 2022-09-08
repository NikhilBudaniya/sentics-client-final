import React, { useContext } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import { ParamsDispatch } from "./Analytics";

export function KdeParamsForm({ className }) {
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
    <Form className={className}>
      <Row>
        <Col xs={12} lg={4}>
          <Row>
            <Col xs={9}>
              <Form.Group className="mt-2">
                <Form.Label>Farbschema</Form.Label>
                <Form.Select
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
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={3}>
              <Form.Group className="mt-2">
                <Form.Label>umkehren</Form.Label>
                <Form.Check
                  type="checkbox"
                  checked={params.kde.colorSchemeReversed}
                  onChange={(e) =>
                    e.target.checkValidity() &&
                    dispatch({
                      type: "SET_KDE_COLORSCHEME_REVERSED",
                      payload: e.target.checked,
                    })
                  }
                  className="m-auto"
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={4}>
          <Form.Group className="mt-2">
            <Form.Label>Intensität</Form.Label>
            <Row className="align-items-center">
              <Col xs="8">
                <Form.Range
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
              </Col>
              <Col xs="4">
                <Form.Control
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
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={4}>
          <Form.Group className="mt-2">
            <Form.Label>Transparenz</Form.Label>
            <Row className="align-items-center">
              <Col xs="8">
                <Form.Range
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
              </Col>
              <Col xs="4">
                <Form.Control
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
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}
