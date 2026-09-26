import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useCounselorAssignedUsersQuery,
  useVerifyCounselorUserMutation,
  useDebriefResetMutation,
} from "../api/queries/counselor";
import { useUserProfileQuery } from "../api/queries/users";
import { Toast } from "../components/Toast";

export const VettingQueuePage = () => {
  const { id: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Decision form states for adjudication workspace
  const [decisionNotes, setDecisionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [checklist, setChecklist] = useState({
    identityVerified: false,
    pastoralTestimony: false,
    doctrineAlignment: false,
    safeguardingClear: false,
  });

  // Queries
  const assignedUsersQuery = useCounselorAssignedUsersQuery(
    currentUser?.id,
    {},
    { enabled: !routeUserId, staleTime: 1000 * 60 * 2 }
  );

  const userProfileQuery = useUserProfileQuery(routeUserId, {
    enabled: Boolean(routeUserId),
  });

  const verifyUserMutation = useVerifyCounselorUserMutation();
  const debriefResetMutation = useDebriefResetMutation();

  const users = assignedUsersQuery.data?.success
    ? assignedUsersQuery.data.data.users || []
    : [];

  const candidate = userProfileQuery.data?.success
    ? userProfileQuery.data.data.user
    : null;

  // Filtered users for queue list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING") {
      return (
        u.vettingStatus === "PENDING_VETTING" ||
        (!u.isVerified && u.vettingStatus !== "REJECTED" && u.vettingStatus !== "HARD_BLOCKED")
      );
    }
    if (filterStatus === "DEBRIEF") return u.vettingStatus === "DEBRIEF_REQUIRED";
    if (filterStatus === "ACTIVE") return u.vettingStatus === "VETTED_ACTIVE" || u.isVerified;
    if (filterStatus === "REJECTED") return u.vettingStatus === "REJECTED" || u.vettingStatus === "HARD_BLOCKED";
    return true;
  });

  const handleDecision = async (decision) => {
    if (!routeUserId) return;

    if (decision === "REJECT" && !rejectionReason.trim()) {
      setToast({
        type: "error",
        message: "Please enter an official reason for rejection.",
      });
      return;
    }

    try {
      const response = await verifyUserMutation.mutateAsync({
        userAccountId: routeUserId,
        decision,
        notes: decisionNotes,
        reason: rejectionReason || decisionNotes,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: `Candidate has been ${
            decision === "APPROVE" ? "approved for discovery" : decision.toLowerCase() + "d"
          } successfully.`,
        });
        setTimeout(() => {
          navigate("/church/vetting");
        }, 1200);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to process evaluation.",
      });
    }
  };

  const handleDebriefReset = async () => {
    if (!routeUserId) return;
    try {
      const response = await debriefResetMutation.mutateAsync({
        userAccountId: routeUserId,
        notes: decisionNotes || "Post-courtship debrief successfully completed. Candidate cleared for discovery.",
        readinessScore: 10,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: "Debrief completed! Candidate restored to active discovery.",
        });
        setTimeout(() => {
          navigate("/church/vetting");
        }, 1200);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to reset after debrief.",
      });
    }
  };

  const renderStatusBadge = (status, isVerified) => {
    const s = status || (isVerified ? "VETTED_ACTIVE" : "PENDING_VETTING");
    switch (s) {
      case "VETTED_ACTIVE":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
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
            Hard Blocked
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
            {s}
          </span>
        );
    }
  };

  // ==========================================
  // VIEW: 2-COLUMN EVALUATION WORKSPACE
  // ==========================================
  if (routeUserId) {
    if (userProfileQuery.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-gray-500 font-medium">Loading candidate dossier...</p>
          </div>
        </div>
      );
    }

    if (!candidate) {
      return (
        <div className="p-8 text-center bg-white rounded-xl border border-gray-200 m-6">
          <p className="text-lg font-semibold text-gray-800">Candidate not found</p>
          <p className="text-gray-500 mt-1">The requested user profile does not exist or access is restricted.</p>
          <button
            onClick={() => navigate("/church/vetting")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Queue
          </button>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link to="/church/vetting" className="hover:text-indigo-600 font-medium">
                ← Back to Vetting Queue
              </Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">Candidate Evaluation</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span>{candidate.firstName} {candidate.lastName}</span>
              {renderStatusBadge(candidate.vettingStatus, candidate.isVerified)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/church/members/${candidate.accountId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              Full Member Profile
            </Link>
          </div>
        </div>

        {/* Two-Column Evaluation Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Dossier, Multimedia & Spiritual Background (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity & Basic Info Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                {candidate.profilePictureUrl ? (
                  <img
                    src={candidate.profilePictureUrl}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                    {candidate.firstName?.[0]}
                    {candidate.lastName?.[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{candidate.email} • {candidate.phone || "No phone registered"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joined {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Age / Gender</p>
                  <p className="font-semibold text-gray-800">{candidate.age || "N/A"} yrs • {candidate.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Church Branch</p>
                  <p className="font-semibold text-gray-800">{candidate.branchName || candidate.church?.officialName || "General"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Occupation</p>
                  <p className="font-semibold text-gray-800">{candidate.occupation || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">State of Origin</p>
                  <p className="font-semibold text-gray-800">{candidate.originState || "N/A"}, {candidate.originCountry || "Nigeria"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Residence</p>
                  <p className="font-semibold text-gray-800">{candidate.residenceCity || candidate.residenceState || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Profile Completion</p>
                  <p className="font-semibold text-indigo-600">{candidate.profileCompletionPercentage || 0}%</p>
                </div>
              </div>
            </div>

            {/* Video Introduction Player (Core Vetting Artifact) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-indigo-600">📹</span> Video Introduction
                  </h3>
                  <p className="text-xs text-gray-500">
                    Candidate's 30-second self-introduction confirming authenticity, demeanor, and speech.
                  </p>
                </div>
                {candidate.videoIntroUrl && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Available
                  </span>
                )}
              </div>

              {candidate.videoIntroUrl ? (
                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video
                    controls
                    src={candidate.videoIntroUrl}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video streaming.
                  </video>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <span className="text-3xl text-gray-400">🎥</span>
                  <p className="mt-2 text-sm font-medium text-gray-700">No video introduction recorded</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    The candidate has not yet submitted their required video introduction on the mobile app.
                  </p>
                </div>
              )}
            </div>

            {/* Profile Photos Gallery */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span>📸</span> Verification Photos ({candidate.photos?.length || 0})
              </h3>
              {candidate.photos && candidate.photos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {candidate.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(photo.url || photo)}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-indigo-500 transition"
                    >
                      <img
                        src={photo.url || photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-semibold bg-black/60 text-white rounded">
                        #{index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No gallery photos uploaded.</p>
              )}
            </div>

            {/* Spiritual & Matchmaking Convictions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span>✝️</span> Spiritual Conviction & Pastoral Verification
              </h3>
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 text-sm space-y-2">
                <p className="text-gray-700">
                  <strong className="text-gray-900">Assigned Counselor:</strong>{" "}
                  {candidate.assignedCounselor
                    ? `${candidate.assignedCounselor.firstName} ${candidate.assignedCounselor.lastName}`
                    : "Unassigned"}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Interests & Hobbies:</strong>{" "}
                  {Array.isArray(candidate.interests) ? candidate.interests.join(", ") : candidate.interests || "None specified"}
                </p>
                {candidate.verificationNotes && (
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Previous Counselor Notes:</strong>{" "}
                    <span className="italic">"{candidate.verificationNotes}"</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Counselor Checklist & Adjudication Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Counselor Adjudication</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Complete safeguarding verifications before approving candidate into active discovery.
                </p>
              </div>

              {/* Safeguarding Checklist */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Verification Checklist
                </p>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={checklist.identityVerified}
                    onChange={(e) =>
                      setChecklist({ ...checklist, identityVerified: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Video & Photo Match</p>
                    <p className="text-xs text-gray-500">Confirmed candidate appearance matches submitted photos.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={checklist.pastoralTestimony}
                    onChange={(e) =>
                      setChecklist({ ...checklist, pastoralTestimony: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Parish Membership Confirmed</p>
                    <p className="text-xs text-gray-500">Validated standing with church branch leadership.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={checklist.doctrineAlignment}
                    onChange={(e) =>
                      setChecklist({ ...checklist, doctrineAlignment: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Christian Faith & Values</p>
                    <p className="text-xs text-gray-500">Alignment with biblical marriage principles.</p>
                  </div>
                </label>
              </div>

              {/* Counselor Evaluation Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Counselor Notes / Justification
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Record observations, pastoral conversations, or recommendation rationale..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Special State: Debrief Required */}
              {candidate.vettingStatus === "DEBRIEF_REQUIRED" && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    <h4 className="text-sm font-bold text-purple-900">Post-Courtship Debrief Required</h4>
                  </div>
                  <p className="text-xs text-purple-700">
                    This candidate previously concluded a courtship and requires pastoral reflection before re-entering matchmaking.
                  </p>
                  <button
                    onClick={handleDebriefReset}
                    disabled={debriefResetMutation.isPending}
                    className="w-full py-2.5 px-4 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
                  >
                    {debriefResetMutation.isPending ? "Restoring Candidate..." : "Complete Debrief & Restore to Discovery"}
                  </button>
                </div>
              )}

              {/* Primary Decision Actions */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleDecision("APPROVE")}
                  disabled={verifyUserMutation.isPending || debriefResetMutation.isPending}
                  className="w-full py-3 px-4 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>{verifyUserMutation.isPending ? "Processing..." : "Approve for Discovery"}</span>
                </button>

                {!isRejecting ? (
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="w-full py-2.5 px-4 bg-white text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-50 transition"
                  >
                    Reject Application...
                  </button>
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
                    <label className="block text-xs font-bold text-red-800">
                      Rejection Reason (Required)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Identity mismatch, ineligible status..."
                      className="w-full px-3 py-1.5 text-sm border border-red-300 rounded bg-white focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleDecision("REJECT")}
                        disabled={verifyUserMutation.isPending}
                        className="flex-1 py-1.5 px-3 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setIsRejecting(false)}
                        className="py-1.5 px-3 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleDecision("HARD_BLOCK")}
                  disabled={verifyUserMutation.isPending}
                  className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-red-700 transition text-center"
                >
                  Flag Safeguarding Violation & Hard Block
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-black">
              <img src={selectedPhoto} alt="Full resolution" className="w-full h-full object-contain" />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: VETTING QUEUE LIST & METRICS
  // ==========================================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vetting & Safeguarding Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review candidate identities, video introductions, and pastoral standing before enabling Christian discovery.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Candidates" },
            { id: "PENDING", label: "Pending Vetting" },
            { id: "DEBRIEF", label: "Debrief Required" },
            { id: "ACTIVE", label: "Active / Vetted" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {assignedUsersQuery.isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading vetting queue...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="text-3xl">📋</span>
            <p className="mt-2 font-medium">No candidates in this queue</p>
            <p className="text-xs text-gray-400 mt-1">All assigned candidates have been adjudicated or matched.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-semibold text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Parish Branch</th>
                  <th className="py-3 px-4">Multimedia</th>
                  <th className="py-3 px-4">Vetting Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.accountId} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {u.profilePictureUrl ? (
                          <img
                            src={u.profilePictureUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/church/vetting/${u.accountId}`}
                            className="font-bold text-gray-900 hover:text-indigo-600 hover:underline"
                          >
                            {u.firstName} {u.lastName}
                          </Link>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {u.age || "N/A"} yrs • {u.gender || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {u.branchName || u.church?.officialName || "General"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {u.videoIntroUrl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            📹 Video
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200">
                            No Video
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">
                          📷 {u.photos?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(u.vettingStatus, u.isVerified)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/church/vetting/${u.accountId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-semibold text-xs rounded-lg hover:bg-indigo-100 transition"
                      >
                        <span>Evaluate Dossier</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VettingQueuePage;
