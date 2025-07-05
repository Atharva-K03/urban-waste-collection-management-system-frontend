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
      <Nav className="flex-column p-3 flex-grow-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Nav.Link
              key={item.id}
              className={`d-flex align-items-center py-3 px-3 mb-1 rounded ${
                activeView === item.id ? 'bg-success text-white' : 'text-dark hover-bg-light'
              }`}
              onClick={() => {
                setActiveView(item.id);
                setShowSidebar(false);
              }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <IconComponent size={18} className="me-3" />
              {item.label}
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      {/* Horizontal Navbar */}
      <Navbar bg="white" className="border-bottom shadow-sm" style={{ zIndex: 1030 }}>
        <Container fluid>
          {/* Left side - Hamburger menu and Brand */}
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={() => setShowSidebar(true)}
              style={{ border: 'none' }}
            >
              <Menu size={20} />
            </Button>
            <Navbar.Brand className="d-flex align-items-center mb-0">
              <Recycle size={28} className="text-success me-2" />
              <span className="fw-bold">WasteWise Admin</span>
            </Navbar.Brand>
          </div>

          {/* Right side - Theme toggle and logout */}
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              className="d-flex align-items-center"
              style={{ border: 'none' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={logout}
              className="d-flex align-items-center"
              style={{ border: 'none' }}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Collapsible Sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="start"
        style={{ width: '280px' }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>Navigation Menu</Offcanvas.Title>
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
  );
};

export default AdminDashboard;