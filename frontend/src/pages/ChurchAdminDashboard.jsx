import React, { useState } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, StatCard, Table, Button, Modal, Toast } from "../components";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import CreateCounsellorModal from "../features/dashboard/components/CreateCounsellorModal";
import {
  CircleCheckBig,
  CircleHelp,
  Clock3,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  useAssignCounselorMutation,
  useChurchAdminCounselorsQuery,
  useChurchAdminDashboardQuery,
  useChurchAdminMembersQuery,
} from "../api/queries/churchAdmin";

const ChurchAdminDashboard = () => {
  const { user } = useAuth();
  const { id: viewedChurchAdminAccountId } = useParams();
  const navigate = useNavigate();

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

  const dashboardQuery = useChurchAdminDashboardQuery(
    viewedChurchAdminAccountId,
    {
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch dashboard" }),
    },
  );
  const dashboard = dashboardQuery.data?.success
    ? dashboardQuery.data.data
    : null;
  const churchId = dashboard?.church?.id;

  const membersQuery = useChurchAdminMembersQuery(
    churchId,
    {},
    {
      enabled: Boolean(churchId) && activeTab === "members",
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch members" }),
    },
  );

  const counselorsQuery = useChurchAdminCounselorsQuery(
    churchId,
    {},
    {
      enabled:
        Boolean(churchId) && (activeTab === "counselors" || showAssignUser),
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch counselors" }),
    },
  );

  const assignCounselorMutation = useAssignCounselorMutation();

  const members = membersQuery.data?.success
    ? membersQuery.data.data.members || []
    : [];
  const counselors = counselorsQuery.data?.success
    ? counselorsQuery.data.data.counselors || []
    : [];

  const loading =
    dashboardQuery.isLoading ||
    membersQuery.isLoading ||
    counselorsQuery.isLoading ||
    assignCounselorMutation.isPending;

  const handleAssignUser = async (e) => {
    e.preventDefault();
    try {
      const response = await assignCounselorMutation.mutateAsync({
        userAccountId: assignForm.userId,
        counselorAccountId: assignForm.counselorId,
        churchId,
      });
      if (response.success) {
        setToast({ type: "success", message: "User assigned successfully!" });
        setAssignForm({ userId: "", counselorId: "" });
        setShowAssignUser(false);
      }
    } catch {
      setToast({ type: "error", message: "Failed to assign user" });
    }
  };

  const sidebar = (
    <nav className="space-y-2">
      {[
        { id: "overview", label: "Dashboard" },
        { id: "members", label: "Members" },
        { id: "counselors", label: "Counselors" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setSearchParams({ tab: item.id })}
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
    }
  ];
  const recentMemberColumns = [
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
      render: (_, row) => row.assignedCounselor || "Unassigned",
    }
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
    { key: "bio", label: "Bio" },
  ];


  return (
    <DashboardLayout sidebar={sidebar}>
     
      {loading && activeTab === "overview" ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center mb-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        activeTab === "overview" && dashboard && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isHigherRoleViewer
              ? `Viewing Church Admin ${dashboard?.churchAdmin?.name || ""}'s Dashboard`
              : `${dashboard.church?.name} Dashboard`}
          </h1>

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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard
              label="Total Members"
              value={dashboard.stats?.totalMembers || 0}
              icon={<Users className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              label="Verified Members"
              value={dashboard.stats?.verifiedMembers || 0}
              icon={<CircleCheckBig className="w-8 h-8" />}
              color="green"
            />
            <StatCard
              label="Pending"
              value={dashboard.stats?.pendingVerification || 0}
              icon={<Clock3 className="w-8 h-8" />}
              color="yellow"
            />
            <StatCard
              label="Unverified"
              value={dashboard.stats?.unverifiedMembers || 0}
              icon={<CircleHelp className="w-8 h-8" />}
              color="yellow"
            />
            <StatCard
              label="Rejected"
              value={dashboard.stats?.rejectedMembers || 0}
              icon={<XCircle className="w-8 h-8" />}
              color="red"
            />
            <StatCard
              label="Counselors"
              value={dashboard.stats?.totalCounselors || 0}
              icon={<UserCheck className="w-8 h-8" />}
              color="blue"
            />
          </div>

          <Card title="Recent Members" subtitle="Latest members joined">
            <Table
              columns={recentMemberColumns}
              data={dashboard.recentMembers || []}
              loading={loading}
            />
          </Card>
        </div>
      ))}
      

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
                  disabled={row["assignedCounselor"] !== "Unassigned"}
                >
                  {row["assignedCounselor"] !== "Unassigned" ? "Assigned" : "Assign"}
                </Button>
              )}
            />
          </Card>
        </div>
      )}

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
                  onClick={() =>
                    navigate(`/dashboard/counselor/${row.accountId}`)
                  }
                >
                  View Dashboard
                </Button>
              )}
            />
          </Card>
        </div>
      )}

      <CreateCounsellorModal
        onToast={setToast}
        onShowCreateCounselor={() => setShowCreateCounselor(false)}
        showCreateCounselor={showCreateCounselor}
        fetchCounselors={counselorsQuery.refetch}
        churches={dashboard?.church ? [dashboard.church] : []}
      />

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
