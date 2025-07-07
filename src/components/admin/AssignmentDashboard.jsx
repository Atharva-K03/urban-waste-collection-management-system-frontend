import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { assignmentAPI, vehicleAPI, routeAPI } from '../../services/api';
import { Plus, Edit, Trash2, Calendar, Search } from 'lucide-react';
 
const AssignmentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    routeId: '',
    dateAssigned: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
 
  useEffect(() => {
    loadData();
  }, []);
 
  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse, vehiclesResponse, routesResponse] = await Promise.all([
        assignmentAPI.getAll(),
        vehicleAPI.getAll(),
        routeAPI.getAll()
      ]);
      setAssignments(assignmentsResponse || []);
      setVehicles(vehiclesResponse || []);
      // COMMENT ORIGINAL--
      //
      setRoutes(routesResponse.data?.content || []);
       // CHANGE THIS LINE: Expect routesResponse to be the array directly
       //setRoutes(routesResponse || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleCreate = () => {
    setModalType('create');
    setFormData({
      vehicleId: '',
      routeId: '',
      dateAssigned: new Date().toISOString().split('T')[0]
    });
    setSelectedAssignment(null);
    setShowModal(true);
  };
 
  const handleEdit = (assignment) => {
    setModalType('edit');
    setFormData({
      vehicleId: assignment.vehicleId,
      routeId: assignment.routeId,
      dateAssigned: assignment.dateAssigned
    });
    setSelectedAssignment(assignment);
    setShowModal(true);
  };
 
  const handleDelete = (assignment) => {
    setModalType('delete');
    setSelectedAssignment(assignment);
    setShowModal(true);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
 
    try {
      if (modalType === 'create') {
        await assignmentAPI.create(formData);
      } else if (modalType === 'edit') {
        await assignmentAPI.update(selectedAssignment.assignmentId, formData);
      } else if (modalType === 'delete') {
        await assignmentAPI.delete(selectedAssignment.assignmentId);
      }
     
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };
 
 
 
  const filteredAssignments = assignments.filter(assignment =>
    assignment.assignmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.routeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    return vehicle ? `${vehicle.registrationNo} (${vehicle.type})` : vehicleId;
  };
 
  const getRouteInfo = (routeId) => {
    const route = routes.find(r => r.routeId === routeId);
    return route ? `${route.routeName}` : routeId;
  };
 
  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Create New Assignment';
      case 'edit': return 'Edit Assignment';
      case 'delete': return 'Delete Assignment';
      default: return '';
    }
  };
 
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading assignments...</p>
      </div>
    );
  }
 
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Assignment Management</h2>
        <Button variant="success" onClick={handleCreate}>
          <Plus size={18} className="me-2" />
          Create Assignment
        </Button>
      </div>
 
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
 
      {/* Summary Cards */}
      <Row className="mb-4 justify-content-around">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <Calendar className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{assignments.length}</h3>
                <small className="text-muted">Total Assignments</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <Calendar className="text-success" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {assignments.filter(a => a.dateAssigned === new Date().toISOString().split('T')[0]).length}
                </h3>
                <small className="text-muted">Today's Assignments</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
       
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                <Calendar className="text-warning" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{routes.length}</h3>
                <small className="text-muted">Available Routes</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
 
      {/* Search and Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">All Assignments</h5>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <Form.Control
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Assignment ID</th>
                <th>Vehicle</th>
                <th>Route</th>
                <th>Date Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.assignmentId}>
                    <td>
                      <Badge bg="primary" className="fw-normal">{assignment.assignmentId}</Badge>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{assignment.vehicleId}</div>
                        <small className="text-muted">{getVehicleInfo(assignment.vehicleId)}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{assignment.routeId}</div>
                        <small className="text-muted">{getRouteInfo(assignment.routeId)}</small>
                      </div>
                    </td>
                    <td>{new Date(assignment.dateAssigned).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(assignment)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    {searchTerm ? 'No assignments found matching your search' : 'No assignments found'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
 
      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {modalType === 'delete' ? (
              <div>
                <p>Are you sure you want to delete this assignment?</p>
                <div className="bg-light p-3 rounded">
                  <strong>{selectedAssignment?.assignmentId}</strong>
                  <br />
                  <small className="text-muted">
                    Vehicle: {selectedAssignment?.vehicleId} | Route: {selectedAssignment?.routeId}
                  </small>
                </div>
              </div>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle</Form.Label>
                  <Form.Select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.filter(v => v.status === 'AVAILABLE' || v.vehicleId === formData.vehicleId).map((vehicle) => (
                      <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                        {vehicle.vehicleId} - {vehicle.registrationNo} ({vehicle.type})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
               
                <Form.Group className="mb-3">
                  <Form.Label>Route</Form.Label>
                  <Form.Select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    required
                  >
                    <option value="">Select a route</option>
                    {routes.map((route) => (
                      <option key={route.routeId} value={route.routeId}>
                        {route.routeId} - {route.routeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
               
                <Form.Group className="mb-3">
                  <Form.Label>Date Assigned</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dateAssigned}
                    onChange={(e) => setFormData({ ...formData, dateAssigned: e.target.value })}
                    required
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={modalType === 'delete' ? 'danger' : 'success'}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {modalType === 'delete' ? 'Deleting...' : 'Saving...'}
                </>
              ) : (
                modalType === 'delete' ? 'Delete' : 'Save'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
 
export default AssignmentDashboard;