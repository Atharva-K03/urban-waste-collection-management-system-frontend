import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { routeAPI, zoneAPI } from '../../services/api';
import { Plus, Edit, Trash2, Route, Search, MapPin } from 'lucide-react';

const RouteDashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    zoneId: '',
    routeName: '',
    pickupPoints: '',
    estimatedTime: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesResponse, zonesResponse] = await Promise.all([
        routeAPI.getAll(),
        zoneAPI.getNamesAndIds()
      ]);
      setRoutes(routesResponse.data?.content || []);
      setZones(zonesResponse.data || []);
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
      zoneId: '',
      routeName: '',
      pickupPoints: '',
      estimatedTime: ''
    });
    setSelectedRoute(null);
    setShowModal(true);
  };

  const handleEdit = (route) => {
    setModalType('edit');
    setFormData({
      zoneId: route.zoneId,
      routeName: route.routeName,
      pickupPoints: route.pickupPoints,
      estimatedTime: route.estimatedTime
    });
    setSelectedRoute(route);
    setShowModal(true);
  };

  const handleDelete = (route) => {
    setModalType('delete');
    setSelectedRoute(route);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalType === 'create') {
        await routeAPI.create(formData);
      } else if (modalType === 'edit') {
        await routeAPI.update(selectedRoute.routeId, {
          routeName: formData.routeName,
          pickupPoints: formData.pickupPoints,
          estimatedTime: formData.estimatedTime
        });
      } else if (modalType === 'delete') {
        await routeAPI.delete(selectedRoute.routeId);
      }
      
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.routeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.zoneId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.zoneId === zoneId);
    return zone ? zone.zoneName : zoneId;
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Create New Route';
      case 'edit': return 'Edit Route';
      case 'delete': return 'Delete Route';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading routes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Route Management</h2>
        <Button variant="success" onClick={handleCreate}>
          <Plus size={18} className="me-2" />
          Create Route
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <Route className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{routes.length}</h3>
                <small className="text-muted">Total Routes</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <MapPin className="text-success" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{zones.length}</h3>
                <small className="text-muted">Covered Zones</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <Route className="text-info" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {routes.length > 0 ? Math.round(routes.reduce((sum, route) => sum + route.estimatedTime, 0) / routes.length) : 0}
                </h3>
                <small className="text-muted">Avg. Time (min)</small>
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
              <h5 className="mb-0">All Routes</h5>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <Form.Control
                  type="text"
                  placeholder="Search routes..."
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
                <th>Route ID</th>
                <th>Route Name</th>
                <th>Zone</th>
                <th>Pickup Points</th>
                <th>Est. Time (min)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr key={route.routeId}>
                    <td>
                      <Badge bg="primary" className="fw-normal">{route.routeId}</Badge>
                    </td>
                    <td className="fw-semibold">{route.routeName}</td>
                    <td>
                      <Badge bg="secondary" className="fw-normal">
                        {route.zoneId} - {getZoneName(route.zoneId)}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {route.pickupPoints ? route.pickupPoints.substring(0, 50) + '...' : 'No points'}
                      </small>
                    </td>
                    <td>{route.estimatedTime}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(route)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(route)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    {searchTerm ? 'No routes found matching your search' : 'No routes found'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {modalType === 'delete' ? (
              <div>
                <p>Are you sure you want to delete this route?</p>
                <div className="bg-light p-3 rounded">
                  <strong>{selectedRoute?.routeId} - {selectedRoute?.routeName}</strong>
                  <br />
                  <small className="text-muted">Zone: {selectedRoute?.zoneId}</small>
                </div>
              </div>
            ) : (
              <>
                {modalType === 'create' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Zone</Form.Label>
                    <Form.Select
                      value={formData.zoneId}
                      onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                      required
                    >
                      <option value="">Select a zone</option>
                      {zones.map((zone) => (
                        <option key={zone.zoneId} value={zone.zoneId}>
                          {zone.zoneId} - {zone.zoneName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Route Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter route name"
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Pickup Points</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter pickup points (comma-separated)"
                    value={formData.pickupPoints}
                    onChange={(e) => setFormData({ ...formData, pickupPoints: e.target.value })}
                  />
                  <Form.Text className="text-muted">
                    Enter pickup points separated by commas (e.g., Point A, Point B, Point C)
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Estimated Time (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="Enter estimated time in minutes"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
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

export default RouteDashboard;

