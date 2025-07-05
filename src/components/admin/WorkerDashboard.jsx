import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { workerAPI } from '../../services/api';
import { Plus, Edit, Trash2, Users, Search, Mail, Phone } from 'lucide-react';
import { authAPI } from '../../services/api';
const WorkerDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    contactEmail: '',
    roleId: '',
    workerStatus: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { id: '002', name: 'Sanitary Worker' },
    { id: '003', name: 'Scheduler' }
  ];
  
  const workerStatuses = ['AVAILABLE', 'OCCUPIED', 'ABSENT'];

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await workerAPI.getAll();
      setWorkers(response || []);
    } catch (err) {
      setError('Failed to load workers');
      console.error('Load workers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setFormData({
      name: '',
      contactNumber: '',
      contactEmail: '',
      roleId: '',
      workerStatus: 'AVAILABLE'
    });
    setSelectedWorker(null);
    setShowModal(true);
  };

  const handleEdit = (worker) => {
    setModalType('edit');
    setFormData({
      name: worker.name,
      contactNumber: worker.contactNumber,
      contactEmail: worker.contactEmail,
      roleId: worker.roleId || '002',
      workerStatus: worker.workerStatus
    });
    setSelectedWorker(worker);
    setShowModal(true);
  };

  const handleDelete = (worker) => {
    setModalType('delete');
    setSelectedWorker(worker);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalType === 'create') {
        await workerAPI.create(formData);  
      } else if (modalType === 'edit') {
        await workerAPI.update(selectedWorker.workerId, formData);
      } else if (modalType === 'delete') {
        await workerAPI.delete(selectedWorker.workerId);
      }
      
      setShowModal(false);
      loadWorkers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'primary';
      case 'ABSENT': return 'danger';
      default: return 'secondary';
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Add New Worker';
      case 'edit': return 'Edit Worker';
      case 'delete': return 'Delete Worker';
      default: return '';
    }
  };

  const getWorkerStats = () => {
    const available = workers.filter(w => w.workerStatus === 'AVAILABLE').length;
    const occupied = workers.filter(w => w.workerStatus === 'OCCUPIED').length;
    const absent = workers.filter(w => w.workerStatus === 'ABSENT').length;
    const sanitaryWorkers = workers.filter(w => w.roleId === '002').length;
    const schedulers = workers.filter(w => w.roleId === '003').length;

    return { available, occupied, absent, sanitaryWorkers, schedulers };
  };

  const stats = getWorkerStats();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading workers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Worker Management</h2>
        <Button variant="success" onClick={handleCreate}>
          <Plus size={18} className="me-2" />
          Add Worker
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <Users className="text-primary mb-2" size={24} />
              <h4 className="mb-0 fw-bold">{workers.length}</h4>
              <small className="text-muted">Total Workers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-success mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.available}</h4>
              <small className="text-muted">Available</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-primary mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.occupied}</h4>
              <small className="text-muted">Occupied</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-danger mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.absent}</h4>
              <small className="text-muted">Absent</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-info mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.sanitaryWorkers}</h4>
              <small className="text-muted">Sanitary Workers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-warning mb-2">●</div>
              <h4 className="mb-0 fw-bold">{stats.schedulers}</h4>
              <small className="text-muted">Schedulers</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">All Workers</h5>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <Form.Control
                  type="text"
                  placeholder="Search workers..."
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
                <th>Worker ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (
                  <tr key={worker.workerId}>
                    <td>
                      <Badge bg="primary" className="fw-normal">{worker.workerId}</Badge>
                    </td>
                    <td className="fw-semibold">{worker.name}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <small className="d-flex align-items-center mb-1">
                          <Phone size={12} className="me-1" />
                          {worker.contactNumber}
                        </small>
                        <small className="d-flex align-items-center text-muted">
                          <Mail size={12} className="me-1" />
                          {worker.contactEmail}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge bg="info" className="fw-normal">
                        {getRoleName(worker.roleId)}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(worker.workerStatus)} className="fw-normal">
                        {worker.workerStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(worker)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(worker)}
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
                    {searchTerm ? 'No workers found matching your search' : 'No workers found'}
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
                <p>Are you sure you want to delete this worker?</p>
                <div className="bg-light p-3 rounded">
                  <strong>{selectedWorker?.workerId} - {selectedWorker?.name}</strong>
                  <br />
                  <small className="text-muted">Email: {selectedWorker?.contactEmail}</small>
                </div>
              </div>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter worker's full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter 10-digit contact number"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit contact number"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    required
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.workerStatus}
                    onChange={(e) => setFormData({ ...formData, workerStatus: e.target.value })}
                    required
                  >
                    {workerStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
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

export default WorkerDashboard;

