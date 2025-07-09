import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { LogOut, Moon, Sun, Leaf } from 'lucide-react';
const NavbarComponent = ({ theme, toggleTheme, logout }) => {
  console.log("NavbarComponent: Rendering");
  return (
    <Navbar className={`border-bottom ${theme === 'dark' ? 'bg-dark border-secondary' : 'bg-white'}`}>
      <Container fluid>
        <div className="d-flex align-items-center">
          <Navbar.Brand className={`d-flex align-items-center mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
            <Leaf size={28} className="text-success me-2" />
            <span className="fw-bold">WasteWise Scheduler</span>
          </Navbar.Brand>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
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
  );
};

export default NavbarComponent;


