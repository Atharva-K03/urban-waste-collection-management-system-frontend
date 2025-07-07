import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Alert, Spinner, Form, Button, ButtonGroup, Pagination } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { wasteLogsAPI } from '../../services/api';
import { TrendingUp, Package, Truck, Calendar } from 'lucide-react';
 
const LogsDashboard = () => {
    // State for overall dashboard summary and recent logs
    const [stats, setStats] = useState({});
    const [recentLogs, setRecentLogs] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [error, setError] = useState('');
 
    // State for managing the view mode (Zone Logs vs. Vehicle Logs)
    const [viewMode, setViewMode] = useState('zone'); // 'zone' or 'vehicle'
 
    // --- State for Zone Report Form Inputs and Data ---
    const [zoneId, setZoneId] = useState('');
    const [zoneStartDate, setZoneStartDate] = useState('');
    const [zoneEndDate, setZoneEndDate] = useState('');
    const [zoneReportData, setZoneReportData] = useState([]);
    const [zoneReportLoading, setZoneReportLoading] = useState(false);
    const [zoneReportError, setZoneReportError] = useState('');
    const [zoneIdValidation, setZoneIdValidation] = useState('');
    const [zoneStartDateValidation, setZoneStartDateValidation] = useState('');
    const [zoneEndDateValidation, setZoneEndDateValidation] = useState('');
    const [zoneReportGenerated, setZoneReportGenerated] = useState(false);
 
    // --- State for Vehicle Report Form Inputs and Data ---
    const [vehicleId, setVehicleId] = useState('');
    const [vehicleStartDate, setVehicleStartDate] = useState('');
    const [vehicleEndDate, setVehicleEndDate] = useState('');
    const [vehicleReportData, setVehicleReportData] = useState([]);
    const [vehicleReportLoading, setVehicleReportLoading] = useState(false);
    const [vehicleReportError, setVehicleReportError] = useState('');
    const [vehicleIdValidation, setVehicleIdValidation] = useState('');
    const [vehicleStartDateValidation, setVehicleStartDateValidation] = useState('');
    const [vehicleEndDateValidation, setVehicleEndDateValidation] = useState('');
    const [vehicleReportGenerated, setVehicleReportGenerated] = useState(false);
 
    // Pagination state for recent logs
    const [recentLogsCurrentPage, setRecentLogsCurrentPage] = useState(0); // 0-indexed for backend
    const [recentLogsTotalPages, setRecentLogsTotalPages] = useState(1);
    const [recentLogsLoading, setRecentLogsLoading] = useState(false);
 
    // Effect to load initial dashboard summary data and first page of recent logs
    useEffect(() => {
        loadDashboardSummary();
        fetchRecentLogsPage(0);
    }, []);
 
    // Helper to clear validation messages for a specific report type
    const clearValidationMessages = (type) => {
        if (type === 'zone') {
            setZoneIdValidation('');
            setZoneStartDateValidation('');
            setZoneEndDateValidation('');
            setZoneReportGenerated(false); // Reset "No data" message
        } else if (type === 'vehicle') {
            setVehicleIdValidation('');
            setVehicleStartDateValidation('');
            setVehicleEndDateValidation('');
            setVehicleReportGenerated(false); // Reset "No data" message
        }
    };
 
    /**
     * Loads the main dashboard summary statistics.
     */
    const loadDashboardSummary = async () => {
        try {
            setLoadingSummary(true);
            const [weeklyCollections, monthlyCollections, weeklyWeight] = await Promise.all([
                wasteLogsAPI.getWeeklyCollections(),
                wasteLogsAPI.getMonthlyCollections(),
                wasteLogsAPI.getWeeklyWeight()
            ]);
 
            setStats({
                weeklyCollections: weeklyCollections.data || 0,
                monthlyCollections: monthlyCollections.data || 0,
                weeklyWeight: weeklyWeight.data || 0
            });
        } catch (err) {
            setError('Failed to load dashboard summary data. Please try again.');
            console.error('Dashboard summary error:', err);
        } finally {
            setLoadingSummary(false);
        }
    };
 
    /**
     * Fetches paginated recent collection logs.
     * @param {number} pageNumber The 0-indexed page number to fetch.
     */
    const fetchRecentLogsPage = async (pageNumber) => {
        setRecentLogsLoading(true);
        setError('');
        try {
            const recentLogsData = await wasteLogsAPI.getRecentLogs({ page: pageNumber, size: 10 });
            setRecentLogs(recentLogsData.data?.content || []);
            setRecentLogsTotalPages(recentLogsData.data?.totalPages || 1);
            setRecentLogsCurrentPage(recentLogsData.data?.number || 0);
        } catch (err) {
            setError('Failed to load recent logs. Please try again.');
            console.error('Recent logs pagination error:', err);
        } finally {
            setRecentLogsLoading(false);
        }
    };
 
    /**
     * Handles page change clicks for recent logs pagination.
     * @param {number} pageNumber The target page number (0-indexed).
     */
    const handleRecentLogsPageChange = (pageNumber) => {
        if (pageNumber !== recentLogsCurrentPage) {
            fetchRecentLogsPage(pageNumber);
        }
    };
 
    /**
     * Fetches zone-specific collection report data based on zoneId and date range.
     * Includes client-side validation.
     * @param {Event} e The form submission event.
     */
    const fetchZoneReport = async (e) => {
        e.preventDefault();
        setZoneReportError('');
        setZoneReportGenerated(false); // Reset report generated flag before validation
 
        // --- Client-side validation ---
        let isValid = true;
        setZoneIdValidation('');
        setZoneStartDateValidation('');
        setZoneEndDateValidation('');
 
        if (!zoneId.trim()) {
            setZoneIdValidation('Please enter Zone ID.');
            isValid = false;
        }
        if (!zoneStartDate) {
            setZoneStartDateValidation('Please select a start date.');
            isValid = false;
        }
        if (!zoneEndDate) {
            setZoneEndDateValidation('Please select an end date.');
            isValid = false;
        }
        if (zoneStartDate && zoneEndDate && new Date(zoneEndDate) < new Date(zoneStartDate)) {
            setZoneEndDateValidation('End date cannot be before start date.');
            isValid = false;
        }
 
        if (!isValid) {
            setZoneReportData([]); // Clear previous data
            return; // Stop if validation fails
        }
        // --- End validation ---
 
        setZoneReportLoading(true);
        try {
            const response = await wasteLogsAPI.getZoneReport({ zoneId, startDate: zoneStartDate, endDate: zoneEndDate });
            const transformedData = response.data?.content.map(item => ({
                date: item.date,
                collections: item.totalNumberOfCollections,
                weight: item.totalWeightCollectedKg
            })) || [];
            setZoneReportData(transformedData);
            setZoneReportGenerated(true); // Set true only on successful (even if empty) API response
        } catch (err) {
            setZoneReportError('Failed to load zone report. Please verify Zone ID and date range.');
            console.error('Zone report error:', err);
            setZoneReportGenerated(false); // Keep false if there's an error
        } finally {
            setZoneReportLoading(false);
        }
    };
 
    /**
     * Fetches vehicle-specific collection report data based on vehicleId and date range.
     * Includes client-side validation.
     * @param {Event} e The form submission event.
     */
    const fetchVehicleReport = async (e) => {
        e.preventDefault();
        setVehicleReportError('');
        setVehicleReportGenerated(false); // Reset report generated flag before validation
 
        // --- Client-side validation ---
        let isValid = true;
        setVehicleIdValidation('');
        setVehicleStartDateValidation('');
        setVehicleEndDateValidation('');
 
        if (!vehicleId.trim()) {
            setVehicleIdValidation('Please enter Vehicle ID.');
            isValid = false;
        }
        if (!vehicleStartDate) {
            setVehicleStartDateValidation('Please select a start date.');
            isValid = false;
        }
        if (!vehicleEndDate) {
            setVehicleEndDateValidation('Please select an end date.');
            isValid = false;
        }
        if (vehicleStartDate && vehicleEndDate && new Date(vehicleEndDate) < new Date(vehicleStartDate)) {
            setVehicleEndDateValidation('End date cannot be before start date.');
            isValid = false;
        }
 
        if (!isValid) {
            setVehicleReportData([]); // Clear previous data
            return; // Stop if validation fails
        }
        // --- End validation ---
 
        setVehicleReportLoading(true);
        try {
            const response = await wasteLogsAPI.getVehicleReport({ vehicleId, startDate: vehicleStartDate, endDate: vehicleEndDate });
            const transformedData = response.data?.content.map(item => ({
                date: item.collectionDate,
                weight: item.weightCollected
            })) || [];
            setVehicleReportData(transformedData);
            setVehicleReportGenerated(true); // Set true only on successful (even if empty) API response
        } catch (err) {
            setVehicleReportError('Failed to load vehicle report. Please verify Vehicle ID and date range.');
            console.error('Vehicle report error:', err);
            setVehicleReportGenerated(false); // Keep false if there's an error
        } finally {
            setVehicleReportLoading(false);
        }
    };
 
    // Display a loading spinner while initial dashboard data is being fetched
    if (loadingSummary) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading dashboard...</p>
            </div>
        );
    }
 
    return (
        <div className="container-fluid py-4">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Dashboard & Analytics</h2>
                <small className="text-muted">Real-time waste collection insights</small>
            </div>
 
            {/* Global Error Alert */}
            {error && (
                <Alert variant="danger" className="mb-4 shadow-sm">
                    {error}
                </Alert>
            )}
 
            {/* Summary Cards */}
            <Row className="mb-4 g-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-primary border-4">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                <Calendar className="text-primary" size={28} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold text-dark">{stats.weeklyCollections}</h3>
                                <small className="text-muted">Weekly Collections</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
 
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-success border-4">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                <TrendingUp className="text-success" size={28} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold text-dark">{stats.monthlyCollections}</h3>
                                <small className="text-muted">Monthly Collections</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
 
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-warning border-4">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                <Package className="text-warning" size={28} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold text-dark">
                                    {typeof stats.weeklyWeight === 'number' ? stats.weeklyWeight.toFixed(1) : 'N/A'} kg
                                </h3>
                                <small className="text-muted">Weekly Weight</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
 
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 rounded-3 border-start border-info border-4">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                <Truck className="text-info" size={28} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold text-dark">{recentLogs.filter(log => log.status === 'In Progress').length}</h3>
                                <small className="text-muted">Active Collections</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
  {/* Toggle Button for Report View */}
  <div className="mb-4 d-flex justify-content-center">
                <ButtonGroup className="rounded-pill shadow-sm">
                    <Button
                        variant={viewMode === 'zone' ? 'primary' : 'outline-primary'}
                        onClick={() => {
                            setViewMode('zone');
                            // Only clear validation messages, not form data or charts
                            clearValidationMessages('zone');
                            clearValidationMessages('vehicle'); // Clear vehicle validation too, in case admin switches back
                            setVehicleId(''); // Clear vehicle ID when switching to zone
                        }}
                        className="rounded-pill px-4 py-2 fw-semibold"
                        style={{ minWidth: '150px' }}
                    >
                        Zone Logs
                    </Button>
                    <Button
                        variant={viewMode === 'vehicle' ? 'primary' : 'outline-primary'}
                        onClick={() => {
                            setViewMode('vehicle');
                            // Only clear validation messages, not form data or charts
                            clearValidationMessages('vehicle');
                            clearValidationMessages('zone'); // Clear zone validation too, in case admin switches back
                            setZoneId(''); // Clear zone ID when switching to vehicle
                        }}
                        className="rounded-pill px-4 py-2 fw-semibold"
                        style={{ minWidth: '150px' }}
                    >
                        Vehicle Logs
                    </Button>
                </ButtonGroup>
            </div>
 
            {/* Conditional Forms and Charts based on viewMode */}
            {viewMode === 'zone' ? (
                // Zone Logs Section
                <Row className="mb-4">
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm rounded-3">
                            <Card.Header className="bg-white border-bottom pt-4 px-4">
                                <h5 className="mb-0 fw-bold text-dark">Zone Collection Report</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {/* Zone Report Form */}
                                <Form onSubmit={fetchZoneReport} className="mb-4">
                                    <Row className="align-items-end g-3">
                                        <Col md={4}>
                                            <Form.Group controlId="zoneId">
                                                <Form.Label className="fw-semibold text-muted">Zone ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="e.g., Z001"
                                                    value={zoneId}
                                                    onChange={(e) => {
                                                        setZoneId(e.target.value);
                                                        setZoneIdValidation('');
                                                        setZoneReportGenerated(false); // Hide "No data" message on input change
                                                    }}
                                                    className={`rounded-3 ${zoneIdValidation ? 'is-invalid' : ''}`}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {zoneIdValidation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group controlId="zoneStartDate">
                                                <Form.Label className="fw-semibold text-muted">Start Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={zoneStartDate}
                                                    onChange={(e) => {
                                                        setZoneStartDate(e.target.value);
                                                        setZoneStartDateValidation('');
                                                        setZoneEndDateValidation(''); // Clear end date validation too as start changes
                                                        setZoneReportGenerated(false); // Hide "No data" message on input change
                                                    }}
                                                    className={`rounded-3 ${zoneStartDateValidation ? 'is-invalid' : ''}`}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {zoneStartDateValidation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group controlId="zoneEndDate">
                                                <Form.Label className="fw-semibold text-muted">End Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={zoneEndDate}
                                                    onChange={(e) => {
                                                        setZoneEndDate(e.target.value);
                                                        setZoneEndDateValidation('');
                                                        setZoneReportGenerated(false); // Hide "No data" message on input change
                                                    }}
                                                    className={`rounded-3 ${zoneEndDateValidation ? 'is-invalid' : ''}`}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {zoneEndDateValidation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="w-100 rounded-3 fw-bold"
                                                disabled={zoneReportLoading}
                                            >
                                                {zoneReportLoading ? (
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                ) : (
                                                    'Generate Report 📊'
                                                )}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
 
                                {/* Zone Report Error Alert */}
                                {zoneReportError && (
                                    <Alert variant="danger" className="mt-3 shadow-sm text-center">
                                        {zoneReportError}
                                    </Alert>
                                )}
 
                                {/* Zone Report Charts */}
                                {zoneReportData.length > 0 ? (
                                    <>
                                        <h6 className="mt-5 mb-3 text-center text-primary fw-bold">Number of Collections per Day (Zone: {zoneId})</h6>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={zoneReportData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }} isAnimationActive={true}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} label={{ value: 'Collections', angle: -90, position: 'insideLeft', fill: '#666' }} />
                                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                <Bar dataKey="collections" fill="#6A0572" name="Collections" barSize={30} maxBarSize={50} radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
 
                                        <h6 className="mt-5 mb-3 text-center text-warning fw-bold">Total Weight Collected per Day (Zone: {zoneId})</h6>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={zoneReportData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }} isAnimationActive={true}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                                <YAxis tickLine={false} axisLine={false} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: '#666' }} />
                                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']} />
                                                <Bar dataKey="weight" fill="#FFC300" name="Weight" barSize={30} maxBarSize={50} radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </>
                                ) : (
                                    // "No data found" message is displayed ONLY IF a report was generated and it's empty
                                    zoneReportGenerated && zoneReportData.length === 0 && !zoneReportLoading && !zoneReportError && (
                                        <Alert variant="info" className="mt-3 text-center shadow-sm">
                                            No collection data found for Zone ID "{zoneId}" in the selected date range.
                                        </Alert>
                                    )
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                // Vehicle Logs Section
                <Row className="mb-4">
                    <Col lg={12}>
                        <Card className="border-0 shadow-sm rounded-3">
                            <Card.Header className="bg-white border-bottom pt-4 px-4">
                                <h5 className="mb-0 fw-bold text-dark">Vehicle Collection Report</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {/* Vehicle Report Form */}
                                <Form onSubmit={fetchVehicleReport} className="mb-4">
                                    <Row className="align-items-end g-3">
                                        <Col md={4}>
                                            <Form.Group controlId="vehicleId">
                                                <Form.Label className="fw-semibold text-muted">Vehicle ID</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="e.g., RT001"
                                                    value={vehicleId}
                                                    onChange={(e) => {
                                                        setVehicleId(e.target.value);
                                                        setVehicleIdValidation('');
                                                        setVehicleReportGenerated(false); // Hide "No data" message on input change
                                                    }}
                                                    className={`rounded-3 ${vehicleIdValidation ? 'is-invalid' : ''}`}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {vehicleIdValidation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group controlId="vehicleStartDate">
                                                <Form.Label className="fw-semibold text-muted">Start Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={vehicleStartDate}
                                                    onChange={(e) => {
                                                        setVehicleStartDate(e.target.value);
                                                        setVehicleStartDateValidation('');
                                                        setVehicleEndDateValidation(''); // Clear end date validation too as start changes
                                                        setVehicleReportGenerated(false); // Hide "No data" message on input change
                                                    }}
                                                    className={`rounded-3 ${vehicleStartDateValidation ? 'is-invalid' : ''}`}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {vehicleStartDateValidation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group controlId="vehicleEndDate">
                                                <Form.Label className="fw-semibold text-muted">End Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={vehicleEndDate}
                                                    onChange={(e) => {
                                                        setVehicleEndDate(e.target.value);
                                                        setVehicleEndDateValidation('');
                                                        setVehicleReportGenerated(false); // Hide "No data" message on input change
                                                    }}
                                                    className={`rounded-3 ${vehicleEndDateValidation ? 'is-invalid' : ''}`}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {vehicleEndDateValidation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="w-100 rounded-3 fw-bold"
                                                disabled={vehicleReportLoading}
                                            >
                                                {vehicleReportLoading ? (
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                ) : (
                                                    'Generate Report 🚚'
                                                )}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
 
                                {/* Vehicle Report Error Alert */}
                                {vehicleReportError && (
                                    <Alert variant="danger" className="mt-3 shadow-sm text-center">
                                        {vehicleReportError}
                                    </Alert>
                                )}
 
                                {/* Vehicle Report Chart */}
                                {vehicleReportData.length > 0 ? (
                                    <>
                                        <h6 className="mt-5 mb-3 text-center text-info fw-bold">Weight Collected by Vehicle ({vehicleId}) per Day</h6>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={vehicleReportData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }} isAnimationActive={true}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                                <YAxis tickLine={false} axisLine={false} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: '#666' }} />
                                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']} />
                                                <Bar dataKey="weight" fill="#007bff" name="Weight" barSize={30} maxBarSize={50} radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </>
                                ) : (
                                    // "No data found" message is displayed ONLY IF a report was generated and it's empty
                                    vehicleReportGenerated && vehicleReportData.length === 0 && !vehicleReportLoading && !vehicleReportError && (
                                        <Alert variant="info" className="mt-3 text-center shadow-sm">
                                            No collection data found for Vehicle ID "{vehicleId}" in the selected date range.
                                        </Alert>
                                    )
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
 
            ---
 
            ## Recent Collection Activities
 
            <Card className="border-0 shadow-sm rounded-3 mt-4">
                <Card.Header className="bg-white border-bottom pt-4 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-dark">Recent Collection Activities</h5>
                    {recentLogsLoading && <Spinner animation="border" size="sm" variant="primary" />}
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Zone ID</th>
                                <th>Vehicle ID</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Weight (kg)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLogs.length > 0 ? (
                                recentLogs.map((log, index) => (
                                    <tr key={log.logId || index}>
                                        <td className="fw-semibold">{log.zoneId}</td>
                                        <td>{log.vehicleId}</td>
                                        <td>{new Date(log.collectionStartTime).toLocaleString()}</td>
                                        <td>
                                            {log.collectionEndTime
                                                ? new Date(log.collectionEndTime).toLocaleString()
                                                : '-'
                                            }
                                        </td>
                                        <td>{log.weightCollected || '-'}</td>
                                        <td>
                                            <span className={`badge ${
                                                log.status === 'Completed' ? 'bg-success' : 'bg-warning'
                                            } rounded-pill px-2 py-1`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No recent collection activities found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
                {/* Pagination Controls */}
                {recentLogsTotalPages > 1 && (
                    <Card.Footer className="d-flex justify-content-center bg-white border-top py-3">
                        <Pagination className="mb-0">
                            <Pagination.Prev onClick={() => handleRecentLogsPageChange(recentLogsCurrentPage - 1)} disabled={recentLogsCurrentPage === 0 || recentLogsLoading} />
                            {[...Array(recentLogsTotalPages)].map((_, index) => (
                                <Pagination.Item
                                    key={index}
                                    active={index === recentLogsCurrentPage}
                                    onClick={() => handleRecentLogsPageChange(index)}
                                    disabled={recentLogsLoading}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => handleRecentLogsPageChange(recentLogsCurrentPage + 1)} disabled={recentLogsCurrentPage === recentLogsTotalPages - 1 || recentLogsLoading} />
                        </Pagination>
                    </Card.Footer>
                )}
            </Card>
        </div>
    );
};
 
export default LogsDashboard;
 

