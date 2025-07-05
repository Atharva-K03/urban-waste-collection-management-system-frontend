import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge, Navbar } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { wasteLogsAPI, workerAssignmentAPI, pickupAPI } from '../../services/api';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Play,
  Square,
  Calendar,
  MapPin,
  Truck,
  Recycle
} from 'lucide-react';

const WorkerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [startFormData, setStartFormData] = useState({
    zoneId: '',
    vehicleId: '',
    workerId: ''
  });
  const [endFormData, setEndFormData] = useState({
    workerId: '',
    weightCollected: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse, pickupsResponse] = await Promise.all([
        workerAssignmentAPI.getByWorkerId(user.workerId),
        pickupAPI.getAll()
      ]);
      
      // Filter pickups assigned to this worker
      const workerPickups = pickupsResponse.filter(pickup => 
        pickup.worker1Id === user.workerId || pickup.worker2Id === user.workerId
      );
      
      setAssignments(assignmentsResponse ? [assignmentsResponse] : []);
      setPickups(workerPickups || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCollection = (assignment) => {
    setStartFormData({
      zoneId: assignment.zoneId || '',
      vehicleId: assignment.vehicleId || '',
      workerId: user.workerId
    });
    setShowStartModal(true);
  };

  const handleEndCollection = () => {
    setEndFormData({
      workerId: user.workerId,
      weightCollected: ''
    });
    setShowEndModal(true);
  };

  const handleStartSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await wasteLogsAPI.startCollection(startFormData);
      setActiveCollection(startFormData);
      setShowStartModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to start collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await wasteLogsAPI.endCollection(endFormData);
      setActiveCollection(null);
      setShowEndModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to end collection');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading worker dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <Navbar bg="white" className="border-bottom">
        <Container fluid>
          <Navbar.Brand>
            <Recycle size={24} className="text-success me-2" />
            WasteWise Worker
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted me-2">Welcome, {user?.workerId}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={logout}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container fluid className="p-4">
        <div className="mb-4">
          <h2 className="fw-bold">Worker Dashboard</h2>
          <p className="text-muted">Manage your waste collection activities</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <Play className="text-success mb-3" size={48} />
                <h5 className="fw-bold">Start Collection</h5>
                <p className="text-muted">Begin a new waste collection activity</p>
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={() => assignments.length > 0 && handleStartCollection(assignments[0])}
                  disabled={activeCollection || assignments.length === 0}
                >
                  {activeCollection ? 'Collection in Progress' : 'Start Collection'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <Square className="text-danger mb-3" size={48} />
                <h5 className="fw-bold">End Collection</h5>
                <p className="text-muted">Complete your current collection activity</p>
                <Button 
                  variant="danger" 
                  size="lg"
                  onClick={handleEndCollection}
                  disabled={!activeCollection}
                >
                  End Collection
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Current Status */}
        {activeCollection && (
          <Alert variant="info" className="mb-4">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              <strong>Collection in Progress</strong> - Zone: {activeCollection.zoneId}, Vehicle: {activeCollection.vehicleId}
            </div>
          </Alert>
        )}

        {/* Assignments */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <Calendar className="me-2" size={20} />
                  My Assignments
                </h5>
              </Card.Header>
              <Card.Body>
                {assignments.length > 0 ? (
                  assignments.map((assignment, index) => (
                    <div key={index} className="border rounded p-3 mb-3">
                      <Row>
                        <Col md={3}>
                          <div className="d-flex align-items-center mb-2">
                            <MapPin className="text-primary me-2" size={16} />
                            <strong>Zone: {assignment.zoneId}</strong>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="d-flex align-items-center mb-2">
                            <Truck className="text-info me-2" size={16} />
                            <span>Route: {assignment.routeId}</span>
                          </div>
                        </Col>
                        <Col md={3}>
                          <Badge bg="primary" className="fw-normal">
                            Shift: {assignment.shift}
                          </Badge>
                        </Col>
                        <Col md={3} className="text-end">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleStartCollection(assignment)}
                            disabled={activeCollection}
                          >
                            <Play size={14} className="me-1" />
                            Start
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    <Calendar size={48} className="mb-3 opacity-50" />
                    <p>No assignments found for today</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pickup Jobs */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0 d-flex align-items-center">
                  <Recycle className="me-2" size={20} />
                  My Pickup Jobs
                </h5>
              </Card.Header>
              <Card.Body>
                {pickups.length > 0 ? (
                  pickups.map((pickup) => (
                    <div key={pickup.id} className="border rounded p-3 mb-3">
                      <Row>
                        <Col md={4}>
                          <div className="mb-2">
                            <strong>{pickup.locationName}</strong>
                            <br />
                            <small className="text-muted">Zone: {pickup.zoneId}</small>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-2">
                            <small className="text-muted">Time Slot:</small>
                            <br />
                            <span>{new Date(pickup.timeSlotStart).toLocaleString()}</span>
                          </div>
                        </Col>
                        <Col md={2}>
                          <Badge bg="info" className="fw-normal">
                            {pickup.frequency}
                          </Badge>
                        </Col>
                        <Col md={2}>
                          <Badge 
                            bg={pickup.status === 'COMPLETED' ? 'success' : 
                                pickup.status === 'IN_PROGRESS' ? 'warning' : 'primary'} 
                            className="fw-normal"
                          >
                            {pickup.status}
                          </Badge>
                        </Col>
                      </Row>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    <Recycle size={48} className="mb-3 opacity-50" />
                    <p>No pickup jobs assigned</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Start Collection Modal */}
        <Modal show={showStartModal} onHide={() => setShowStartModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Start Collection</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleStartSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Zone ID</Form.Label>
                <Form.Control
                  type="text"
                  value={startFormData.zoneId}
                  onChange={(e) => setStartFormData({ ...startFormData, zoneId: e.target.value })}
                  placeholder="Enter Zone ID (e.g., Z001)"
                  pattern="^Z\d{3}$"
                  title="Zone ID must be in format Z001, Z002, etc."
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Vehicle ID</Form.Label>
                <Form.Control
                  type="text"
                  value={startFormData.vehicleId}
                  onChange={(e) => setStartFormData({ ...startFormData, vehicleId: e.target.value })}
                  placeholder="Enter Vehicle ID (e.g., RT001, PT001)"
                  pattern="^(RT|PT)\d{3}$"
                  title="Vehicle ID must be in format RT001, PT001, etc."
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Worker ID</Form.Label>
                <Form.Control
                  type="text"
                  value={startFormData.workerId}
                  readOnly
                  className="bg-light"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowStartModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Starting...
                  </>
                ) : (
                  'Start Collection'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* End Collection Modal */}
        <Modal show={showEndModal} onHide={() => setShowEndModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>End Collection</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEndSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Worker ID</Form.Label>
                <Form.Control
                  type="text"
                  value={endFormData.workerId}
                  readOnly
                  className="bg-light"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Weight Collected (kg)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0"
                  value={endFormData.weightCollected}
                  onChange={(e) => setEndFormData({ ...endFormData, weightCollected: e.target.value })}
                  placeholder="Enter weight collected in kg"
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEndModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Ending...
                  </>
                ) : (
                  'End Collection'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default WorkerDashboard;

