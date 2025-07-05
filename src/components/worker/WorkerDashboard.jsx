import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Navbar
} from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { pickupAPI } from '../../services/api';
import {
  MapPin,
  Clock,
  Repeat,
  Truck,
  Moon,
  Sun,
  LogOut,
  Recycle,
  Map
} from 'lucide-react';

const WorkerDashboard = () => {
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const result = await pickupAPI.getByWorkerId(user.workerId);
        setPickup(result || null);
      } catch (err) {
        setError('Failed to load pickup job');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.workerId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className={`min-vh-100 ${theme === 'light' ? 'bg-light' : 'bg-dark text-white'}`}>
      <Navbar bg="white" className="border-bottom">
        <Container fluid>
          <Navbar.Brand>
            <Recycle size={24} className="text-success me-2" />
            WasteWise Worker
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Welcome, {user.workerId}</span>
            <Button variant="outline-secondary" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <Button variant="outline-danger" size="sm" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container className="py-4">
        {error && <Alert variant="danger">{error}</Alert>}

        {pickup ? (
          <Card
            className="mx-auto shadow-lg rounded-4 py-3"
            style={{ maxWidth: 600, borderRadius: '2rem' }}
          >
            <Card.Header className="bg-white text-center py-3 rounded-top-4">
              <h4 className="mb-0">Today’s Pickup Job</h4>
            </Card.Header>
            <Card.Body className="py-3">
              {[
                { icon: MapPin, label: 'Location Name', value: pickup.locationName, color: 'text-danger' },
                { icon: Map, label: 'Zone ID', value: pickup.zoneId, color: 'text-secondary' },
                { icon: Clock, label: 'Time Slot', value: `${new Date(pickup.timeSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(pickup.timeSlotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, color: 'text-warning' },
                { icon: Repeat, label: 'Frequency', value: pickup.frequency.toLowerCase(), color: 'text-info' },
                { icon: Truck, label: 'Vehicle ID', value: pickup.vehicleId, color: 'text-success' }
              ].map(({ icon: Icon, label, value, color }, idx) => (
                <Row key={idx} className="mb-3 justify-content-center align-items-center">
                  <Col xs="auto" className="text-center">
                    <Icon size={24} className={color} />
                  </Col>
                  <Col xs={8} className="text-center">
                    <h5 className="mb-0">{value}</h5>
                    <small className="text-muted">{label}</small>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        ) : (
          <div className="text-center py-5 text-muted">
            <MapPin size={64} className="opacity-50 mb-3" />
            <p>No pickup job assigned for today.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default WorkerDashboard;
