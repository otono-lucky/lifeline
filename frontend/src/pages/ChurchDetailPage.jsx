import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useChurchQuery,
  useUpdateChurchMutation,
  useActivateChurchMutation,
} from "../api/queries/churches";
import { useChurchAdminMembersQuery } from "../api/queries/churchAdmin";
import { Card, StatCard, Table, Button, Modal, Toast } from "../components";
import {
  Building2,
  Users,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit2,
  Power,
} from "lucide-react";

export const ChurchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: churchResponse, isLoading, isError, refetch } = useChurchQuery(id);
  const church = churchResponse?.data?.church || churchResponse?.church;

  const { data: membersResponse, isLoading: membersLoading } = useChurchAdminMembersQuery(
    id,
    { limit: 50 },
    { enabled: Boolean(id) }
  );
  const members = membersResponse?.data?.members || membersResponse?.members || [];

  const updateChurchMutation = useUpdateChurchMutation();
  const activateChurchMutation = useActivateChurchMutation();

  const [editForm, setEditForm] = useState({
    officialName: "",
    aka: "",
    address: "",
    status: "active",
  });

  const handleOpenEdit = () => {
    if (church) {
      setEditForm({
        officialName: church.officialName || "",
        aka: church.aka || "",
        address: church.address || "",
        status: church.status || "active",
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateChurchMutation.mutateAsync({
        id,
        data: editForm,
      });
      if (response.success) {
        setToast({ type: "success", message: "Church updated successfully!" });
        setShowEditModal(false);
        refetch();
      }
    } catch {
      setToast({ type: "error", message: "Failed to update church details" });
    }
  };

  const handleToggleStatus = async () => {
    if (!church) return;
    const newStatus = church.status === "active" ? "suspended" : "active";
    try {
      const response = await activateChurchMutation.mutateAsync({
        id,
        data: { status: newStatus },
      });
      if (response.success) {
        setToast({
          type: "success",
          message: `Church status changed to ${newStatus}`,
        });
        refetch();
      }
    } catch {
      setToast({ type: "error", message: "Failed to update status" });
    }
  };

  const memberColumns = [
    {
      key: "profilePictureUrl",
      label: "Avatar",
      render: (_, row) => {
        const photo = row.photoUrl || row.profilePictureUrl;
        return (
          <Link to={`/dashboard/user/${row.accountId || row.id}`}>
            {photo ? (
              <img
                src={photo}
                alt=""
                className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full text-white bg-gray-500 text-xs font-bold">
                {row.firstName?.[0]}
                {row.lastName?.[0]}
              </div>
            )}
          </Link>
        );
      },
    },
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => (
        <Link
          to={`/dashboard/user/${row.accountId || row.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender", render: (g) => g || "N/A" },
    {
      key: "vettingStatus",
      label: "Vetting Status",
      render: (status, row) => {
        const val = status || row.verificationStatus || "DRAFT";
        const colors = {
          VETTED_ACTIVE: "bg-green-100 text-green-800",
          PENDING_VETTING: "bg-amber-100 text-amber-800",
          DEBRIEF_REQUIRED: "bg-purple-100 text-purple-800",
          REJECTED: "bg-red-100 text-red-800",
          HARD_BLOCKED: "bg-gray-900 text-white",
        };
        return (
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              colors[val] || "bg-gray-100 text-gray-700"
            }`}
          >
            {val}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading church details...</p>
        </div>
      </div>
    );
  }

  if (isError || !church) {
    return (
      <div className="p-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-700 font-semibold">Failed to load church records.</p>
          <Link
            to="/admin/churches"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Church Directory
          </Link>
        </div>
      </div>
    );
  }

  const counselorsList = church.counselors || [];
  const churchAdminAccount = church.churchAdmin?.account;

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin" className="hover:text-blue-600">
          Admin
        </Link>
        <span>/</span>
        <Link to="/admin/churches" className="hover:text-blue-600">
          Churches
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{church.officialName}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{church.officialName}</h1>
            {church.aka && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                aka {church.aka}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                church.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {church.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              {church.churchModel === "PARENT_BRANCH"
                ? "Parent-Branch Denomination"
                : "Independent Parish"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {church.city ? `${church.city}, ` : ""}
              {church.state}, {church.country || "Nigeria"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              Onboarded {new Date(church.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleOpenEdit}>
            <Edit2 className="w-4 h-4 mr-1.5" /> Edit Profile
          </Button>
          <Button
            variant={church.status === "active" ? "danger" : "primary"}
            onClick={handleToggleStatus}
            disabled={activateChurchMutation.isPending}
          >
            <Power className="w-4 h-4 mr-1.5" />
            {church.status === "active" ? "Suspend Church" : "Activate Church"}
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Parish Members"
          value={members.length}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Active Counselors"
          value={counselorsList.length}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          label="Onboarding Type"
          value={church.churchModel === "PARENT_BRANCH" ? "Parent" : "Independent"}
          icon={<Building2 className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          label="Governance Status"
          value={churchAdminAccount ? "Admin Assigned" : "Needs Admin"}
          icon={<ShieldCheck className="w-6 h-6" />}
          color={churchAdminAccount ? "green" : "red"}
        />
      </div>

      {/* Pastoral Governance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Senior Pastor Contact */}
        <Card title="Pastoral Oversight (Senior Pastor)">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-24">Senior Pastor:</span>
              <span className="font-semibold text-gray-900">
                {church.pastorName || "Not captured during onboarding"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 w-20">Email:</span>
              <span className="text-gray-900">{church.pastorEmail || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 w-20">Phone:</span>
              <span className="text-gray-900">{church.pastorPhone || "N/A"}</span>
            </div>
          </div>
        </Card>

        {/* 1:1 Church Administrator */}
        <Card title="1:1 Church Administrator Account">
          {churchAdminAccount ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-24">Administrator:</span>
                <span className="font-semibold text-gray-900">
                  {churchAdminAccount.firstName} {churchAdminAccount.lastName}
                </span>
                {church.churchAdmin?.title && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-700">
                    {church.churchAdmin.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 w-20">Email:</span>
                <span className="text-gray-900">{churchAdminAccount.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 w-20">Phone:</span>
                <span className="text-gray-900">{churchAdminAccount.phone || "N/A"}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No Church Admin account assigned yet.</p>
              <Link to="/admin/church-admins">
                <Button className="mt-2 text-xs" variant="secondary">
                  Create Church Admin
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Active Counselors List */}
      <Card title="Active Counselors Roster" subtitle="Counselors assigned to this church">
        {counselorsList.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {counselorsList.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {c.account?.firstName} {c.account?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{c.account?.email}</p>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {c.account?.status || "active"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-3">No counselors onboarded for this church yet.</p>
        )}
      </Card>

      {/* Parish Members Directory */}
      <Card
        title="Parish Members Directory"
        subtitle={`Members registered under ${church.officialName}`}
      >
        <Table
          columns={memberColumns}
          data={members}
          loading={membersLoading}
        />
      </Card>

      {/* Edit Church Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Church Profile"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateChurchMutation.isPending}>
              Save Changes
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Official Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              value={editForm.officialName}
              onChange={(e) => setEditForm({ ...editForm, officialName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Also Known As (Alias)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              value={editForm.aka}
              onChange={(e) => setEditForm({ ...editForm, aka: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Physical Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Parish Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ChurchDetailPage;
