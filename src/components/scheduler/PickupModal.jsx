import React from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';

const PickupModal = ({
  showModal,
  setShowModal,
  modalType,
  getModalTitle,
  handleSubmit,
  formData,
  setFormData,
  zones,
  vehicles,
  workers,
  frequencies,
  selectedPickup,
  submitting,
  theme
}) => {
  console.log("PickupModal: Rendering");
  return (
    <Modal
      show={showModal}
      onHide={() => {
        console.log("PickupModal: Modal closed");
        setShowModal(false);
      }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Zone changed to", e.target.value);
                      setFormData({ ...formData, zoneId: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Location name changed to", e.target.value);
                      setFormData({ ...formData, locationName: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Start time changed to", e.target.value);
                      setFormData({ ...formData, timeSlotStart: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: End time changed to", e.target.value);
                      setFormData({ ...formData, timeSlotEnd: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Frequency changed to", e.target.value);
                      setFormData({ ...formData, frequency: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Vehicle changed to", e.target.value);
                      setFormData({ ...formData, vehicleId: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Worker 1 changed to", e.target.value);
                      setFormData({ ...formData, worker1Id: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log("PickupModal: Worker 2 changed to", e.target.value);
                      setFormData({ ...formData, worker2Id: e.target.value });
                    }}
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
  );
};

export default PickupModal;


