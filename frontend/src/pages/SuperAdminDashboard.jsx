import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import {
  Card,
  StatCard,
  Table,
  Button,
  Modal,
  Toast,
  ConfirmModal,
} from "../components";
import { adminService, churchService } from "../api/services";
import { NavLink, useSearchParams } from "react-router-dom";

const SuperAdminDashboard = () => {
  // const [activeTab, setActiveTab] = useState("dashboard");
  const [churches, setChurches] = useState([]);
  const [users, setUsers] = useState([]);
  const [churchAdmins, setChurchAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateChurch, setShowCreateChurch] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  // Form states
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

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboard();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardRes, statsRes, churchesRes, usersRes, adminsRes] =
        await Promise.all([
          adminService.getDashboard(),
          adminService.getStats(),
          churchService.getChurches({ limit: 10 }),
          adminService.getUsers({ limit: 10 }),
          adminService.getChurchAdmins({ limit: 10 }),
        ]);

      if (dashboardRes.success) setStats(dashboardRes.data);
      if (churchesRes.success) setChurches(churchesRes.data.churches || []);
      if (usersRes.success) setUsers(usersRes.data.users || []);
      if (adminsRes.success) setChurchAdmins(adminsRes.data.churchAdmins || []);
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch dashboard data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchChurches = async () => {
    setLoading(true);
    try {
      const response = await churchService.getChurches();
      if (response.success) {
        setChurches(response.data.churches || []);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch churches" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers();
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChurch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await churchService.createChurch(churchForm);
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
        fetchChurches();
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to create church" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminService.createChurchAdmin(adminForm);
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
        // Refetch data
        const adminsRes = await adminService.getChurchAdmins();
        if (adminsRes.success) {
          setChurchAdmins(adminsRes.data.churchAdmins || []);
        }
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to create church admin" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      const response = await adminService.verifyUser(userId, isVerified);
      if (response.success) {
        setToast({ type: "success", message: "User updated successfully!" });
        fetchUsers();
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to update user" });
    }
  };

  const handleVerifyChurch = async (churchId, status = "active") => {
    try {
      const response = await churchService.activateChurch(churchId, {
        status,
      });
      if (response.success) {
        setToast({
          type: "success",
          message: "Church activated successfully!",
        });
        fetchChurches();
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to update church" });
    }
  };

  const sidebar = (
    <nav className="space-y-2 flex flex-col">
      {[
        { id: "overview", label: "📊 Dashboard" },
        { id: "churches", label: "⛪ Manage Churches" },
        { id: "users", label: "👥 Manage Users" },
        { id: "admins", label: "🔑 Church Admins" },
      ].map((item) => (
        <button         
          key={item.id}
          onClick={() => setSearchParams({ tab: item.id})}
          // onClick={() => setActiveTabitem.id)}
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
    { key: "id", label: "ID", render: (id) => id.substring(0, 8) },
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => `${row.account?.firstName} ${row.account?.lastName}`,
    },
    { key: "email", label: "Email", render: (_, row) => row.account?.email },
    { key: "verificationStatus", label: "Verification" },
  ];

  const adminColumns = [
    { key: "id", label: "ID", render: (id) => id.substring(0, 8) },
    {
      key: "account",
      label: "Name",
      render: (_, row) => `${row.account?.firstName} ${row.account?.lastName}`,
    },
    { key: "email", label: "Email", render: (_, row) => row.account?.email },
    {
      key: "church",
      label: "Church",
      render: (_, row) => row.church?.officialName,
    },
  ];

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Dashboard View */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Total Churches"
                value={stats.overview?.churches?.total || 0}
                icon="⛪"
                color="blue"
              />
              <StatCard
                label="Active Churches"
                value={stats.overview?.churches?.active || 0}
                icon="✅"
                color="green"
              />
              <StatCard
                label="Total Users"
                value={stats.overview?.users?.total || 0}
                icon="👥"
                color="yellow"
              />
              <StatCard
                label="Verified Users"
                value={stats.overview?.users?.verified || 0}
                icon="🔒"
                color="green"
              />
            </div>
          )}

          {/* Recent Churches */}
          <Card title="Recent Churches" subtitle="Latest churches created">
            <Table
              columns={churchColumns}
              data={churches.slice(0, 5)}
              loading={loading}
            />
          </Card>

          {/* Recent Users */}
          <Card title="Recent Users" subtitle="Latest user signups">
            <Table
              columns={userColumns}
              data={users.slice(0, 5)}
              loading={loading}
            />
          </Card>
        </div>
      )}

      {/* Churches Management */}
      {activeTab === "churches" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Churches
            </h1>
            <Button onClick={() => setShowCreateChurch(true)}>
              Create Church
            </Button>
          </div>

          <Card>
            <Table
              columns={churchColumns}
              data={churches}
              loading={loading}
              actions={(row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyChurch(row.id, row.status === "active" ? "suspended" : "active")}
                    // disabled={row.status === "active"}
                  >
                    {row.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* Users Management */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>

          <Card>
            <Table
              columns={userColumns}
              data={users}
              loading={loading}
              actions={(row) => (
                <Button
                  size="sm"
                  variant={row.isVerified ? "secondary" : "success"}
                  onClick={() => handleVerifyUser(row.id, !row.isVerified)}
                >
                  {row.isVerified ? "Unverify" : "Verify"}
                </Button>
              )}
            />
          </Card>
        </div>
      )}

      {/* Church Admins Management */}
      {activeTab === "admins" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Church Admins</h1>
            <Button onClick={() => setShowCreateAdmin(true)}>
              Create Church Admin
            </Button>
          </div>

          <Card>
            <Table
              columns={adminColumns}
              data={churchAdmins}
              loading={loading}
            />
          </Card>
        </div>
      )}

      {/* Create Church Modal */}
      <Modal
        isOpen={showCreateChurch}
        onClose={() => setShowCreateChurch(false)}
        title="Create Church"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCreateChurch(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateChurch} disabled={loading}>
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
            onChange={(e) =>
              setChurchForm({ ...churchForm, aka: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.email}
            onChange={(e) =>
              setChurchForm({ ...churchForm, email: e.target.value })
            }
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.phone}
            onChange={(e) =>
              setChurchForm({ ...churchForm, phone: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="State"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.state}
            onChange={(e) =>
              setChurchForm({ ...churchForm, state: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="LGA"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.lga}
            onChange={(e) =>
              setChurchForm({ ...churchForm, lga: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="City"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={churchForm.city}
            onChange={(e) =>
              setChurchForm({ ...churchForm, city: e.target.value })
            }
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

      {/* Create Church Admin Modal */}
      <Modal
        isOpen={showCreateAdmin}
        onClose={() => setShowCreateAdmin(false)}
        title="Create Church Admin"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCreateAdmin(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={loading}>
              Create
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.churchId}
            onChange={(e) =>
              setAdminForm({ ...adminForm, churchId: e.target.value })
            }
            required
          >
            <option value="">Select Church</option>
            {churches.map((church) => (
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
            onChange={(e) =>
              setAdminForm({ ...adminForm, firstName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.lastName}
            onChange={(e) =>
              setAdminForm({ ...adminForm, lastName: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.email}
            onChange={(e) =>
              setAdminForm({ ...adminForm, email: e.target.value })
            }
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.phone}
            onChange={(e) =>
              setAdminForm({ ...adminForm, phone: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={adminForm.password}
            onChange={(e) =>
              setAdminForm({ ...adminForm, password: e.target.value })
            }
            required
          />
        </form>
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

export default SuperAdminDashboard;
