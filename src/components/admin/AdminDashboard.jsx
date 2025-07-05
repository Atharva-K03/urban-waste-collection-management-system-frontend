import React, { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Menu,
  BarChart3,
  MapPin,
  Route,
  Truck,
  Users,
  Calendar,
  Recycle
} from 'lucide-react';
import LogsDashboard from './LogsDashboard';
import ZoneDashboard from './ZoneDashboard';
import RouteDashboard from './RouteDashboard';
import VehicleDashboard from './VehicleDashboard';
import WorkerDashboard from './WorkerDashboard';
import AssignmentDashboard from './AssignmentDashboard';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('logs');
  const [showSidebar, setShowSidebar] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'logs', label: 'Dashboard & Logs', icon: BarChart3 },
    { id: 'zones', label: 'Zone Management', icon: MapPin },
    { id: 'routes', label: 'Route Management', icon: Route },
    { id: 'vehicles', label: 'Vehicle Management', icon: Truck },
    { id: 'workers', label: 'Worker Management', icon: Users },
    { id: 'assignments', label: 'Assignment Management', icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'logs':
        return <LogsDashboard />;
      case 'zones':
        return <ZoneDashboard />;
      case 'routes':
        return <RouteDashboard />;
      case 'vehicles':
        return <VehicleDashboard />;
      case 'workers':
        return <WorkerDashboard />;
      case 'assignments':
        return <AssignmentDashboard />;
      default:
        return <LogsDashboard />;
    }
  };

  const SidebarContent = () => (
    <div className="h-100 d-flex flex-column">
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <Recycle size={24} className="text-success me-2" />
          <h5 className="mb-0 fw-bold">WasteWise Admin</h5>
        </div>
        <small className="text-muted">Welcome, {user?.workerId}</small>
      </div>
      
      <Nav className="flex-column p-3 flex-grow-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Nav.Link
              key={item.id}
              className={`d-flex align-items-center py-2 px-3 mb-1 rounded ${
                activeView === item.id ? 'bg-success text-white' : 'text-dark'
              }`}
              onClick={() => {
                setActiveView(item.id);
                setShowSidebar(false);
              }}
              style={{ cursor: 'pointer' }}
            >
              <IconComponent size={18} className="me-2" />
              {item.label}
            </Nav.Link>
          );
        })}
      </Nav>
      
      <div className="p-3 border-top">
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={toggleTheme}
            className="flex-grow-1"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={logout}
            className="flex-grow-1"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      {/* Mobile Header */}
      <Navbar bg="white" className="d-lg-none border-bottom">
        <Container fluid>
          <Button
            variant="outline-secondary"
            onClick={() => setShowSidebar(true)}
          >
            <Menu size={20} />
          </Button>
          <Navbar.Brand className="mx-auto">
            <Recycle size={24} className="text-success me-2" />
            WasteWise
          </Navbar.Brand>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={logout}
          >
            <LogOut size={16} />
          </Button>
        </Container>
      </Navbar>

      <div className="d-flex">
        {/* Desktop Sidebar */}
        <div className="d-none d-lg-block bg-white border-end" style={{ width: '280px', minHeight: '100vh' }}>
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          placement="start"
          className="d-lg-none"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <SidebarContent />
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <div className="flex-grow-1">
          <Container fluid className="p-4">
            {renderContent()}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

