// src/components/AuthPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Nav,
  Alert,
} from 'react-bootstrap';
import { Moon, Sun, Truck, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [workerId, setWorkerId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await login(workerId, password);
        // route by role
        if (response.role === 'ADMIN') navigate('/wastewise/admin');
        else if (response.role === 'SCHEDULER') navigate('/wastewise/scheduler');
        else navigate('/wastewise/worker');
      } else {
        if (!resetPassword) {
          throw new Error("resetPassword() isn't defined in your AuthContext");
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await resetPassword(workerId, newPassword);
        alert('Password reset successful');
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Gradient style for cards in dark mode
  const getCardStyle = () => {
    if (theme === 'dark') {
      return {
        background: 'linear-gradient(135deg, #E0F7FA 0%, #E8F5E9 100%)',
        color: '#333',
        border: 'none'
      };
    }
    return {};
  };

  // Main auth card style
  const getAuthCardStyle = () => {
    if (theme === 'dark') {
      return {
        background: 'linear-gradient(135deg, #E0F7FA 0%, #E8F5E9 100%)',
        color: '#333',
        border: 'none',
        maxWidth: 400
      };
    }
    return { maxWidth: 400 };
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: theme === 'light'
          ? 'linear-gradient(135deg,#E0F7FA,#E8F5E9)'
          : '#1a1a1a',
      }}
    >
      <Container fluid>
        <Row className="gx-0">
          {/* Left Branding — hidden on small */}
          <Col
            md={6}
            className="d-none d-md-flex flex-column justify-content-center px-5"
          >
            <h1 className={`display-3 fw-bold mb-4 ${theme === 'dark' ? 'text-light' : 'text-success'}`}>
              WasteWise
            </h1>
            
            {[
              { icon: <Truck size={28} />, title: 'Waste Management', sub: 'Optimize routes' },
              { icon: <Shield size={28} />, title: 'Secure Access', sub: 'Role‑based auth' },
              { icon: <Users size={28} />, title: 'Team Management', sub: 'Coordinate staff' },
            ].map((c, i) => (
              <Card 
                key={i} 
                className="mb-4 shadow-sm rounded-4 border-0" 
                style={{ 
                  maxWidth: 300,
                  ...getCardStyle()
                }}
              >
                <Card.Body className="d-flex align-items-center">
                  <div className="text-success me-3">{c.icon}</div>
                  <div>
                    <h5 className="mb-1" style={{ color: theme === 'dark' ? '#333' : 'inherit' }}>
                      {c.title}
                    </h5>
                    <small style={{ color: theme === 'dark' ? '#666' : 'inherit' }} className={theme === 'light' ? 'text-muted' : ''}>
                      {c.sub}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Col>

          {/* Right Auth Form */}
          <Col xs={12} md={6} className="d-flex justify-content-center align-items-center p-4">
            <Card 
              className="shadow-lg rounded-4 w-100" 
              style={getAuthCardStyle()}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="mb-0" style={{ color: theme === 'dark' ? '#333' : 'inherit' }}>
                    {mode === 'login' ? 'Sign In' : 'Reset Password'}
                  </h3>
                  <Button variant="outline-secondary" size="sm" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  </Button>
                </div>

                <Nav
                  variant="tabs"
                  activeKey={mode}
                  onSelect={(k) => { setMode(k); setError(''); }}
                  className="mb-3"
                >
                  <Nav.Item>
                    <Nav.Link
                      eventKey="login"
                      style={{ 
                        fontWeight: 'bold', 
                        color: theme === 'dark' ? '#333' : 'black' 
                      }}
                    >
                      Login
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="reset"
                      style={{ 
                        fontWeight: 'bold', 
                        color: theme === 'dark' ? '#333' : 'black' 
                      }}
                    >
                      Reset
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: theme === 'dark' ? '#333' : 'inherit' }}>
                      Worker ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="W001"
                      value={workerId}
                      onChange={(e) => setWorkerId(e.target.value)}
                      required
                      pattern="^W\d{3}$"
                      style={theme === 'dark' ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        color: '#333'
                      } : {}}
                    />
                  </Form.Group>

                  {mode === 'login' ? (
                    <Form.Group className="mb-4">
                      <Form.Label style={{ color: theme === 'dark' ? '#333' : 'inherit' }}>
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={theme === 'dark' ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #ccc',
                          color: '#333'
                        } : {}}
                      />
                    </Form.Group>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: theme === 'dark' ? '#333' : 'inherit' }}>
                          New Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          style={theme === 'dark' ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #ccc',
                            color: '#333'
                          } : {}}
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ color: theme === 'dark' ? '#333' : 'inherit' }}>
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          style={theme === 'dark' ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #ccc',
                            color: '#333'
                          } : {}}
                        />
                      </Form.Group>
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100 fw-bold"
                    disabled={loading}
                  >
                    {loading
                      ? <span className="spinner-border spinner-border-sm" role="status" />
                      : mode === 'login'
                        ? 'Sign In'
                        : 'Reset Password'
                    }
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthPage;