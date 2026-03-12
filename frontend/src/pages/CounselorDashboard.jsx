import React, { useState } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import {
  Card,
  StatCard,
  Table,
  Button,
  Modal,
  Toast,
  ActionMenu,
} from "../components";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  CircleCheckBig,
  Clock3,
  RefreshCcw,
  Users,
  XCircle,
} from "lucide-react";
import {
  useCounselorAssignedUsersQuery,
  useCounselorDashboardQuery,
  useVerifyCounselorUserMutation,
} from "../api/queries/counselor";
import {
  useCreateManualMatchMutation,
  useMatchesQuery,
} from "../api/queries/matching";

const CounselorDashboard = () => {
  const { user } = useAuth();
  const { id: viewedCounselorAccountId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    status: "verified",
    notes: "",
  });
  const [matchForm, setMatchForm] = useState({
    primaryAccountId: "",
    counterpartAccountId: "",
  });

  const isHigherRoleViewer =
    Boolean(viewedCounselorAccountId) && user?.role !== "Counselor";

  const dashboardQuery = useCounselorDashboardQuery(viewedCounselorAccountId, {
    enabled: activeTab === "dashboard",
    staleTime: 1000 * 60 * 2,
    onError: () =>
      setToast({ type: "error", message: "Failed to fetch dashboard" }),
  });

  const assignedUsersQuery = useCounselorAssignedUsersQuery(
    viewedCounselorAccountId,
    {},
    {
      enabled: activeTab === "users" || showCreateMatch,
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch assigned users" }),
    },
  );

  const matchOwnerAccountId = viewedCounselorAccountId || user?.id;
  const matchesQuery = useMatchesQuery(
    { createdBy: matchOwnerAccountId, limit: 10 },
    {
      enabled: activeTab === "matches" && Boolean(matchOwnerAccountId),
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch matches" }),
    },
  );

  const verifyUserMutation = useVerifyCounselorUserMutation();
  const createMatchMutation = useCreateManualMatchMutation();

  const dashboard = dashboardQuery.data?.success ? dashboardQuery.data.data : null;
  const assignedUsers = assignedUsersQuery.data?.success
    ? assignedUsersQuery.data.data.users || []
    : [];
  const matches = matchesQuery.data?.success
    ? matchesQuery.data.data.matches || []
    : [];
  const matchesPagination = matchesQuery.data?.success
    ? matchesQuery.data.pagination
    : null;

  const overviewLoading = dashboardQuery.isLoading || dashboardQuery.isFetching;
  const usersLoading = assignedUsersQuery.isLoading || assignedUsersQuery.isFetching;
  const matchesLoading = matchesQuery.isLoading || matchesQuery.isFetching;
  const mutationLoading = verifyUserMutation.isPending;

  const handleVerifyUser = async (e) => {
    e.preventDefault();

    if (!selectedUser?.accountId) {
      setToast({ type: "error", message: "Missing user accountId" });
      return;
    }

    try {
      const response = await verifyUserMutation.mutateAsync({
        userAccountId: selectedUser.accountId,
        status: verifyForm.status,
        notes: verifyForm.notes,
        viewedCounselorAccountId,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: `User ${verifyForm.status} successfully!`,
        });
        setVerifyForm({ status: "verified", notes: "" });
        setShowVerifyModal(false);
      }
    } catch {
      setToast({ type: "error", message: "Failed to verify user" });
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      const response = await createMatchMutation.mutateAsync({
        accountIdA: matchForm.primaryAccountId,
        accountIdB: matchForm.counterpartAccountId,
      });
      if (response.success) {
        setToast({ type: "success", message: "Match created successfully!" });
        setMatchForm({ primaryAccountId: "", counterpartAccountId: "" });
        setShowCreateMatch(false);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to create match",
      });
    }
  };

  const openMatchModal = (prefill = {}) => {
    setMatchForm({
      primaryAccountId: "",
      counterpartAccountId: "",
      ...prefill,
    });
    setShowCreateMatch(true);
  };

  const sidebar = (
    <nav className="space-y-2">
      {[
        { id: "dashboard", label: "Dashboard" },
        { id: "users", label: "Assigned Users" },
        { id: "matches", label: "Matches" },
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
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "verificationStatus", label: "Status" },
    {
      key: "assignedAt",
      label: "Assigned",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const matchColumns = [
    {
      key: "id",
      label: "Match ID",
      render: (id) => id?.substring(0, 8),
    },
    { key: "status", label: "Status" },
    {
      key: "createdAt",
      label: "Created",
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      key: "participants",
      label: "Participants",
      render: (participants = []) =>
        participants
          .map((p) => `${p.firstName} ${p.lastName}`)
          .join(" & "),
    },
  ];

  return (
    <DashboardLayout sidebar={sidebar}>
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isHigherRoleViewer
              ? `Viewing Counselor ${dashboard?.counselor?.name || ""}'s Dashboard`
              : "Counselor Dashboard"}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-6">
            <StatCard
              label="Total Assigned"
              value={dashboard?.stats?.totalAssigned || 0}
              icon={<Users className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              label="Pending"
              value={dashboard?.stats?.pending || 0}
              icon={<Clock3 className="w-8 h-8" />}
              color="yellow"
            />
            <StatCard
              label="In Progress"
              value={dashboard?.stats?.inProgress || 0}
              icon={<RefreshCcw className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              label="Verified"
              value={dashboard?.stats?.verified || 0}
              icon={<CircleCheckBig className="w-8 h-8" />}
              color="green"
            />
            <StatCard
              label="Rejected"
              value={dashboard?.stats?.rejected || 0}
              icon={<XCircle className="w-8 h-8" />}
              color="red"
            />
            <StatCard
              label="Total Matches"
              value={dashboard?.stats?.totalMatches || 0}
              icon={<Users className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              label="Active Matches"
              value={dashboard?.stats?.activeMatches || 0}
              icon={<Users className="w-8 h-8" />}
              color="green"
            />
          </div>

          <Card title="Recent Assigned Users" subtitle="Users assigned to you">
            <Table
              columns={userColumns}
              data={dashboard?.assignedUsers || []}
              loading={overviewLoading}
            />
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Assigned Users</h1>

          <Card>
            <Table
              columns={userColumns}
              data={assignedUsers}
              loading={usersLoading}
              actions={(row) => (
                <ActionMenu
                  items={[
                    {
                      label: "View Details",
                      onClick: () =>
                        navigate(`/dashboard/user/${row.accountId}`),
                    },
                    {
                      label: "Verify",
                      onClick: () => {
                        setSelectedUser(row);
                        setVerifyForm({ status: "verified", notes: "" });
                        setShowVerifyModal(true);
                      },
                    },
                    {
                      label: "Reject",
                      variant: "danger",
                      onClick: () => {
                        setSelectedUser(row);
                        setVerifyForm({ status: "rejected", notes: "" });
                        setShowVerifyModal(true);
                      },
                    },
                    {
                      label: "Create Match",
                      onClick: () =>
                        openMatchModal({ primaryAccountId: row.accountId }),
                    },
                  ]}
                />
              )}
            />
          </Card>
        </div>
      )}

      {activeTab === "matches" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
            <Button onClick={() => setShowCreateMatch(true)}>
              Create Match
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Matches"
              value={matchesPagination?.total || 0}
              icon={<Users className="w-8 h-8" />}
              color="blue"
            />
          </div>
          <Card title="Recent Matches" subtitle="Matches created by counselor">
            <Table
              columns={matchColumns}
              data={matches}
              loading={matchesLoading}
            />
          </Card>
        </div>
      )}

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
              disabled={mutationLoading}
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

      <Modal
        isOpen={showCreateMatch}
        onClose={() => setShowCreateMatch(false)}
        title="Create Match"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCreateMatch(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMatch}
              disabled={
                createMatchMutation.isPending ||
                !matchForm.primaryAccountId ||
                !matchForm.counterpartAccountId
              }
            >
              Create Match
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={matchForm.primaryAccountId}
            onChange={(e) =>
              setMatchForm({
                ...matchForm,
                primaryAccountId: e.target.value,
                counterpartAccountId: "",
              })
            }
            required
          >
            <option value="">Select Primary User</option>
            {assignedUsers.map((u) => (
              <option key={u.accountId} value={u.accountId}>
                {u.firstName} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={matchForm.counterpartAccountId}
            onChange={(e) =>
              setMatchForm({
                ...matchForm,
                counterpartAccountId: e.target.value,
              })
            }
            required
            disabled={!matchForm.primaryAccountId}
          >
            <option value="">
              {matchForm.primaryAccountId
                ? "Select Opposite Gender"
                : "Select primary user first"}
            </option>
            {assignedUsers
              .filter((u) => {
                if (!matchForm.primaryAccountId) return false;
                const primary = assignedUsers.find(
                  (user) => user.accountId === matchForm.primaryAccountId,
                );
                if (!primary?.gender || !u.gender) return false;
                return u.gender !== primary.gender;
              })
              .map((u) => (
                <option key={u.accountId} value={u.accountId}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
          </select>
          {matchForm.primaryAccountId &&
            !assignedUsers.find((u) => u.accountId === matchForm.primaryAccountId)
              ?.gender && (
              <p className="text-sm text-red-600">
                Selected user has no gender on record. Update their profile first.
              </p>
            )}
        </form>
      </Modal>

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
