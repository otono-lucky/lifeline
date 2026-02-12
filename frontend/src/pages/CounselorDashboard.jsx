import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import {
  Card,
  StatCard,
  Table,
  Button,
  Modal,
  Toast,
  ConfirmModal,
} from "../components";
import { counselorService } from "../api/services";

const CounselorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    status: "verified",
    notes: "",
  });

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboard();
    } else if (activeTab === "users") {
      fetchAssignedUsers();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await counselorService.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedUsers = async () => {
    setLoading(true);
    try {
      const response = await counselorService.getAssignedUsers();
      if (response.success) {
        setAssignedUsers(response.data.users || []);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch assigned users" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await counselorService.verifyUser(
        selectedUser.id,
        verifyForm.status,
        verifyForm.notes,
      );
      if (response.success) {
        setToast({
          type: "success",
          message: `User ${verifyForm.status} successfully!`,
        });
        setVerifyForm({ status: "verified", notes: "" });
        setShowVerifyModal(false);
        fetchAssignedUsers();
        fetchDashboard();
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to verify user" });
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <nav className="space-y-2">
      {[
        { id: "dashboard", label: "📊 Dashboard" },
        { id: "users", label: "👥 Assigned Users" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            activeTab === item.id
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );

  const userColumns = [
    { key: "id", label: "ID", render: (id) => id.substring(0, 8) },
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "verificationStatus", label: "Status" },
    {
      key: "assignedAt",
      label: "Assigned",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700",
      in_progress: "bg-blue-50 text-blue-700",
      verified: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
    };
    return colors[status] || "bg-gray-50 text-gray-700";
  };

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Dashboard View */}
      {activeTab === "dashboard" && dashboard && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Counselor Dashboard
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <StatCard
              label="Total Assigned"
              value={dashboard.stats?.totalAssigned || 0}
              icon="👥"
              color="blue"
            />
            <StatCard
              label="Pending"
              value={dashboard.stats?.pending || 0}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              label="In Progress"
              value={dashboard.stats?.inProgress || 0}
              icon="🔄"
              color="blue"
            />
            <StatCard
              label="Verified"
              value={dashboard.stats?.verified || 0}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Rejected"
              value={dashboard.stats?.rejected || 0}
              icon="❌"
              color="red"
            />
          </div>

          {/* Recent Assigned Users */}
          <Card title="Recent Assigned Users" subtitle="Users assigned to you">
            <Table
              columns={userColumns}
              data={dashboard.assignedUsers || []}
              loading={loading}
            />
          </Card>
        </div>
      )}

      {/* Users Management */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Assigned Users</h1>

          <Card>
            <Table
              columns={userColumns}
              data={assignedUsers}
              loading={loading}
              actions={(row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      setSelectedUser(row);
                      setVerifyForm({ status: "verified", notes: "" });
                      setShowVerifyModal(true);
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedUser(row);
                      setVerifyForm({ status: "rejected", notes: "" });
                      setShowVerifyModal(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* Verify User Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title={`${verifyForm.status === "verified" ? "Verify" : "Reject"} User`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowVerifyModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={verifyForm.status === "verified" ? "success" : "danger"}
              onClick={handleVerifyUser}
              disabled={loading}
            >
              {verifyForm.status === "verified" ? "Verify" : "Reject"}
            </Button>
          </>
        }
      >
        {selectedUser && (
          <form className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              <p className="text-sm text-gray-600 mt-2">
                Status: {selectedUser.verificationStatus}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={verifyForm.status}
                onChange={(e) =>
                  setVerifyForm({ ...verifyForm, status: e.target.value })
                }
              >
                <option value="verified">Verify User</option>
                <option value="rejected">Reject User</option>
              </select>
            </div>

            <textarea
              placeholder="Notes (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={verifyForm.notes}
              onChange={(e) =>
                setVerifyForm({ ...verifyForm, notes: e.target.value })
              }
              rows="3"
            />
          </form>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default CounselorDashboard;
