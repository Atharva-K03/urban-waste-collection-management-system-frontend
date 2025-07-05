import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { zoneAPI } from '../../services/api';
import { Plus, Edit, Trash2, MapPin, Search } from 'lucide-react';

const ZoneDashboard = () => {
  const { theme } = useTheme();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete'
  const [selectedZone, setSelectedZone] = useState(null);
  const [formData, setFormData] = useState({ zoneName: '', areaCoverage: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const response = await zoneAPI.getAll();
      setZones(response.data?.content || []);
    } catch (err) {
      setError('Failed to load zones');
      console.error('Load zones error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setFormData({ zoneName: '', areaCoverage: '' });
    setSelectedZone(null);
    setShowModal(true);
  };

  const handleEdit = (zone) => {
    setModalType('edit');
    setFormData({ zoneName: zone.zoneName, areaCoverage: zone.areaCoverage });
    setSelectedZone(zone);
    setShowModal(true);
  };

  const handleDelete = (zone) => {
    setModalType('delete');
    setSelectedZone(zone);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalType === 'create') {
        await zoneAPI.create(formData);
      } else if (modalType === 'edit') {
        await zoneAPI.update(selectedZone.zoneId, formData);
      } else if (modalType === 'delete') {
        await zoneAPI.delete(selectedZone.zoneId);
      }
      
      setShowModal(false);
      loadZones();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.zoneId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Create New Zone';
      case 'edit': return 'Edit Zone';
      case 'delete': return 'Delete Zone';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className={`mt-2 ${theme === 'dark' ? 'text-light' : ''}`}>Loading zones...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Zone Management</h2>
        <Button variant="success" onClick={handleCreate}>
          <Plus size={18} className="me-2" />
          Create Zone
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
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`} 
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{zones.length}</h3>
                <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Total Zones</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <MapPin className="text-success" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {zones.reduce((sum, zone) => sum + zone.areaCoverage, 0).toFixed(1)}
                </h3>
                <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Total Area Coverage</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className={`border-0 shadow-sm ${theme === 'dark' ? 'text-light' : ''}`}
                style={{ backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <MapPin className="text-info" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {zones.length > 0 ? (zones.reduce((sum, zone) => sum + zone.areaCoverage, 0) / zones.length).toFixed(1) : 0}
                </h3>
                <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Average Area</small>
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
              <h5 className="mb-0">All Zones</h5>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Search className={`position-absolute top-50 start-0 translate-middle-y ms-3 ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`} size={16} />
                <Form.Control
                  type="text"
                  placeholder="Search zones..."
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
                <th>Zone ID</th>
                <th>Zone Name</th>
                <th>Area Coverage</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.length > 0 ? (
                filteredZones.map((zone) => (
                  <tr key={zone.zoneId}>
                    <td>
                      <Badge bg="primary" className="fw-normal">{zone.zoneId}</Badge>
                    </td>
                    <td className="fw-semibold">{zone.zoneName}</td>
                    <td>{zone.areaCoverage} sq km</td>
                    <td>{new Date(zone.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(zone)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(zone)}
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
                    {searchTerm ? 'No zones found matching your search' : 'No zones found'}
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
                <p>Are you sure you want to delete this zone?</p>
                <div className={`p-3 rounded ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-light'}`}>
                  <strong>{selectedZone?.zoneId} - {selectedZone?.zoneName}</strong>
                  <br />
                  <small className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>Area Coverage: {selectedZone?.areaCoverage} sq km</small>
                </div>
              </div>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Zone Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter zone name"
                    value={formData.zoneName}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Area Coverage (sq km)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="Enter area coverage"
                    value={formData.areaCoverage}
                    onChange={(e) => setFormData({ ...formData, areaCoverage: e.target.value })}
                    className={theme === 'dark' ? 'bg-secondary text-light border-secondary' : ''}
                    required
                  />
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

export default ZoneDashboard;