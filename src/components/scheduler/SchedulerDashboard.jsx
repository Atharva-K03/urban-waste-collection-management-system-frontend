import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Navbar } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { pickupAPI, vehicleAPI, workerAPI, zoneAPI } from '../../services/api';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Search,
  Recycle
} from 'lucide-react';

const SchedulerDashboard = () => {
  const [pickups, setPickups] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [formData, setFormData] = useState({
    zoneId: '',
    timeSlotStart: '',
    timeSlotEnd: '',
    frequency: '',
    locationName: '',
    vehicleId: '',
    worker1Id: '',
    worker2Id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
  const statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pickupsResponse, vehiclesResponse, workersResponse, zonesResponse] = await Promise.all([
        pickupAPI.getAll(),
        vehicleAPI.getPickupTrucks(),
        workerAPI.getAvailable(),
        zoneAPI.getNamesAndIds()
      ]);
      setPickups(pickupsResponse || []);
      setVehicles(vehiclesResponse || []);
      setWorkers(workersResponse || []);
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
      timeSlotStart: '',
      timeSlotEnd: '',
      frequency: '',
      locationName: '',
      vehicleId: '',
      worker1Id: '',
      worker2Id: ''
    });
    setSelectedPickup(null);
    setShowModal(true);
  };

  const handleEdit = (pickup) => {
    setModalType('edit');
    setFormData({
      zoneId: pickup.zoneId,
      timeSlotStart: pickup.timeSlotStart,
      timeSlotEnd: pickup.timeSlotEnd,
      frequency: pickup.frequency,
      locationName: pickup.locationName,
      vehicleId: pickup.vehicleId,
      worker1Id: pickup.worker1Id,
      worker2Id: pickup.worker2Id
    });
    setSelectedPickup(pickup);
    setShowModal(true);
  };

  const handleDelete = (pickup) => {
    setModalType('delete');
    setSelectedPickup(pickup);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalType === 'create') {
        await pickupAPI.create(formData);
      } else if (modalType === 'edit') {
        await pickupAPI.update(selectedPickup.id, formData);
      } else if (modalType === 'delete') {
        await pickupAPI.delete(selectedPickup.id);
      }
      
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPickups = pickups.filter(pickup =>
    pickup.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.zoneId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.zoneId === zoneId);
    return zone ? zone.zoneName : zoneId;
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.workerId === workerId);
    return worker ? worker.name : workerId;
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    return vehicle ? vehicle.registrationNo : vehicleId;
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Schedule New Pickup';
      case 'edit': return 'Edit Pickup Schedule';
      case 'delete': return 'Cancel Pickup';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading scheduler dashboard...</p>
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
            WasteWise Scheduler
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Pickup Scheduling</h2>
          <Button variant="success" onClick={handleCreate}>
            <Plus size={18} className="me-2" />
            Schedule Pickup
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                  <Calendar className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{pickups.length}</h3>
                  <small className="text-muted">Total Pickups</small>
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
                  <h3 className="mb-0 fw-bold">
                    {pickups.filter(p => p.status === 'IN_PROGRESS').length}
                  </h3>
                  <small className="text-muted">In Progress</small>
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
                    {pickups.filter(p => p.status === 'COMPLETED').length}
                  </h3>
                  <small className="text-muted">Completed</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                  <Calendar className="text-info" size={24} />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">
                    {pickups.filter(p => p.status === 'SCHEDULED').length}
                  </h3>
                  <small className="text-muted">Scheduled</small>
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
                <h5 className="mb-0">All Pickup Schedules</h5>
              </Col>
              <Col md={4}>
                <div className="position-relative">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <Form.Control
                    type="text"
                    placeholder="Search pickups..."
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
                  <th>Pickup ID</th>
                  <th>Location</th>
                  <th>Zone</th>
                  <th>Time Slot</th>
                  <th>Frequency</th>
                  <th>Vehicle</th>
                  <th>Workers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPickups.length > 0 ? (
                  filteredPickups.map((pickup) => (
                    <tr key={pickup.id}>
                      <td>
                        <Badge bg="primary" className="fw-normal">{pickup.id}</Badge>
                      </td>
                      <td className="fw-semibold">{pickup.locationName}</td>
                      <td>
                        <Badge bg="secondary" className="fw-normal">
                          {pickup.zoneId} - {getZoneName(pickup.zoneId)}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          {new Date(pickup.timeSlotStart).toLocaleString()}<br />
                          to {new Date(pickup.timeSlotEnd).toLocaleString()}
                        </small>
                      </td>
                      <td>
                        <Badge bg="info" className="fw-normal">{pickup.frequency}</Badge>
                      </td>
                      <td>{getVehicleInfo(pickup.vehicleId)}</td>
                      <td>
                        <small>
                          {getWorkerName(pickup.worker1Id)}<br />
                          {getWorkerName(pickup.worker2Id)}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(pickup.status)} className="fw-normal">
                          {pickup.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(pickup)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(pickup)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      {searchTerm ? 'No pickups found matching your search' : 'No pickups scheduled'}
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
                  <p>Are you sure you want to cancel this pickup?</p>
                  <div className="bg-light p-3 rounded">
                    <strong>{selectedPickup?.id} - {selectedPickup?.locationName}</strong>
                    <br />
                    <small className="text-muted">Zone: {selectedPickup?.zoneId}</small>
                  </div>
                </div>
              ) : (
                <Row>
                  <Col md={6}>
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
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter specific location"
                        value={formData.locationName}
                        onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formData.timeSlotStart}
                        onChange={(e) => setFormData({ ...formData, timeSlotStart: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={formData.timeSlotEnd}
                        onChange={(e) => setFormData({ ...formData, timeSlotEnd: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frequency</Form.Label>
                      <Form.Select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        required
                      >
                        <option value="">Select frequency</option>
                        {frequencies.map((freq) => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vehicle</Form.Label>
                      <Form.Select
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        required
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                            {vehicle.vehicleId} - {vehicle.registrationNo}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Worker 1</Form.Label>
                      <Form.Select
                        value={formData.worker1Id}
                        onChange={(e) => setFormData({ ...formData, worker1Id: e.target.value })}
                        required
                      >
                        <option value="">Select first worker</option>
                        {workers.filter(w => w.workerId !== formData.worker2Id).map((worker) => (
                          <option key={worker.workerId} value={worker.workerId}>
                            {worker.workerId} - {worker.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Worker 2</Form.Label>
                      <Form.Select
                        value={formData.worker2Id}
                        onChange={(e) => setFormData({ ...formData, worker2Id: e.target.value })}
                        required
                      >
                        <option value="">Select second worker</option>
                        {workers.filter(w => w.workerId !== formData.worker1Id).map((worker) => (
                          <option key={worker.workerId} value={worker.workerId}>
                            {worker.workerId} - {worker.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
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
                    {modalType === 'delete' ? 'Cancelling...' : 'Saving...'}
                  </>
                ) : (
                  modalType === 'delete' ? 'Cancel Pickup' : 'Save'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default SchedulerDashboard;

