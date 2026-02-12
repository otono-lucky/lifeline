import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, StatCard, Table, Button, Modal, Toast } from "../components";
import { churchAdminService } from "../api/services";
import { useSearchParams } from "react-router-dom";
import CreateCounsellorModal from "../features/dashboard/components/CreateCounsellorModal";

const ChurchAdminDashboard = () => {
  // const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateCounselor, setShowCreateCounselor] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [assignForm, setAssignForm] = useState({
    userId: "",
    counselorId: "",
  });

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboard();
    } else if (activeTab === "members") {
      fetchMembers();
    } else if (activeTab === "counselors") {
      fetchCounselors();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await churchAdminService.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await churchAdminService.getMembers();
      if (response.success) {
        setMembers(response.data.members || []);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch members" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const response = await churchAdminService.getCounselors();
      if (response.success) {
        setCounselors(response.data.counselors || []);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch counselors" });
    } finally {
      setLoading(false);
    }
  };


  const handleAssignUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await churchAdminService.assignCounselor(
        assignForm.userId,
        assignForm.counselorId,
      );
      if (response.success) {
        setToast({ type: "success", message: "User assigned successfully!" });
        setAssignForm({ userId: "", counselorId: "" });
        setShowAssignUser(false);
        fetchMembers();
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to assign user" });
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <nav className="space-y-2">
      {[
        { id: "overview", label: "📊 Dashboard" },
        { id: "members", label: "👥 Members" },
        { id: "counselors", label: "🤝 Counselors" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setSearchParams({tab:item.id})}
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

  const memberColumns = [
    { key: "id", label: "ID", render: (id) => id.substring(0, 8) },
    { key: "firstName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "verificationStatus", label: "Status" },
    {
      key: "assignedCounselor",
      label: "Assigned To",
      render: (_, row) =>
        row.assignedCounselor?.id
          ? `${row.assignedCounselor.account?.firstName} ${row.assignedCounselor.account?.lastName}`
          : "Unassigned",
    },
  ];

  const counselorColumns = [
    { key: "id", label: "ID", render: (id) => id.substring(0, 8) },
    {
      key: "account",
      label: "Name",
      render: (_, row) => `${row.account?.firstName} ${row.account?.lastName}`,
    },
    { key: "email", label: "Email", render: (_, row) => row.account?.email },
    { key: "yearsExperience", label: "Experience" },
    { key: "bio", label: "Bio" },
  ];

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Dashboard View */}
      {activeTab === "overview" && dashboard && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {dashboard.church?.name} Dashboard
          </h1>

          {/* Church Info */}
          <Card title="Church Information">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-semibold">{dashboard.church?.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">{dashboard.church?.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-semibold">{dashboard.church?.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold">{dashboard.church?.status}</p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Members"
              value={dashboard.stats?.totalMembers || 0}
              icon="👥"
              color="blue"
            />
            <StatCard
              label="Verified Members"
              value={dashboard.stats?.verifiedMembers || 0}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Pending Verification"
              value={dashboard.stats?.pendingVerification || 0}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              label="Total Counselors"
              value={dashboard.stats?.totalCounselors || 0}
              icon="🤝"
              color="blue"
            />
          </div>

          {/* Recent Members */}
          <Card title="Recent Members" subtitle="Latest members joined">
            <Table
              columns={memberColumns}
              data={dashboard.recentMembers || []}
              loading={loading}
            />
          </Card>
        </div>
      )}

      {/* Members Management */}
      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <Button onClick={() => setShowAssignUser(true)}>
              Assign to Counselor
            </Button>
          </div>

          <Card>
            <Table
              columns={memberColumns}
              data={members}
              loading={loading}
              actions={(row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(row.id);
                    setAssignForm({ ...assignForm, userId: row.id });
                    setShowAssignUser(true);
                  }}
                >
                  Assign
                </Button>
              )}
            />
          </Card>
        </div>
      )}

      {/* Counselors Management */}
      {activeTab === "counselors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Counselors</h1>
            <Button onClick={() => setShowCreateCounselor(true)}>
              Create Counselor
            </Button>
          </div>

          <Card>
            <Table
              columns={counselorColumns}
              data={counselors}
              loading={loading}
            />
          </Card>
        </div>
      )}

      {/* Create Counselor Modal */}
      <CreateCounsellorModal
        onToast={setToast}
        onShowCreateCounselor={() => setShowCreateCounselor(false)}
        showCreateCounselor={showCreateCounselor}
        fetchCounselors={fetchCounselors}
        churches={dashboard?.church ? [dashboard.church] : []}
      />

      {/* Assign User Modal */}
      <Modal
        isOpen={showAssignUser}
        onClose={() => setShowAssignUser(false)}
        title="Assign User to Counselor"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowAssignUser(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignUser} disabled={loading}>
              Assign
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={assignForm.userId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, userId: e.target.value })
            }
            required
          >
            <option value="">Select Member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName} ({member.email})
              </option>
            ))}
          </select>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={assignForm.counselorId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, counselorId: e.target.value })
            }
            required
          >
            <option value="">Select Counselor</option>
            {counselors.map((counselor) => (
              <option key={counselor.id} value={counselor.id}>
                {counselor.account?.firstName} {counselor.account?.lastName}
              </option>
            ))}
          </select>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast?.message || "Success!"}
          type={toast?.type || "success"}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ChurchAdminDashboard;
