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
  HeartCrack,
} from "lucide-react";
import {
  useCounselorAssignedUsersQuery,
  useCounselorDashboardQuery,
  useVerifyCounselorUserMutation,
  useDebriefResetMutation,
} from "../api/queries/counselor";
import {
  useCreateManualMatchMutation,
  useMatchesQuery,
} from "../api/queries/matching";

const renderVettingStatusBadge = (status) => {
  switch (status) {
    case "VETTED_ACTIVE":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
          Vetted / Active
        </span>
      );
    case "PENDING_VETTING":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Pending Vetting
        </span>
      );
    case "DEBRIEF_REQUIRED":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
          Debrief Required
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
          Rejected
        </span>
      );
    case "HARD_BLOCKED":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900 text-white">
          Blocked
        </span>
      );
    case "DRAFT":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
          Draft
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          {status || "Unknown"}
        </span>
      );
  }
};

const CounselorDashboard = () => {
  const { user } = useAuth();
  const { id: viewedCounselorAccountId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  const [verifyForm, setVerifyForm] = useState({
    decision: "APPROVE",
    notes: "",
    reason: "",
  });

  const [debriefForm, setDebriefForm] = useState({
    notes: "",
    readinessScore: 10,
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
  const debriefResetMutation = useDebriefResetMutation();
  const createMatchMutation = useCreateManualMatchMutation();

  const dashboard = dashboardQuery.data?.success
    ? dashboardQuery.data.data
    : null;
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
  const usersLoading =
    assignedUsersQuery.isLoading || assignedUsersQuery.isFetching;
  const matchesLoading = matchesQuery.isLoading || matchesQuery.isFetching;
  const mutationLoading =
    verifyUserMutation.isPending || debriefResetMutation.isPending;

  const handleVerifyUser = async (e) => {
    e.preventDefault();

    if (!selectedUser?.accountId) {
      setToast({ type: "error", message: "Missing user accountId" });
      return;
    }

    if (
      (verifyForm.decision === "REJECT" || verifyForm.decision === "HARD_BLOCK") &&
      !verifyForm.notes &&
      !verifyForm.reason
    ) {
      setToast({
        type: "error",
        message: "A reason or notes must be provided when rejecting or blocking",
      });
      return;
    }

    try {
      const response = await verifyUserMutation.mutateAsync({
        userAccountId: selectedUser.accountId,
        decision: verifyForm.decision,
        notes: verifyForm.notes,
        reason: verifyForm.reason || verifyForm.notes,
        viewedCounselorAccountId,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: `User vetting ${verifyForm.decision.toLowerCase()}d successfully!`,
        });
        setVerifyForm({ decision: "APPROVE", notes: "", reason: "" });
        setShowVerifyModal(false);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to process vetting review",
      });
    }
  };

  const handleDebriefReset = async (e) => {
    e.preventDefault();

    if (!selectedUser?.accountId) {
      setToast({ type: "error", message: "Missing user accountId" });
      return;
    }

    if (!debriefForm.notes) {
      setToast({ type: "error", message: "Debrief reflection notes are required" });
      return;
    }

    try {
      const response = await debriefResetMutation.mutateAsync({
        userAccountId: selectedUser.accountId,
        notes: debriefForm.notes,
        readinessScore: Number(debriefForm.readinessScore),
      });

      if (response.success) {
        setToast({
          type: "success",
          message: "User exit debrief completed! Restored to active discovery.",
        });
        setDebriefForm({ notes: "", readinessScore: 10 });
        setShowDebriefModal(false);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to complete debrief reset",
      });
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
      key: "profilePictureUrl",
      label: "Image",
      render: (_, row) => {
        const imgUrl = row.photoUrl || row.profilePictureUrl;
        return imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-white bg-gray-500 text-xs font-bold">
            {row.firstName?.[0]}
            {row.lastName?.[0]}
          </div>
        );
      },
    },
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    {
      key: "age",
      label: "Age",
      render: (_, row) => (row.age ? row.age : "N/A"),
    },
    {
      key: "vettingStatus",
      label: "Status",
      render: (status, row) =>
        renderVettingStatusBadge(status || row.verificationStatus),
    },
    {
      key: "assignedAt",
      label: "Assigned",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
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
      render: (value) => (value ? new Date(value).toLocaleDateString() : "N/A"),
    },
    {
      key: "participants",
      label: "Participants",
      render: (participants = []) =>
        participants.map((p) => `${p.firstName} ${p.lastName}`).join(" & "),
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

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-6">
            <StatCard
              label="Total Assigned"
              value={dashboard?.stats?.totalAssigned || 0}
              icon={<Users className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              label="Pending Vetting"
              value={dashboard?.stats?.pendingVetting || 0}
              icon={<Clock3 className="w-8 h-8" />}
              color="yellow"
            />
            <StatCard
              label="Debrief Required"
              value={dashboard?.stats?.debriefRequired || 0}
              icon={<HeartCrack className="w-8 h-8" />}
              color="purple"
            />
            <StatCard
              label="Verified Active"
              value={dashboard?.stats?.verifiedActive || 0}
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
              actions={(row) => {
                const items = [
                  {
                    label: "View Details",
                    onClick: () =>
                      navigate(`/dashboard/user/${row.accountId}`),
                  },
                  {
                    label: "Review Vetting",
                    onClick: () => {
                      setSelectedUser(row);
                      setVerifyForm({
                        decision: "APPROVE",
                        notes: "",
                        reason: "",
                      });
                      setShowVerifyModal(true);
                    },
                  },
                ];

                if (row.vettingStatus === "DEBRIEF_REQUIRED") {
                  items.push({
                    label: "Exit Debrief & Reset",
                    onClick: () => {
                      setSelectedUser(row);
                      setDebriefForm({ notes: "", readinessScore: 10 });
                      setShowDebriefModal(true);
                    },
                  });
                }

                items.push({
                  label: "Create Match",
                  onClick: () =>
                    openMatchModal({ primaryAccountId: row.accountId }),
                });

                return <ActionMenu items={items} />;
              }}
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

      {/* Vetting Review Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Counselor Vetting Review"
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
              variant={
                verifyForm.decision === "APPROVE"
                  ? "success"
                  : verifyForm.decision === "REJECT"
                  ? "danger"
                  : "danger"
              }
              onClick={handleVerifyUser}
              disabled={mutationLoading}
            >
              {verifyForm.decision === "APPROVE"
                ? "Approve & Activate"
                : verifyForm.decision === "REJECT"
                ? "Reject Profile"
                : "Hard Block"}
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
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Current Status:</span>
                {renderVettingStatusBadge(selectedUser.vettingStatus)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vetting Decision
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={verifyForm.decision}
                onChange={(e) =>
                  setVerifyForm({ ...verifyForm, decision: e.target.value })
                }
              >
                <option value="APPROVE">Approve & Activate in Discovery</option>
                <option value="REJECT">Reject Profile</option>
                <option value="HARD_BLOCK">Hard Block (Permanent Ban)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastoral Notes / Feedback
              </label>
              <textarea
                placeholder="Enter interview notes, pastoral observations, or rejection rationale..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={verifyForm.notes}
                onChange={(e) =>
                  setVerifyForm({ ...verifyForm, notes: e.target.value })
                }
                rows="3"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Exit Debrief Reset Modal */}
      <Modal
        isOpen={showDebriefModal}
        onClose={() => setShowDebriefModal(false)}
        title="Exit Debrief & Reset"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDebriefModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDebriefReset}
              disabled={mutationLoading}
            >
              Clear for Discovery
            </Button>
          </>
        }
      >
        {selectedUser && (
          <form className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-950">
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-xs text-purple-700 mt-1">
                This member concluded a relationship and is currently locked in Exit Debrief.
                Conducting a debrief and clearing them will reset their status to Vetted / Active
                and restore their discovery feed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Readiness Score (1–10)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={debriefForm.readinessScore}
                onChange={(e) =>
                  setDebriefForm({
                    ...debriefForm,
                    readinessScore: Number(e.target.value),
                  })
                }
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>
                    {score} {score >= 8 ? "- Highly Ready" : score >= 5 ? "- Moderate" : "- Needs Pastoral Followup"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debrief Notes (Required)
              </label>
              <textarea
                placeholder="Log pastoral reflection notes, closure feedback, and emotional readiness..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={debriefForm.notes}
                onChange={(e) =>
                  setDebriefForm({ ...debriefForm, notes: e.target.value })
                }
                rows="4"
                required
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Create Match Modal */}
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
            !assignedUsers.find(
              (u) => u.accountId === matchForm.primaryAccountId,
            )?.gender && (
              <p className="text-sm text-red-600">
                Selected user has no gender on record. Update their profile
                first.
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
