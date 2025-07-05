import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Recycle } from 'lucide-react';

const Login = () => {
  const [workerId, setWorkerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(workerId, password);
      
      // Navigate based on role
      if (response.role === 'ADMIN') {
        navigate('/wastewise/admin');
      } else if (response.role === 'SCHEDULER') {
        navigate('/wastewise/scheduler');
      } else if (response.role === 'SANITARY_WORKER') {
        navigate('/wastewise/worker');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div></div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={toggleTheme}
                      className="border-0"
                    >
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </Button>
                  </div>
                  <div className="mb-3">
                    <Recycle size={48} className="text-success" />
                  </div>
                  <h2 className="fw-bold text-dark mb-2">WasteWise</h2>
                  <p className="text-muted">Waste Management System</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Worker ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your Worker ID (e.g., W001)"
                      value={workerId}
                      onChange={(e) => setWorkerId(e.target.value)}
                      required
                      pattern="^W\d{3}$"
                      title="Worker ID must be in format W001, W002, etc."
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="w-100 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Demo Credentials:<br />
                    Admin: W001 / admin123<br />
                    Worker: W002 / worker123
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;

