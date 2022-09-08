import React, { useContext } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import { ParamsDispatch } from "./Summary";

export function SpaghettiParamsForm({ className }) {
  const { params, dispatch } = useContext(ParamsDispatch);

  return (
    <Form className={className}>
      <Row>
        <Col xs={12} lg={4}>
          <Form.Group>
            <Form.Label>Line width</Form.Label>
            <Row className="align-items-center">
              <Col xs="8">
                <Form.Range
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
              </Col>
              <Col xs="4">
                <Form.Control
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
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}
