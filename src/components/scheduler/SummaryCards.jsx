import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import {
  Calendar,
  RotateCcw,
  CalendarDays,
  Clock
} from 'lucide-react';

const SummaryCards = ({ theme, dailyCount, weeklyCount, monthlyCount, todaysPickupsCount }) => {
  console.log("SummaryCards: Rendering");
  return (
    <Row className="mb-4">
      <Col md={3} className="mb-3">
        <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`} 
              style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
          <Card.Body className="d-flex align-items-center">
            <div className="bg-success bg-opacity-10 p-3 rounded me-3">
              <Calendar className="text-success" size={24} />
            </div>
            <div>
              <h3 className="mb-0 fw-bold">{dailyCount}</h3>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Daily Pickups</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} className="mb-3">
        <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
              style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
          <Card.Body className="d-flex align-items-center">
            <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
              <RotateCcw className="text-warning" size={24} />
            </div>
            <div>
              <h3 className="mb-0 fw-bold">{weeklyCount}</h3>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Weekly Pickups</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} className="mb-3">
        <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
              style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
          <Card.Body className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
              <CalendarDays className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="mb-0 fw-bold">{monthlyCount}</h3>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Monthly Pickups</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} className="mb-3">
        <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
              style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
          <Card.Body className="d-flex align-items-center">
            <div className="bg-info bg-opacity-10 p-3 rounded me-3">
              <Clock className="text-info" size={24} />
            </div>
            <div>
              <h3 className="mb-0 fw-bold">{todaysPickupsCount}</h3>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Today's Pickups</small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;


