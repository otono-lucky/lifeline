import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, StatCard, Table, Button, Modal, Toast } from "../components";
import { churchAdminService, churchService } from "../api/services";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import CreateCounsellorModal from "../features/dashboard/components/CreateCounsellorModal";

const ChurchAdminDashboard = () => {
  const { user } = useAuth();
  const { id: viewedChurchAdminAccountId } = useParams();
  const navigate = useNavigate();
  // const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateCounselor, setShowCreateCounselor] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const isHigherRoleViewer =
    Boolean(viewedChurchAdminAccountId) && user?.role !== "ChurchAdmin";

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
  }, [activeTab, viewedChurchAdminAccountId]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await churchAdminService.getDashboard(
        viewedChurchAdminAccountId,
      );
      if (response.success) {
        setDashboard(response.data);
        return response.data;
      }
    } catch {
      setToast({ type: "error", message: "Failed to fetch dashboard" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    let churchId = dashboard?.church?.id;

    if (!churchId) {
      const dashboardData = await fetchDashboard();
      churchId = dashboardData?.church?.id;
    }

    if (!churchId) {
      setToast({ type: "error", message: "Church context not loaded yet" });
      return;
    }

    setLoading(true);
    try {
      const response = await churchService.getChurchMembers(churchId);
      if (response.success) {
        setMembers(response.data.members || []);
      }
    } catch {
      setToast({ type: "error", message: "Failed to fetch members" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    let churchId = dashboard?.church?.id;

    if (!churchId) {
      const dashboardData = await fetchDashboard();
      churchId = dashboardData?.church?.id;
    }

    if (!churchId) {
      setToast({ type: "error", message: "Church context not loaded yet" });
      return;
    }

    setLoading(true);
    try {
      const response = await churchAdminService.getCounselors({ churchId });
      if (response.success) {
        setCounselors(response.data.counselors || []);
      }
    } catch {
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
    } catch {
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
    {
      key: "accountId",
      label: "ID",
      render: (accountId) => accountId?.substring(0, 8),
    },
    { key: "firstName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "verificationStatus", label: "Status" },
    {
      key: "assignedCounselor",
      label: "Assigned To",
      render: (_, row) => row.assignedCounselor?.name || "Unassigned",
    },
  ];

  const counselorColumns = [
    {
      key: "accountId",
      label: "ID",
      render: (accountId) => accountId?.substring(0, 8),
    },
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", label: "Email", render: (_, row) => row.email },
    { key: "yearsExperience", label: "Experience" }
  ];

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Dashboard View */}
      {activeTab === "overview" && dashboard && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isHigherRoleViewer
              ? `Viewing Church Admin Dashboard (${dashboard.church?.name})`
              : `${dashboard.church?.name} Dashboard`}
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
                    setAssignForm({ ...assignForm, userId: row.accountId });
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
              actions={(row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/dashboard/counselor/${row.accountId}`)}
                >
                  View Dashboard
                </Button>
              )}
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
              <option key={member.accountId} value={member.accountId}>
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
              <option key={counselor.accountId} value={counselor.accountId}>
                {counselor.firstName} {counselor.lastName}
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
