import React from 'react';
import { Card, Row, Col, Form, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Search, Edit, Trash2 } from 'lucide-react';

const PickupTable = ({
  theme,
  searchTerm,
  setSearchTerm,
  filteredPickups,
  getFrequencyBadgeVariant,
  getZoneName,
  getWorkerName,
  getVehicleInfo,
  handleEdit,
  handleDelete,
  tableLoading
}) => {
  console.log("PickupTable: Rendering");
  return (
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
                onChange={(e) => {
                  console.log("PickupTable: Search term changed to", e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className={`ps-5 ${theme === 'dark' ? 'bg-secondary text-white border-secondary' : ''}`}
              />
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        {tableLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className={`mt-2 ${theme === 'dark' ? 'text-light' : ''}`}>Loading pickups...</p>
          </div>
        ) : (
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
                          onClick={() => {
                            console.log("PickupTable: Edit button clicked for pickup:", pickup.id);
                            handleEdit(pickup);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            console.log("PickupTable: Delete button clicked for pickup:", pickup.id);
                            handleDelete(pickup);
                          }}
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
        )}
      </Card.Body>
    </Card>
  );
};

export default PickupTable;


