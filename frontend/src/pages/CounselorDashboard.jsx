import React, { useState } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, StatCard, Table, Button, Modal, Toast } from "../components";
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

const CounselorDashboard = () => {
  const { user } = useAuth();
  const { id: viewedCounselorAccountId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    status: "verified",
    notes: "",
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
      enabled: activeTab === "users",
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch assigned users" }),
    },
  );

  const verifyUserMutation = useVerifyCounselorUserMutation();

  const dashboard = dashboardQuery.data?.success ? dashboardQuery.data.data : null;
  const assignedUsers = assignedUsersQuery.data?.success
    ? assignedUsersQuery.data.data.users || []
    : [];

  const overviewLoading = dashboardQuery.isLoading || dashboardQuery.isFetching;
  const usersLoading = assignedUsersQuery.isLoading || assignedUsersQuery.isFetching;
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

  const sidebar = (
    <nav className="space-y-2">
      {[
        { id: "dashboard", label: "Dashboard" },
        { id: "users", label: "Assigned Users" },
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

  return (
    <DashboardLayout sidebar={sidebar}>
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isHigherRoleViewer
              ? `Viewing Counselor ${dashboard?.counselor?.name || ""}'s Dashboard`
              : "Counselor Dashboard"}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/dashboard/user/${row.accountId}`)}
                  >
                    View Dashboard
                  </Button>
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
