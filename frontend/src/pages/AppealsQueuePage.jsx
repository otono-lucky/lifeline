import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useAdminAppealsQuery,
  useAdminAppealQuery,
  useAdminReviewAppealMutation,
} from "../api/queries/admin";
import { Card, StatCard, Table, Button, Toast } from "../components";
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Building2,
  User,
  MessageSquare,
} from "lucide-react";

export const AppealsQueuePage = () => {
  const { id: appealId } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Single Appeal view
  const {
    data: appealResponse,
    isLoading: appealLoading,
    refetch: refetchAppeal,
  } = useAdminAppealQuery(appealId, { enabled: Boolean(appealId) });
  const appeal = appealResponse?.data?.appeal || appealResponse?.appeal;

  // Appeals Queue List
  const {
    data: appealsResponse,
    isLoading: appealsLoading,
    refetch: refetchAppeals,
  } = useAdminAppealsQuery(
    statusFilter === "ALL" ? {} : { status: statusFilter },
    { enabled: !appealId }
  );
  const appeals = appealsResponse?.data?.appeals || appealsResponse?.appeals || [];

  const reviewAppealMutation = useAdminReviewAppealMutation();

  const [reviewForm, setReviewForm] = useState({
    status: "APPROVED",
    notes: "",
  });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await reviewAppealMutation.mutateAsync({
        appealId,
        status: reviewForm.status,
        notes: reviewForm.notes,
      });
      if (response.success) {
        setToast({
          type: "success",
          message: `Appeal has been ${reviewForm.status.toLowerCase()}!`,
        });
        refetchAppeal();
        setTimeout(() => navigate("/admin/appeals"), 1500);
      }
    } catch {
      setToast({ type: "error", message: "Failed to process appeal adjudication" });
    }
  };

  const appealColumns = [
    {
      key: "user",
      label: "Candidate",
      render: (_, row) => {
        const user = row.user?.account || row.user;
        const photo = row.user?.profilePictureUrl || row.user?.photoUrl;
        return (
          <div className="flex items-center gap-3">
            <Link to={`/admin/appeals/${row.id}`}>
              {photo ? (
                <img
                  src={photo}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {user?.firstName?.[0] || "U"}
                </div>
              )}
            </Link>
            <div>
              <Link
                to={`/admin/appeals/${row.id}`}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline block"
              >
                {user?.firstName} {user?.lastName}
              </Link>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "church",
      label: "Parish",
      render: (_, row) => row.user?.church?.officialName || "N/A",
    },
    {
      key: "appealReason",
      label: "Appeal Statement",
      render: (text) => (
        <span className="text-sm text-gray-700 line-clamp-1 max-w-xs">
          {text}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      key: "status",
      label: "Status",
      render: (status) => {
        const colors = {
          PENDING: "bg-amber-100 text-amber-800 border-amber-200",
          APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
          REJECTED: "bg-red-100 text-red-800 border-red-200",
        };
        return (
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              colors[status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Adjudication",
      render: (_, row) => (
        <Link to={`/admin/appeals/${row.id}`}>
          <Button variant="secondary" className="text-xs py-1 px-2.5">
            Review Case →
          </Button>
        </Link>
      ),
    },
  ];

  // Adjudication Workspace (Detail View)
  if (appealId) {
    if (appealLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading appeal dossier...</p>
          </div>
        </div>
      );
    }

    if (!appeal) {
      return (
        <div className="p-8">
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-700 font-semibold">Appeal case not found.</p>
            <Link
              to="/admin/appeals"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Appeals Queue
            </Link>
          </div>
        </div>
      );
    }

    const candidateAccount = appeal.user?.account || appeal.user;
    const isResolved = appeal.status !== "PENDING";

    return (
      <div className="p-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/admin" className="hover:text-blue-600">
            Admin
          </Link>
          <span>/</span>
          <Link to="/admin/appeals" className="hover:text-blue-600">
            Appeals Queue
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">
            Case #{appeal.id.substring(0, 8)}
          </span>
        </div>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Appeal Adjudication Workspace
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                  appeal.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : appeal.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {appeal.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Case filed by {candidateAccount?.firstName} {candidateAccount?.lastName} on{" "}
              {new Date(appeal.createdAt).toLocaleString()}
            </p>
          </div>

          <Link to="/admin/appeals">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Queue
            </Button>
          </Link>
        </div>

        {/* 2-Column Adjudication Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Candidate & Appeal Dossier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Summary Card */}
            <Card title="Candidate Background">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">Full Name</span>
                  <span className="font-semibold text-gray-900">
                    {candidateAccount?.firstName} {candidateAccount?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Email</span>
                  <span className="text-gray-900">{candidateAccount?.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Parish / Church</span>
                  <span className="text-gray-900">
                    {appeal.user?.church?.officialName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Assigned Counselor</span>
                  <span className="text-gray-900">
                    {appeal.user?.assignedCounselor?.account
                      ? `${appeal.user.assignedCounselor.account.firstName} ${appeal.user.assignedCounselor.account.lastName}`
                      : "Unassigned"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Candidate Formal Appeal Statement */}
            <Card title="Candidate Appeal Statement">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  "{appeal.appealReason}"
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Candidate statement recorded at {new Date(appeal.createdAt).toLocaleDateString()}
              </p>
            </Card>

            {/* Profile Deep-Link Action */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">Full Vetting Dossier</p>
                <p className="text-xs text-blue-700">
                  Inspect the candidate's complete submitted profile, photos, and video intro.
                </p>
              </div>
              <Link to={`/dashboard/user/${appeal.userId || candidateAccount?.id}`}>
                <Button variant="secondary" className="text-xs">
                  Inspect Dossier →
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: SuperAdmin Adjudication Console */}
          <div className="space-y-6">
            <Card title="Pastoral Adjudication Console">
              {isResolved ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center space-y-2">
                  <span className="text-2xl">
                    {appeal.status === "APPROVED" ? "✅" : "❌"}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">
                    Case Adjudicated as {appeal.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    This appeal decision is finalized.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Adjudication Decision
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
                      value={reviewForm.status}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, status: e.target.value })
                      }
                    >
                      <option value="APPROVED">APPROVE (Restore to Pending Vetting)</option>
                      <option value="REJECTED">REJECT (Uphold Hard-Block)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Adjudication Notes / Rationale
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Enter rationale for appeal resolution..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      value={reviewForm.notes}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, notes: e.target.value })
                      }
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant={reviewForm.status === "APPROVED" ? "primary" : "danger"}
                      className="w-full justify-center"
                      disabled={reviewAppealMutation.isPending}
                    >
                      {reviewForm.status === "APPROVED"
                        ? "Approve Appeal & Restore User"
                        : "Reject Appeal & Confirm Ban"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // Appeals Queue Table View
  const pendingCount = appeals.filter((a) => a.status === "PENDING").length;
  const approvedCount = appeals.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = appeals.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appeals Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and adjudicate appeals from hard-blocked user accounts (§11.B #8 & #9)
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Appeals Filed"
          value={appeals.length}
          icon={<Scale className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          label="Approved / Restored"
          value={approvedCount}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          label="Rejected (Banned)"
          value={rejectedCount}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === tab
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab === "ALL" ? "All Appeals" : tab}
          </button>
        ))}
      </div>

      {/* Appeals Table */}
      <Card title="Appeal Submissions" subtitle="Candidates requesting reconsideration">
        <Table
          columns={appealColumns}
          data={appeals}
          loading={appealsLoading}
        />
      </Card>

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

export default AppealsQueuePage;
