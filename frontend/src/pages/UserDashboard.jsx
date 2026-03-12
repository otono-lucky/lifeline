import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  Church,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserCheck,
  UserPen,
  XCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, Button, Toast, Table, Modal } from "../components";
import {
  useUserProfileQuery,
  useUpdateUserMutation,
  useUserSocialMediaQuery,
  useCreateUserSocialMediaMutation,
  useDeleteUserSocialMediaMutation,
  useUploadProfileImageMutation,
} from "../api/queries/users";
import {
  useActiveMatchForAccountQuery,
  useActiveMatchQuery,
  useMatchDecisionMutation,
  useMatchHistoryForAccountQuery,
  useMatchHistoryQuery,
} from "../api/queries/matching";
import { useVerifyCounselorUserMutation } from "../api/queries/counselor";
import {
  useAdminUpdateUserStatusMutation,
  useAdminVerifyUserMutation,
} from "../api/queries/admin";

const SOCIAL_PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "X",
  "LinkedIn",
  "TikTok",
  "YouTube",
];

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "N/A";
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  const dayDiff = now.getDate() - date.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  return age;
};

const getInitials = (firstName, lastName) => {
  const first = firstName?.trim()?.[0] || "";
  const last = lastName?.trim()?.[0] || "";
  const value = `${first}${last}`.toUpperCase();
  return value || "U";
};

const UserDashboard = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const viewedAccountId = id || user?.id;
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineFeedback, setDeclineFeedback] = useState("");
  const [socialForm, setSocialForm] = useState({
    platform: SOCIAL_PLATFORM_OPTIONS[0],
    handleOrUrl: "",
  });
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    occupation: "",
    interests: "",
    videoIntroUrl: "",
    originCountry: "",
    originState: "",
    originLga: "",
    residenceCountry: "",
    residenceState: "",
    residenceCity: "",
    residenceAddress: "",
    matchPreference: "my_church",
  });

  const profileQuery = useUserProfileQuery(viewedAccountId, {
    enabled: Boolean(viewedAccountId),
  });
  const socialMediaQuery = useUserSocialMediaQuery(viewedAccountId, {
    enabled: Boolean(viewedAccountId),
  });

  const updateProfileMutation = useUpdateUserMutation();
  const uploadProfileImageMutation = useUploadProfileImageMutation();
  const createSocialMediaMutation = useCreateUserSocialMediaMutation();
  const deleteSocialMediaMutation = useDeleteUserSocialMediaMutation();
  const adminVerifyMutation = useAdminVerifyUserMutation();
  const adminStatusMutation = useAdminUpdateUserStatusMutation();
  const counselorVerifyMutation = useVerifyCounselorUserMutation();

  const profile = profileQuery.data?.data?.user || null;
  const socialMedia = socialMediaQuery.data?.data?.socialMedia || [];
  const isOwnProfile = profile?.accountId === user?.id;
  const canSuperAdminManage = user?.role === "SuperAdmin" && !isOwnProfile;
  const canCounselorManage = user?.role === "Counselor" && !isOwnProfile;
  const isViewingOther = Boolean(viewedAccountId && user?.id && viewedAccountId !== user?.id);
  const canViewOtherMatches =
    isViewingOther && ["SuperAdmin", "ChurchAdmin", "Counselor"].includes(user?.role);

  const anyActionLoading =
    updateProfileMutation.isPending ||
    uploadProfileImageMutation.isPending ||
    createSocialMediaMutation.isPending ||
    deleteSocialMediaMutation.isPending ||
    adminVerifyMutation.isPending ||
    adminStatusMutation.isPending ||
    counselorVerifyMutation.isPending;

  const activeMatchSelfQuery = useActiveMatchQuery({
    enabled: Boolean(viewedAccountId) && !canViewOtherMatches,
  });
  const activeMatchOtherQuery = useActiveMatchForAccountQuery(viewedAccountId, {
    enabled: Boolean(viewedAccountId) && canViewOtherMatches,
  });
  const matchHistorySelfQuery = useMatchHistoryQuery({
    enabled: Boolean(viewedAccountId) && !canViewOtherMatches,
  });
  const matchHistoryOtherQuery = useMatchHistoryForAccountQuery(viewedAccountId, {
    enabled: Boolean(viewedAccountId) && canViewOtherMatches,
  });
  const matchDecisionMutation = useMatchDecisionMutation();

  const activeMatchData = canViewOtherMatches
    ? activeMatchOtherQuery.data
    : activeMatchSelfQuery.data;
  const matchHistoryData = canViewOtherMatches
    ? matchHistoryOtherQuery.data
    : matchHistorySelfQuery.data;

  const activeMatch = activeMatchData?.data?.match || null;
  const matchHistory = matchHistoryData?.data?.matches || [];

  const matchLoading =
    activeMatchSelfQuery.isLoading ||
    activeMatchOtherQuery.isLoading ||
    activeMatchSelfQuery.isFetching ||
    activeMatchOtherQuery.isFetching;
  const matchHistoryLoading =
    matchHistorySelfQuery.isLoading ||
    matchHistoryOtherQuery.isLoading ||
    matchHistorySelfQuery.isFetching ||
    matchHistoryOtherQuery.isFetching;

  const startEdit = () => {
    if (!profile) return;
    setFormData({
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
        : "",
      occupation: profile.occupation || "",
      interests: profile.interests ? JSON.stringify(profile.interests) : "",
      videoIntroUrl: profile.videoIntroUrl || "",
      originCountry: profile.originCountry || "",
      originState: profile.originState || "",
      originLga: profile.originLga || "",
      residenceCountry: profile.residenceCountry || "",
      residenceState: profile.residenceState || "",
      residenceCity: profile.residenceCity || "",
      residenceAddress: profile.residenceAddress || "",
      matchPreference: profile.matchPreference || "my_church",
    });
    setIsEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfileMutation.mutateAsync({
        id: viewedAccountId,
        data: {
          ...formData,
          dateOfBirth: formData.dateOfBirth || null,
          interests: formData.interests ? JSON.parse(formData.interests) : null,
        },
      });
      if (response.success) {
        setToast({ type: "success", message: "Profile updated successfully" });
        setIsEditing(false);
      }
    } catch {
      setToast({ type: "error", message: "Failed to update profile" });
    }
  };

  const uploadAvatar = async (file) => {
    if (!file || !viewedAccountId) return;
    try {
      const response = await uploadProfileImageMutation.mutateAsync({
        id: viewedAccountId,
        file,
      });
      if (response.success) {
        setProfileImageError(false);
        setToast({ type: "success", message: "Profile image updated" });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Upload failed",
      });
    }
  };

  const handleMatchDecision = async (decision, feedback = "") => {
    if (!activeMatch?.id) return;
    try {
      const response = await matchDecisionMutation.mutateAsync({
        matchId: activeMatch.id,
        data: { decision, feedback: feedback || undefined },
      });
      if (response.success) {
        setToast({
          type: "success",
          message:
            decision === "ACCEPTED"
              ? "Match accepted"
              : "Match declined",
        });
        setShowDeclineModal(false);
        setDeclineFeedback("");
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to update match",
      });
    }
  };

  const matchHistoryColumns = [
    {
      key: "createdAt",
      label: "Date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
    { key: "status", label: "Status" },
    { key: "myDecision", label: "Your Decision" },
    {
      key: "participant",
      label: "Matched With",
      render: (_, row) =>
        row.participant
          ? `${row.participant.firstName} ${row.participant.lastName}`
          : "N/A",
    },
  ];

  const addSocial = async () => {
    if (!socialForm.handleOrUrl) return;
    try {
      await createSocialMediaMutation.mutateAsync({
        id: viewedAccountId,
        data: socialForm,
      });
      setSocialForm({ platform: SOCIAL_PLATFORM_OPTIONS[0], handleOrUrl: "" });
      setToast({ type: "success", message: "Social handle added" });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to add handle",
      });
    }
  };

  const sidebar = (
    <div className="space-y-2">
      <div className="px-4 py-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">Verification</p>
        <p className="font-semibold">
          {profile?.verificationStatus || "pending"}
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      {!profile && <p className="text-gray-600">Loading profile...</p>}
      {profile && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {!profile.profilePictureUrl || profileImageError ? (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-2xl font-bold">
                      {getInitials(profile.firstName, profile.lastName)}
                    </div>
                  ) : (
                    <img
                      src={profile.profilePictureUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                      onError={() => setProfileImageError(true)}
                    />
                  )}
                  {isOwnProfile && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          uploadAvatar(e.target.files?.[0] || null)
                        }
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.phone || "N/A"}
                  </p>
                </div>
              </div>
              {/* {isOwnProfile && (
                <Button
                  onClick={() =>
                    isEditing ? setIsEditing(false) : startEdit()
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <UserPen className="w-4 h-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </span>
                </Button>
              )} */}
            </div>
          </Card>

          <Card title="Church & Counselor Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Church className="w-4 h-4" />
                  Church
                </p>
                <p className="font-semibold">
                  {profile.church?.officialName || profile.church?.aka || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Assigned Counselor
                </p>
                <p className="font-semibold">
                  {profile.assignedCounselor
                    ? `${profile.assignedCounselor.firstName} ${profile.assignedCounselor.lastName}`
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {profile.assignedCounselor?.email || ""}
                </p>
              </div>
            </div>
          </Card>
          <Card
            title="Profile Details"
            subtitle="User details available to all roles with access"
          >
            {isOwnProfile && !isEditing && (
              <Button
                onClick={() => (isEditing ? setIsEditing(false) : startEdit())}
                className="mb-4"
              >
                <span className="inline-flex items-center gap-2">
                  <UserPen className="w-4 h-4" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </span>
              </Button>
            )}
            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <p>
                  <strong className="block">Gender:</strong>{" "}
                  {profile.gender || "N/A"}
                </p>
                <p>
                  <strong className="block">Age:</strong>{" "}
                  {calculateAge(profile.dateOfBirth)}
                </p>
                <p>
                  <strong className="block">Date of Birth:</strong>{" "}
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong className="block">Occupation:</strong>{" "}
                  {profile.occupation || "N/A"}
                </p>
                <p>
                  <strong className="block">Subscription:</strong>{" "}
                  {profile.subscriptionTier || "N/A"} /{" "}
                  {profile.subscriptionStatus || "N/A"}
                </p>
                <p>
                  <strong className="block">Match Preference:</strong>{" "}
                  {profile.matchPreference || "N/A"}
                </p>
                <p>
                  <strong className="block">Origin:</strong>{" "}
                  {[
                    profile.originCountry,
                    profile.originState,
                    profile.originLga,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </p>
                <p>
                  <strong className="block">Residence:</strong>{" "}
                  {[
                    profile.residenceCountry,
                    profile.residenceState,
                    profile.residenceCity,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </p>
                <p>
                  <strong className="block">Address:</strong>{" "}
                  {profile.residenceAddress || "N/A"}
                </p>
                <p className="md:col-span-2">
                  <strong className="block">Video Intro:</strong>{" "}
                  {profile.videoIntroUrl || "N/A"}
                </p>
                <p className="md:col-span-2">
                  <strong className="block">Interests:</strong>{" "}
                  {Array.isArray(profile.interests)
                    ? profile.interests.join(", ")
                    : profile.interests || "N/A"}
                </p>
              </div>
            )}

            {isEditing && (
              <form onSubmit={saveProfile} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="px-3 py-2 border rounded-lg"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Occupation"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Origin Country"
                    value={formData.originCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originCountry: e.target.value,
                      })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Origin State"
                    value={formData.originState}
                    onChange={(e) =>
                      setFormData({ ...formData, originState: e.target.value })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Origin LGA"
                    value={formData.originLga}
                    onChange={(e) =>
                      setFormData({ ...formData, originLga: e.target.value })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Residence Country"
                    value={formData.residenceCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residenceCountry: e.target.value,
                      })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Residence State"
                    value={formData.residenceState}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residenceState: e.target.value,
                      })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg"
                    placeholder="Residence City"
                    value={formData.residenceCity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residenceCity: e.target.value,
                      })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg md:col-span-2"
                    placeholder="Residence Address"
                    value={formData.residenceAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        residenceAddress: e.target.value,
                      })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded-lg md:col-span-2"
                    placeholder='Interests JSON e.g. ["music","books"]'
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={anyActionLoading}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

       

          <Card title="Social Media" subtitle="Curated platform options only">
            <div className="space-y-2 mb-4">
              {socialMedia.map((item) => (
                <div
                  key={item.id}
                  className=""
                >
                    <h3>{item.platform}</h3>
                  <div className="flex justify-between items-center border rounded-lg px-3 py-2">

                  <p>
                    <span className="text-gray-600">{item.handleOrUrl}</span>
                  </p>
                  {isOwnProfile && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        deleteSocialMediaMutation.mutateAsync({
                          id: viewedAccountId,
                          socialId: item.id,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  </div>
                </div>
              ))}
            </div>
            {isOwnProfile && socialMedia.length < 4 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={socialForm.platform}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, platform: e.target.value })
                  }
                >
                  {SOCIAL_PLATFORM_OPTIONS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                <input
                  className="px-3 py-2 border rounded-lg"
                  placeholder="Handle or URL"
                  value={socialForm.handleOrUrl}
                  onChange={(e) =>
                    setSocialForm({
                      ...socialForm,
                      handleOrUrl: e.target.value,
                    })
                  }
                />
                <Button onClick={addSocial}>
                  <span className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add
                  </span>
                </Button>
              </div>
            )}
          </Card>

   <Card title="Match Status" subtitle="Your active match and history">
            {matchLoading ? (
              <p className="text-gray-600">Loading match details...</p>
            ) : !activeMatch ? (
              <p className="text-gray-600">No active match right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {activeMatch.participant?.profilePictureUrl ? (
                      <img
                        src={activeMatch.participant.profilePictureUrl}
                        alt="Match"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-blue-700">
                        {getInitials(
                          activeMatch.participant?.firstName,
                          activeMatch.participant?.lastName,
                        )}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {activeMatch.participant?.firstName}{" "}
                      {activeMatch.participant?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activeMatch.participant?.age || "N/A"} •{" "}
                      {activeMatch.participant?.gender || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activeMatch.participant?.church?.officialName ||
                        activeMatch.participant?.church?.aka ||
                        "No church info"}
                    </p>
                  </div>
                </div>

                <div className="text-sm space-y-2">
                  <p>
                    <strong>Status:</strong> {activeMatch.status}
                  </p>
                  <p>
                    <strong>Decision:</strong> {activeMatch.myDecision}
                  </p>
                  <p>
                    <strong>Occupation:</strong>{" "}
                    {activeMatch.participant?.occupation || "N/A"}
                  </p>
                  <p>
                    <strong>Residence:</strong>{" "}
                    {[
                      activeMatch.participant?.residence?.city,
                      activeMatch.participant?.residence?.state,
                      activeMatch.participant?.residence?.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>

                <div className="text-sm space-y-2">
                  <p>
                    <strong>Interests:</strong>{" "}
                    {Array.isArray(activeMatch.participant?.interests)
                      ? activeMatch.participant.interests.join(", ")
                      : activeMatch.participant?.interests || "N/A"}
                  </p>
                  <p>
                    <strong>Social Media:</strong>{" "}
                    {activeMatch.participant?.socialMedia?.length
                      ? `${activeMatch.participant.socialMedia.length} handles`
                      : "N/A"}
                  </p>
                  {isOwnProfile && activeMatch.canDecide && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleMatchDecision("ACCEPTED")}
                        disabled={matchDecisionMutation.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setShowDeclineModal(true)}
                        disabled={matchDecisionMutation.isPending}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Match History</h3>
              <Table
                columns={matchHistoryColumns}
                data={matchHistory}
                loading={matchHistoryLoading}
              />
            </div>
          </Card>
          
          {(canSuperAdminManage || canCounselorManage) && (
            <Card title="Role Actions">
              <div className="flex flex-wrap gap-2">
                {canSuperAdminManage && (
                  <>
                    <Button
                      onClick={() =>
                        adminVerifyMutation.mutateAsync({
                          accountId: profile.accountId,
                          isVerified: !profile.isVerified,
                        })
                      }
                    >
                      {profile.isVerified ? "Unverify User" : "Verify User"}
                    </Button>
                    <Button
                      variant={
                        profile.accountStatus === "active"
                          ? "danger"
                          : "success"
                      }
                      onClick={() =>
                        adminStatusMutation.mutateAsync({
                          accountId: profile.accountId,
                          status:
                            profile.accountStatus === "active"
                              ? "suspended"
                              : "active",
                        })
                      }
                    >
                      {profile.accountStatus === "active"
                        ? "Suspend User"
                        : "Activate User"}
                    </Button>
                  </>
                )}
                {canCounselorManage && (
                  <>
                    <Button
                      variant="success"
                      onClick={() =>
                        counselorVerifyMutation.mutateAsync({
                          userAccountId: profile.accountId,
                          status: "verified",
                          notes: "",
                        })
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Verify
                      </span>
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        counselorVerifyMutation.mutateAsync({
                          userAccountId: profile.accountId,
                          status: "rejected",
                          notes: "",
                        })
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Decline Match"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeclineModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleMatchDecision("DECLINED", declineFeedback)}
              disabled={matchDecisionMutation.isPending || !declineFeedback.trim()}
            >
              Submit Decline
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please share a brief reason for declining this match.
          </p>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows="4"
            placeholder="Your feedback..."
            value={declineFeedback}
            onChange={(e) => setDeclineFeedback(e.target.value)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default UserDashboard;
