import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { wasteLogsAPI } from '../../services/api';
import { TrendingUp, Package, Truck, Calendar } from 'lucide-react';

const LogsDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [weeklyCollections, monthlyCollections, weeklyWeight, recentLogsData] = await Promise.all([
        wasteLogsAPI.getWeeklyCollections(),
        wasteLogsAPI.getMonthlyCollections(),
        wasteLogsAPI.getWeeklyWeight(),
        wasteLogsAPI.getRecentLogs({ size: 10 })
      ]);

      setStats({
        weeklyCollections: weeklyCollections.data || 0,
        monthlyCollections: monthlyCollections.data || 0,
        weeklyWeight: weeklyWeight.data || 0
      });

      setRecentLogs(recentLogsData.data?.content || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'This Week', collections: stats.weeklyCollections, weight: stats.weeklyWeight },
    { name: 'This Month', collections: stats.monthlyCollections, weight: stats.weeklyWeight * 4 }
  ];

  const pieData = [
    { name: 'Completed', value: recentLogs.filter(log => log.status === 'Completed').length, color: '#28a745' },
    { name: 'In Progress', value: recentLogs.filter(log => log.status === 'In Progress').length, color: '#ffc107' }
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Dashboard & Analytics</h2>
        <small className="text-muted">Real-time waste collection insights</small>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <Calendar className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{stats.weeklyCollections}</h3>
                <small className="text-muted">Weekly Collections</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <TrendingUp className="text-success" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{stats.monthlyCollections}</h3>
                <small className="text-muted">Monthly Collections</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                <Package className="text-warning" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{stats.weeklyWeight.toFixed(1)} kg</h3>
                <small className="text-muted">Weekly Weight</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                <Truck className="text-info" size={24} />
              </div>
              <div>
                <h3 className="mb-0 fw-bold">{recentLogs.filter(log => log.status === 'In Progress').length}</h3>
                <small className="text-muted">Active Collections</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Collection Trends</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="collections" fill="#28a745" name="Collections" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">Collection Status</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Logs Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <h5 className="mb-0">Recent Collection Activities</h5>
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
                  <tr key={index}>
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
                      }`}>
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
      </Card>
    </div>
  );
};

export default LogsDashboard;

