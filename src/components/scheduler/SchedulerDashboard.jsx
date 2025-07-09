import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { pickupAPI, vehicleAPI, workerAPI, zoneAPI } from '../../services/api';

import NavbarComponent from './NavbarComponent';
import SummaryCards from './SummaryCards.jsx';
import PickupTable from './PickupTable';
import PickupModal from './PickupModal';

const SchedulerDashboard = () => {
  console.log('SchedulerDashboard: Component rendering');
  const [pickups, setPickups] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [formData, setFormData] = useState({
    zoneId: '',
    timeSlotStart: '',
    timeSlotEnd: '',
    frequency: '',
    locationName: '',
    vehicleId: '',
    worker1Id: '',
    worker2Id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false); // Granular spinner for table

  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];

  useEffect(() => {
    console.log('SchedulerDashboard: useEffect triggered for initial data load');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('SchedulerDashboard: Loading data from API');
    try {
      setLoading(true);
      setTableLoading(true); // Show spinner for table during initial load
      const [pickupsResponse, vehiclesResponse, workersResponse, zonesResponse] = await Promise.all([
        pickupAPI.getAll(),
        vehicleAPI.getPickupTrucks(),
        workerAPI.getAvailable(),
        zoneAPI.getNamesAndIds()
      ]);
      setPickups(pickupsResponse || []);
      setVehicles(vehiclesResponse || []);
      setWorkers(workersResponse || []);
      setZones(zonesResponse.data || []);
      console.log('SchedulerDashboard: Data loaded successfully');
    } catch (err) {
      setError('Failed to load data');
      console.error('SchedulerDashboard: Load data error:', err);
    } finally {
      setLoading(false);
      setTableLoading(false); // Hide spinner after initial load
    }
  };

  const getPickupCountsByFrequency = () => {
    console.log('SchedulerDashboard: Calculating pickup counts by frequency');
    const dailyCount = pickups.filter(p => p.frequency === 'DAILY').length;
    const weeklyCount = pickups.filter(p => p.frequency === 'WEEKLY').length;
    const monthlyCount = pickups.filter(p => p.frequency === 'MONTHLY').length;
    return { dailyCount, weeklyCount, monthlyCount };
  };

  const getTodaysPickups = () => {
    console.log('SchedulerDashboard: Calculating today\'s pickups');
    const today = new Date();
    const todayDateString = today.toDateString();

    return pickups.filter(pickup => {
      const pickupDate = new Date(pickup.timeSlotStart);
      const pickupDateString = pickupDate.toDateString();

      switch (pickup.frequency) {
        case 'DAILY':
          return pickupDate <= today;
        case 'WEEKLY':
          const daysDifference = Math.floor((today - pickupDate) / (1000 * 60 * 60 * 24));
          return daysDifference >= 0 && daysDifference % 7 === 0;
        case 'MONTHLY':
          const monthsDifference = (today.getFullYear() - pickupDate.getFullYear()) * 12 +
                                  (today.getMonth() - pickupDate.getMonth());
          return monthsDifference >= 0 &&
                 today.getDate() === pickupDate.getDate() &&
                 monthsDifference >= 0;
        default:
          return pickupDateString === todayDateString;
      }
    }).length;
  };

  const handleCreate = () => {
    console.log('SchedulerDashboard: Handling create action');
    setModalType('create');
    setFormData({
      zoneId: '',
      timeSlotStart: '',
      timeSlotEnd: '',
      frequency: '',
      locationName: '',
      vehicleId: '',
      worker1Id: '',
      worker2Id: ''
    });
    setSelectedPickup(null);
    setShowModal(true);
  };

  const handleEdit = (pickup) => {
    console.log('SchedulerDashboard: Handling edit action for pickup:', pickup.id);
    setModalType('edit');
    setFormData({
      zoneId: pickup.zoneId,
      timeSlotStart: pickup.timeSlotStart,
      timeSlotEnd: pickup.timeSlotEnd,
      frequency: pickup.frequency,
      locationName: pickup.locationName,
      vehicleId: pickup.vehicleId,
      worker1Id: pickup.worker1Id,
      worker2Id: pickup.worker2Id
    });
    setSelectedPickup(pickup);
    setShowModal(true);
  };

  const handleDelete = (pickup) => {
    console.log('SchedulerDashboard: Handling delete action for pickup:', pickup.id);
    setModalType('delete');
    setSelectedPickup(pickup);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('SchedulerDashboard: Handling form submission for modal type:', modalType);
    setSubmitting(true);
    setError('');
    setTableLoading(true); // Show spinner for table during CRUD operation

    try {
      if (modalType === 'create') {
        await pickupAPI.create(formData);
        console.log('SchedulerDashboard: Pickup created successfully');
      } else if (modalType === 'edit') {
        await pickupAPI.update(selectedPickup.id, formData);
        console.log('SchedulerDashboard: Pickup updated successfully');
      } else if (modalType === 'delete') {
        await pickupAPI.delete(selectedPickup.id);
        console.log('SchedulerDashboard: Pickup deleted successfully');
      }

      setShowModal(false);
      await loadData(); // reload the data with updations
    } catch (err) {
      setError(err.message || 'Operation failed');
      console.error('SchedulerDashboard: CRUD operation failed:', err);
    } finally {
      setSubmitting(false);
      setTableLoading(false); // Hide spinner after CRUD operation
    }
  };

  const filteredPickups = pickups.filter(pickup =>
    pickup.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.zoneId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFrequencyBadgeVariant = (frequency) => {
    switch (frequency) {
      case 'DAILY': return 'success';
      case 'WEEKLY': return 'warning';
      case 'MONTHLY': return 'primary';
      default: return 'secondary';
    }
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.zoneId === zoneId);
    return zone ? zone.zoneName : zoneId;
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.workerId === workerId);
    return worker ? worker.name : workerId;
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    return vehicle ? vehicle.registrationNo : vehicleId;
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'create': return 'Schedule New Pickup';
      case 'edit': return 'Edit Pickup Schedule';
      case 'delete': return 'Cancel Pickup';
      default: return '';
    }
  };

  const { dailyCount, weeklyCount, monthlyCount } = getPickupCountsByFrequency();
  const todaysPickupsCount = getTodaysPickups();

  return (
    <div className={`min-vh-100 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light'}`}>
      <NavbarComponent
        theme={theme}
        toggleTheme={toggleTheme}
        logout={logout}
      />

      <Container fluid className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>Pickup Scheduling</h2>
          <button className="btn btn-success" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-2"></i>
            Schedule Pickup
          </button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <SummaryCards
          theme={theme}
          dailyCount={dailyCount}
          weeklyCount={weeklyCount}
          monthlyCount={monthlyCount}
          todaysPickupsCount={todaysPickupsCount}
        />

        <PickupTable
          theme={theme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredPickups={filteredPickups}
          getFrequencyBadgeVariant={getFrequencyBadgeVariant}
          getZoneName={getZoneName}
          getWorkerName={getWorkerName}
          getVehicleInfo={getVehicleInfo}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          tableLoading={tableLoading}
        />

        <PickupModal
          showModal={showModal}
          setShowModal={setShowModal}
          modalType={modalType}
          getModalTitle={getModalTitle}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          zones={zones}
          vehicles={vehicles}
          workers={workers}
          frequencies={frequencies}
          selectedPickup={selectedPickup}
          submitting={submitting}
          theme={theme}
        />
      </Container>
    </div>
  );
};

export default SchedulerDashboard;


