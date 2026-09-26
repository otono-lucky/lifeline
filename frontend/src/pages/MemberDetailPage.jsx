import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserProfileQuery } from "../api/queries/users";
import {
  useChurchAdminCounselorsQuery,
  useAssignCounselorMutation,
} from "../api/queries/churchAdmin";
import { Toast } from "../components/Toast";

export const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [toast, setToast] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCounselorId, setSelectedCounselorId] = useState("");

  const role = currentUser?.role;
  const isChurchAdmin = role === "ChurchAdmin";
  const isCounselorOrHigher =
    role === "Counselor" || role === "Pastor" || role === "SuperAdmin";

  const userProfileQuery = useUserProfileQuery(id, {
    enabled: Boolean(id),
  });

  const member = userProfileQuery.data?.success
    ? userProfileQuery.data.data.user
    : null;

  const churchId = member?.church?.id || currentUser?.churchId;
  const counselorsQuery = useChurchAdminCounselorsQuery(
    churchId,
    {},
    { enabled: Boolean(churchId) && showAssignModal }
  );

  const assignCounselorMutation = useAssignCounselorMutation();

  const counselors = counselorsQuery.data?.success
    ? counselorsQuery.data.data.counselors || []
    : [];

  const handleAssignCounselor = async (e) => {
    e.preventDefault();
    if (!id || !selectedCounselorId) return;

    try {
      const response = await assignCounselorMutation.mutateAsync({
        userAccountId: id,
        counselorAccountId: selectedCounselorId,
        churchId,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: "Counselor assigned to member successfully!",
        });
        setShowAssignModal(false);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to assign counselor",
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

  if (userProfileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200 m-6">
        <p className="text-lg font-semibold text-gray-800">Member Not Found</p>
        <p className="text-gray-500 mt-1">The requested member does not exist or you lack permission to view this record.</p>
        <Link
          to="/church/members"
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Members
        </Link>
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
            <Link to="/church/members" className="hover:text-indigo-600 font-medium">
              ← Back to Parish Members
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Member Dossier</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span>{member.firstName} {member.lastName}</span>
            {renderStatusBadge(member.vettingStatus, member.isVerified)}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isChurchAdmin && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              {member.assignedCounselor ? "Reassign Counselor" : "Assign Counselor"}
            </button>
          )}

          {isCounselorOrHigher && (
            <Link
              to={`/church/vetting/${member.accountId}`}
              className="px-4 py-2 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition shadow-sm inline-flex items-center gap-1.5"
            >
              <span>Vetting Adjudication</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Privacy Firewall Notice for ChurchAdmin */}
      {isChurchAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Administrative Safeguarding Firewall Active (§2 RBAC)
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Personal dating preferences, salary tiers, and external match partner details are firewalled from parish administration to safeguard congregant privacy. Operational counselors and pastors oversee spiritual matchmaking dossiers.
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Card & Quick Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            {member.profilePictureUrl ? (
              <img
                src={member.profilePictureUrl}
                alt=""
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-indigo-100 shadow-sm"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-sm">
                {member.firstName?.[0]}
                {member.lastName?.[0]}
              </div>
            )}

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {member.firstName} {member.lastName}
            </h2>
            <p className="text-sm text-gray-500">{member.email}</p>
            <p className="text-xs text-gray-400 mt-1">{member.phone || "No phone number"}</p>

            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-gray-400 font-medium block">Age & Gender</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {member.age || "N/A"} yrs • {member.gender || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Parish Branch</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {member.branchName || member.church?.officialName || "General"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Joined Parish</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Profile Status</span>
                <span className="font-semibold text-indigo-600 text-sm">
                  {member.profileCompletionPercentage || 0}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Pastoral Counselor Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Assigned Counselor
            </h3>
            {member.assignedCounselor ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {member.assignedCounselor.firstName?.[0]}
                  {member.assignedCounselor.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {member.assignedCounselor.firstName} {member.assignedCounselor.lastName}
                  </p>
                  <p className="text-xs text-indigo-600">Active Pastoral Counselor</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500 font-medium">No counselor assigned yet</p>
                {isChurchAdmin && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    + Assign a counselor now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Spiritual Dossier / Administrative Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General & Geographic Metadata */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">
              Background & Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-medium">Occupation</p>
                <p className="font-semibold text-gray-800">{member.occupation || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Origin</p>
                <p className="font-semibold text-gray-800">
                  {member.originState || "N/A"}, {member.originCountry || "Nigeria"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Residence City / State</p>
                <p className="font-semibold text-gray-800">
                  {member.residenceCity || "N/A"}, {member.residenceState || "N/A"}
                </p>
              </div>
              {/* Financial tier only shown if counselor/pastor/superAdmin */}
              {isCounselorOrHigher && member.salaryRange && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">Salary Range (Privileged)</p>
                  <p className="font-semibold text-gray-800">{member.salaryRange}</p>
                </div>
              )}
            </div>
          </div>

          {/* Multimedia & Photos */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2 flex items-center justify-between">
              <span>Candidate Gallery</span>
              <span className="text-xs text-gray-400 font-normal">{member.photos?.length || 0} photos</span>
            </h3>

            {member.photos && member.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {member.photos.map((p, idx) => (
                  <img
                    key={idx}
                    src={p.url || p}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No gallery photos uploaded.</p>
            )}
          </div>

          {/* Spiritual Dossier (Privileged for Counselor/Pastor) */}
          {isCounselorOrHigher && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <span>✝️</span> Pastoral Counseling Dossier
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Interests & Activities</p>
                  <p className="text-gray-800 font-medium mt-0.5">
                    {Array.isArray(member.interests) ? member.interests.join(", ") : member.interests || "None"}
                  </p>
                </div>

                {member.verificationNotes && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Pastoral / Vetting Notes</p>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 italic border">
                      "{member.verificationNotes}"
                    </div>
                  </div>
                )}

                {member.videoIntroUrl && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Introduction Video</p>
                    <div className="rounded-lg overflow-hidden bg-black aspect-video max-w-md">
                      <video controls src={member.videoIntroUrl} className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Counselor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Assign Pastoral Counselor
            </h3>
            <p className="text-xs text-gray-500">
              Select an approved parish counselor to oversee {member.firstName} {member.lastName}'s vetting, relationship mentoring, and debriefs.
            </p>

            <form onSubmit={handleAssignCounselor} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Parish Counselor
                </label>
                <select
                  value={selectedCounselorId}
                  onChange={(e) => setSelectedCounselorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a counselor...</option>
                  {counselors.map((c) => (
                    <option key={c.accountId || c.id} value={c.accountId || c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignCounselorMutation.isPending || !selectedCounselorId}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {assignCounselorMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailPage;
