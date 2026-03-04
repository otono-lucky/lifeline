import React, { useState } from "react";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, StatCard, Table, Button, Modal, Toast } from "../components";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateCounsellorModal from "../features/dashboard/components/CreateCounsellorModal";
import {
  Building2,
  CircleCheckBig,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useAdminChurchAdminsQuery,
  useAdminCounselorsQuery,
  useAdminUsersQuery,
  useCreateChurchAdminMutation,
  useAdminVerifyUserMutation,
  useSuperAdminOverviewQuery,
  useAdminChurchesQuery,
} from "../api/queries/admin";
import {
  useActivateChurchMutation,
  useCreateChurchMutation,
} from "../api/queries/churches";

const SuperAdminDashboard = () => {
  const [toast, setToast] = useState(null);
  const [showCreateChurch, setShowCreateChurch] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateCounselor, setShowCreateCounselor] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "overview";

  const [churchForm, setChurchForm] = useState({
    officialName: "",
    aka: "",
    email: "",
    phone: "",
    state: "",
    lga: "",
    city: "",
    address: "",
  });

  const [adminForm, setAdminForm] = useState({
    churchId: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const overviewQuery = useSuperAdminOverviewQuery({
    enabled: activeTab === "overview",
    staleTime: 1000 * 60 * 2,
    onError: () =>
      setToast({ type: "error", message: "Failed to fetch dashboard data" }),
  });

  const churchesQuery = useAdminChurchesQuery(
    {},
    {
      enabled: activeTab === "churches" || showCreateAdmin,
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch churches" }),
    },
  );

  const usersQuery = useAdminUsersQuery(
    {},
    {
      enabled: activeTab === "users",
      staleTime: 1000 * 60 * 2,
      onError: () => setToast({ type: "error", message: "Failed to fetch users" }),
    },
  );

  const churchAdminsQuery = useAdminChurchAdminsQuery(
    {},
    {
      enabled: activeTab === "admins",
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch church admins" }),
    },
  );

  const counselorsQuery = useAdminCounselorsQuery(
    {},
    {
      enabled: activeTab === "counselors" || showCreateCounselor,
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch counselors" }),
    },
  );

  const createChurchMutation = useCreateChurchMutation();
  const activateChurchMutation = useActivateChurchMutation();
  const createChurchAdminMutation = useCreateChurchAdminMutation();
  const verifyUserMutation = useAdminVerifyUserMutation();

  const overviewData =
    overviewQuery.data?.success && overviewQuery.data?.data
      ? overviewQuery.data.data
      : {
          stats: null,
          churches: [],
          users: [],
          churchAdmins: [],
          counselors: [],
        };

  const churches = churchesQuery.data?.success
    ? churchesQuery.data.data.churches || []
    : activeTab === "overview"
      ? overviewData.churches
      : [];
  const users = usersQuery.data?.success
    ? usersQuery.data.data.users || []
    : activeTab === "overview"
      ? overviewData.users
      : [];
  const churchAdmins = churchAdminsQuery.data?.success
    ? churchAdminsQuery.data.data.churchAdmins || []
    : activeTab === "overview"
      ? overviewData.churchAdmins
      : [];
  const counselors = counselorsQuery.data?.success
    ? counselorsQuery.data.data.counselors || []
    : activeTab === "overview"
      ? overviewData.counselors
      : [];

  const churchesForSelect = churchesQuery.data?.success
    ? churchesQuery.data.data.churches || []
    : overviewData.churches || [];

  const overviewLoading =
    overviewQuery.isLoading ||
    overviewQuery.isFetching ||
    createChurchMutation.isPending;
  const churchesLoading =
    churchesQuery.isLoading ||
    churchesQuery.isFetching ||
    createChurchMutation.isPending ||
    activateChurchMutation.isPending;
  const usersLoading =
    usersQuery.isLoading || usersQuery.isFetching || verifyUserMutation.isPending;
  const adminsLoading =
    churchAdminsQuery.isLoading ||
    churchAdminsQuery.isFetching ||
    createChurchAdminMutation.isPending;
  const counselorsLoading = counselorsQuery.isLoading || counselorsQuery.isFetching;

  const overviewError = overviewQuery.isError;
  const churchesError = churchesQuery.isError;
  const usersError = usersQuery.isError;
  const adminsError = churchAdminsQuery.isError;
  const counselorsError = counselorsQuery.isError;

  const handleCreateChurch = async (e) => {
    e.preventDefault();
    try {
      const response = await createChurchMutation.mutateAsync(churchForm);
      if (response.success) {
        setToast({ type: "success", message: "Church created successfully!" });
        setChurchForm({
          officialName: "",
          aka: "",
          email: "",
          phone: "",
          state: "",
          lga: "",
          city: "",
          address: "",
        });
        setShowCreateChurch(false);
      }
    } catch {
      setToast({ type: "error", message: "Failed to create church" });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await createChurchAdminMutation.mutateAsync(adminForm);
      if (response.success) {
        setToast({
          type: "success",
          message: "Church admin created successfully!",
        });
        setAdminForm({
          churchId: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phone: "",
        });
        setShowCreateAdmin(false);
      }
    } catch {
      setToast({ type: "error", message: "Failed to create church admin" });
    }
  };

  const handleVerifyUser = async (accountId, isVerified) => {
    if (!accountId) {
      setToast({ type: "error", message: "Missing user accountId" });
      return;
    }
    try {
      const response = await verifyUserMutation.mutateAsync({ accountId, isVerified });
      if (response.success) {
        setToast({ type: "success", message: "User updated successfully!" });
      }
    } catch {
      setToast({ type: "error", message: "Failed to update user" });
    }
  };

  const handleVerifyChurch = async (churchId, status = "active") => {
    try {
      const response = await activateChurchMutation.mutateAsync({
        id: churchId,
        data: { status },
      });
      if (response.success) {
        setToast({
          type: "success",
          message: "Church status updated successfully!",
        });
      }
    } catch {
      setToast({ type: "error", message: "Failed to update church" });
    }
  };

  const sidebar = (
    <nav className="space-y-2 flex flex-col">
      {[
        { id: "overview", label: "Dashboard" },
        { id: "churches", label: "Manage Churches" },
        { id: "users", label: "Manage Users" },
        { id: "counselors", label: "Counselors" },
        { id: "admins", label: "Church Admins" },
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

  const churchColumns = [
    { key: "officialName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "state", label: "State" },
    { key: "status", label: "Status" },
  ];

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
    { key: "email", label: "Email", render: (_, row) => row.email },
    { key: "verificationStatus", label: "Verification" },
  ];

  const adminColumns = [
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
    {
      key: "church",
      label: "Church",
      render: (_, row) => row.church?.officialName,
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
    {
      key: "church",
      label: "Church",
      render: (_, row) => row.church?.officialName,
    },
  ];

  return (
    <DashboardLayout sidebar={sidebar}>
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          {overviewError && (
            <Card>
              <p className="text-red-600">Failed to load overview data.</p>
            </Card>
          )}

          {overviewData.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Total Churches"
                value={overviewData.stats.overview?.churches?.total || 0}
                icon={<Building2 className="w-8 h-8" />}
                color="blue"
              />
              <StatCard
                label="Active Churches"
                value={overviewData.stats.overview?.churches?.active || 0}
                icon={<CircleCheckBig className="w-8 h-8" />}
                color="green"
              />
              <StatCard
                label="Total Users"
                value={overviewData.stats.overview?.users?.total || 0}
                icon={<Users className="w-8 h-8" />}
                color="yellow"
              />
              <StatCard
                label="Verified Users"
                value={overviewData.stats.overview?.users?.verified || 0}
                icon={<ShieldCheck className="w-8 h-8" />}
                color="green"
              />
            </div>
          )}

          <Card title="Recent Churches" subtitle="Latest churches created">
            <Table columns={churchColumns} data={overviewData.churches.slice(0, 5)} loading={overviewLoading} />
          </Card>

          <Card title="Recent Users" subtitle="Latest user signups">
            <Table columns={userColumns} data={overviewData.users.slice(0, 5)} loading={overviewLoading} />
          </Card>
        </div>
      )}

      {activeTab === "churches" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Manage Churches</h1>
            <Button onClick={() => setShowCreateChurch(true)}>Create Church</Button>
          </div>

          {churchesError && (
            <Card>
              <p className="text-red-600">Failed to load churches.</p>
            </Card>
          )}
          <Card>
            <Table
              columns={churchColumns}
              data={churches}
              loading={churchesLoading}
              actions={(row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleVerifyChurch(
                      row.id,
                      row.status === "active" ? "suspended" : "active",
                    )
                  }
                >
                  {row.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              )}
            />
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          {usersError && (
            <Card>
              <p className="text-red-600">Failed to load users.</p>
            </Card>
          )}

          <Card>
            <Table
              columns={userColumns}
              data={users}
              loading={usersLoading}
              actions={(row) => (
                <Button
                  size="sm"
                  variant={row.isVerified ? "secondary" : "success"}
                  onClick={() => handleVerifyUser(row.accountId, !row.isVerified)}
                >
                  {row.isVerified ? "Unverify" : "Verify"}
                </Button>
              )}
            />
          </Card>
        </div>
      )}

      {activeTab === "admins" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Church Admins</h1>
            <Button onClick={() => setShowCreateAdmin(true)}>Create Church Admin</Button>
          </div>

          {adminsError && (
            <Card>
              <p className="text-red-600">Failed to load church admins.</p>
            </Card>
          )}
          <Card>
            <Table
              columns={adminColumns}
              data={churchAdmins}
              loading={adminsLoading}
              actions={(row) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/dashboard/church-admin/${row.accountId}`)}
                >
                  View Dashboard
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
            <Button onClick={() => setShowCreateCounselor(true)}>Create Counsellor</Button>
          </div>

          {counselorsError && (
            <Card>
              <p className="text-red-600">Failed to load counselors.</p>
            </Card>
          )}
          <Card>
            <Table
              columns={counselorColumns}
              data={counselors}
              loading={counselorsLoading}
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

      <Modal
        isOpen={showCreateChurch}
        onClose={() => setShowCreateChurch(false)}
        title="Create Church"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateChurch(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChurch} disabled={createChurchMutation.isPending}>
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Official Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.officialName}
            onChange={(e) =>
              setChurchForm({ ...churchForm, officialName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Also Known As"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.aka}
            onChange={(e) => setChurchForm({ ...churchForm, aka: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.email}
            onChange={(e) => setChurchForm({ ...churchForm, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.phone}
            onChange={(e) => setChurchForm({ ...churchForm, phone: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="State"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.state}
            onChange={(e) => setChurchForm({ ...churchForm, state: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="LGA"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.lga}
            onChange={(e) => setChurchForm({ ...churchForm, lga: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.city}
            onChange={(e) => setChurchForm({ ...churchForm, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.address}
            onChange={(e) =>
              setChurchForm({ ...churchForm, address: e.target.value })
            }
          />
        </form>
      </Modal>

      <Modal
        isOpen={showCreateAdmin}
        onClose={() => setShowCreateAdmin(false)}
        title="Create Church Admin"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateAdmin(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={createChurchAdminMutation.isPending}>
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.churchId}
            onChange={(e) => setAdminForm({ ...adminForm, churchId: e.target.value })}
            required
          >
            <option value="">Select Church</option>
            {churchesForSelect.map((church) => (
              <option key={church.id} value={church.id}>
                {church.officialName}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="First Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.firstName}
            onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.lastName}
            onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.phone}
            onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            required
          />
        </form>
      </Modal>

      <CreateCounsellorModal
        onToast={setToast}
        onShowCreateCounselor={() => setShowCreateCounselor(false)}
        showCreateCounselor={showCreateCounselor}
        fetchCounselors={counselorsQuery.refetch}
        churches={churchesForSelect}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
