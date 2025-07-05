import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { vehicleAPI } from '../../services/api';
import { Plus, Edit, Trash2, Truck, Search, Settings } from 'lucide-react';

const VehicleDashboard = () => {
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registrationNo: '',
    type: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const vehicleTypes = ['PICKUP_TRUCK', 'ROUTE_TRUCK'];
  const vehicleStatuses = ['AVAILABLE', 'UNDER_MAINTENANCE', 'ASSIGNED'];

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      setVehicles(response || []);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error('Load vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setFormData({
      registrationNo: '',
      type: '',
      status: 'AVAILABLE'
    });
    setSelectedVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setModalType('edit');
    setFormData({
      vehicleId: vehicle.vehicleId,
      registrationNo: vehicle.registrationNo,
      type: vehicle.type,
      status: vehicle.status
    });
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = (vehicle) => {
    setModalType('delete');
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalType === 'create') {
        await vehicleAPI.create(formData);
      } else if (modalType === 'edit') {
        await vehicleAPI.update(selectedVehicle.vehicleId, formData);
      } else if (modalType === 'delete') {
        await vehicleAPI.delete(selectedVehicle.vehicleId);
      }
      
      setShowModal(false);
      loadVehicles();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ASSIGNED': return 'primary';
      case 'UNDER_MAINTENANCE': return 'warning';
      default: return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'PICKUP_TRUCK': return 'info';
      case 'ROUTE_TRUCK': return 'primary';
      default: return 'secondary';
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Add New Vehicle';
      case 'edit': return 'Edit Vehicle';
      case 'delete': return 'Delete Vehicle';
      default: return '';
    }
  };

  const getVehicleStats = () => {
    const available = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const maintenance = vehicles.filter(v => v.status === 'UNDER_MAINTENANCE').length;
    const pickupTrucks = vehicles.filter(v => v.type === 'PICKUP_TRUCK').length;
    const routeTrucks = vehicles.filter(v => v.type === 'ROUTE_TRUCK').length;

    return { available, maintenance, pickupTrucks, routeTrucks };
  };

  const stats = getVehicleStats();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className={`mt-2 ${theme === 'dark' ? 'text-light' : ''}`}>Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Vehicle Management</h2>
        <Button variant="success" onClick={handleCreate}>
          <Plus size={18} className="me-2" />
          Add Vehicle
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards - All cards now use the same column size */}
      <Row className="mb-4">
        <Col md={2} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="text-center">
              <Truck className="text-primary mb-2" size={24} />
              <h4 className="mb-0 fw-bold">{vehicles.length}</h4>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Total Vehicles</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="text-center">
              <div className="text-success mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.available}</h4>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Available</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="text-center">
              <div className="text-warning mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.maintenance}</h4>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Maintenance</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="text-center">
              <div className="text-info mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.pickupTrucks}</h4>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Pickup Trucks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="text-center">
              <div className="text-primary mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.routeTrucks}</h4>
              <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Route Trucks</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Table */}
      <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
            style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
        <Card.Header className="border-0"
                     style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">All Vehicles</h5>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Search className={`position-absolute top-50 start-0 translate-middle-y ms-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`} size={16} />
                <Form.Control
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`ps-5 ${theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}`}
                />
              </div>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className={`mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
            <thead className={theme === 'dark' ? 'bg-secondary' : 'bg-light'}>
              <tr>
                <th>Vehicle ID</th>
                <th>Registration No</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td>
                      <Badge bg="primary" className="fw-normal">{vehicle.vehicleId}</Badge>
                    </td>
                    <td className="fw-semibold">{vehicle.registrationNo}</td>
                    <td>
                      <Badge bg={getTypeBadgeVariant(vehicle.type)} className="fw-normal">
                        {vehicle.type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(vehicle.status)} className="fw-normal">
                        {vehicle.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(vehicle)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`text-center py-4 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
                    {searchTerm ? 'No vehicles found matching your search' : 'No vehicles found'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        contentClassName={theme === 'dark' ? 'bg-dark text-light' : ''}
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className={theme === 'dark' ? 'bg-dark' : ''}>
            {modalType === 'delete' ? (
              <div>
                <p>Are you sure you want to delete this vehicle?</p>
                <div className={`p-3 rounded ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-light'}`}>
                  <strong>{selectedVehicle?.vehicleId} - {selectedVehicle?.registrationNo}</strong>
                  <br />
                  <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Type: {selectedVehicle?.type?.replace('_', ' ')}</small>
                </div>
              </div>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter registration number (e.g., KA01AB1234)"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
                    required
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
                    required
                  >
                    {vehicleStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
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

export default VehicleDashboard;