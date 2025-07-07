/**
 * SchedulerDashboard.jsx
 * 
 * This component serves as the main dashboard for managing pickup schedules in the WasteWise application.
 * It provides functionality to view, create, edit, and delete pickup schedules, along with filtering and searching capabilities.
 * The dashboard also displays summary statistics for daily, weekly, and monthly pickups, as well as today's pickups.
 * 
 * Features:
 * - Fetch and display pickup schedules, vehicles, workers, and zones from the backend API.
 * - Provide summary statistics for pickup frequencies.
 * - Allow users to create, edit, and delete pickup schedules via a modal form.
 * - Search and filter pickup schedules based on location, zone, or pickup ID.
 * - Display pickup schedules in a responsive table with actions for editing and deleting.
 * - Support light and dark themes, with dynamic styling based on the selected theme.
 * - Handle authentication and logout functionality.
 * 
 * Dependencies:
 * - React and React Bootstrap for UI components.
 * - Axios for API requests.
 * - Lucide React for icons.
 * - Custom hooks (`useAuth`, `useTheme`) for authentication and theme management.
 * 
 * Props:
 * - None
 * 
 * State Variables:
 * - pickups: Array of pickup schedules fetched from the API.
 * - vehicles: Array of vehicles fetched from the API.
 * - workers: Array of workers fetched from the API.
 * - zones: Array of zones fetched from the API.
 * - loading: Boolean indicating whether data is being loaded.
 * - error: String for error messages.
 * - showModal: Boolean to control the visibility of the modal.
 * - modalType: String indicating the type of modal ('create', 'edit', 'delete').
 * - selectedPickup: Object representing the currently selected pickup for editing or deleting.
 * - formData: Object containing form data for creating or editing a pickup schedule.
 * - searchTerm: String for filtering pickup schedules.
 * - submitting: Boolean indicating whether a form submission is in progress.
 * 
 * Functions:
 * - loadData: Fetches pickups, vehicles, workers, and zones from the API.
 * - getPickupCountsByFrequency: Calculates the count of pickups by frequency (daily, weekly, monthly).
 * - getTodaysPickups: Calculates the count of pickups scheduled for today.
 * - handleCreate: Opens the modal for creating a new pickup schedule.
 * - handleEdit: Opens the modal for editing an existing pickup schedule.
 * - handleDelete: Opens the modal for deleting a pickup schedule.
 * - handleSubmit: Handles form submission for creating, editing, or deleting a pickup schedule.
 * - getStatusBadgeVariant: Returns the badge variant for a pickup status.
 * - getFrequencyBadgeVariant: Returns the badge variant for a pickup frequency.
 * - getZoneName: Retrieves the name of a zone based on its ID.
 * - getWorkerName: Retrieves the name of a worker based on their ID.
 * - getVehicleInfo: Retrieves vehicle information based on its ID.
 * - getModalTitle: Returns the title for the modal based on its type.
 * 
 * Components:
 * - Navbar: Displays the application header with theme toggle and logout functionality.
 * - Summary Cards: Displays statistics for daily, weekly, monthly, and today's pickups.
 * - Search Bar: Allows users to filter pickup schedules.
 * - Table: Displays pickup schedules with actions for editing and deleting.
 * - Modal: Provides forms for creating, editing, or deleting pickup schedules.
 * 
 * Error Handling:
 * - Displays an error message if data fails to load or an operation fails.
 * 
 * Theme Support:
 * - Dynamically adjusts styling based on the selected theme (light or dark).
 * 
 * Usage:
 * - Import and render the `SchedulerDashboard` component in your application.
 * - Ensure the backend API endpoints are correctly configured and accessible.
 * 
 * Example:
 * ```jsx
 * import SchedulerDashboard from './SchedulerDashboard';
 * 
 * const App = () => {
 *   return (
 *     <SchedulerDashboard />
 *   );
 * };
 * 
 * export default App;
 * ```
 */
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
  Recycle,
  Clock,
  RotateCcw,
  CalendarDays
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

  // Calculate pickup counts by frequency
  const getPickupCountsByFrequency = () => {
    const dailyCount = pickups.filter(p => p.frequency === 'DAILY').length;
    const weeklyCount = pickups.filter(p => p.frequency === 'WEEKLY').length;
    const monthlyCount = pickups.filter(p => p.frequency === 'MONTHLY').length;
    
    return { dailyCount, weeklyCount, monthlyCount };
  };

  // Calculate today's pickups based on frequency and schedule
  const getTodaysPickups = () => {
    const today = new Date();
    const todayDateString = today.toDateString();
    
    return pickups.filter(pickup => {
      const pickupDate = new Date(pickup.timeSlotStart);
      const pickupDateString = pickupDate.toDateString();
      
      // Check if pickup is scheduled for today based on frequency
      switch (pickup.frequency) {
        case 'DAILY':
          // Daily pickups happen every day from the start date
          return pickupDate <= today;
          
        case 'WEEKLY':
          // Weekly pickups happen on the same day of the week
          const daysDifference = Math.floor((today - pickupDate) / (1000 * 60 * 60 * 24));
          return daysDifference >= 0 && daysDifference % 7 === 0;
          
        case 'MONTHLY':
          // Monthly pickups happen on the same date each month
          const monthsDifference = (today.getFullYear() - pickupDate.getFullYear()) * 12 + 
                                  (today.getMonth() - pickupDate.getMonth());
          return monthsDifference >= 0 && 
                 today.getDate() === pickupDate.getDate() && 
                 monthsDifference >= 0;
          
        default:
          // For any other frequency, check if it's exactly today
          return pickupDateString === todayDateString;
      }
    }).length;
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

  const getFrequencyBadgeVariant = (frequency) => {
    switch (frequency) {
      case 'DAILY': return 'success';
      case 'WEEKLY': return 'warning';
      case 'MONTHLY': return 'primary';
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
        <p className={`mt-2 ${theme === 'dark' ? 'text-light' : ''}`}>Loading scheduler dashboard...</p>
      </div>
    );
  }

  const { dailyCount, weeklyCount, monthlyCount } = getPickupCountsByFrequency();
  const todaysPickupsCount = getTodaysPickups();

  return (
    <div className={`min-vh-100 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light'}`}>
      {/* Header */}
      <Navbar className={`border-bottom ${theme === 'dark' ? 'bg-dark border-secondary' : 'bg-white'}`}>
        <Container fluid>
          <Navbar.Brand className={theme === 'dark' ? 'text-light' : ''}>
            <Recycle size={24} className="text-success me-2" />
            WasteWise Scheduler
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-2">
            <span className={`me-2 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>Welcome, {user?.workerId}</span>
            <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
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
          <h2 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Pickup Scheduling</h2>
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

        {/* Search and Table */}
        <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
              style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
          <Card.Header className="border-0" 
                       style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-0">All Pickup Schedules</h5>
              </Col>
              <Col md={4}>
                <div className="position-relative">
                  <Search className={`position-absolute top-50 start-0 translate-middle-y ms-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`} size={16} />
                  <Form.Control
                    type="text"
                    placeholder="Search pickups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`ps-5 ${theme === 'dark' ? 'bg-secondary text-white border-secondary' : ''}`}
                  />
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className={`mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
              <thead className={theme === 'dark' ? 'bg-secondary' : 'bg-light'}>
                <tr>
                  <th>Pickup ID</th>
                  <th>Location</th>
                  <th>Zone</th>
                  <th>Time Slot</th>
                  <th>Frequency</th>
                  <th>Vehicle</th>
                  <th>Workers</th>
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
                        <Badge bg={getFrequencyBadgeVariant(pickup.frequency)} className="fw-normal">{pickup.frequency}</Badge>
                      </td>
                      <td>{getVehicleInfo(pickup.vehicleId)}</td>
                      <td>
                        <small>
                          {getWorkerName(pickup.worker1Id)}<br />
                          {getWorkerName(pickup.worker2Id)}
                        </small>
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
                    <td colSpan="9" className={`text-center py-4 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
                      {searchTerm ? 'No pickups found matching your search' : 'No pickups scheduled'}
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
          size="lg"
          contentClassName={theme === 'dark' ? 'bg-dark text-light' : ''}
        >
          <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
            <Modal.Title>{getModalTitle()}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className={theme === 'dark' ? 'bg-dark' : ''}>
              {modalType === 'delete' ? (
                <div>
                  <p>Are you sure you want to cancel this pickup?</p>
                  <div className={`p-3 rounded ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-light'}`}>
                    <strong>{selectedPickup?.id} - {selectedPickup?.locationName}</strong>
                    <br />
                    <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Zone: {selectedPickup?.zoneId}</small>
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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
                        className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
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

