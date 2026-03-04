import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Ban,
  CheckCircle2,
  Church,
  Eye,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserPen,
  XCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, Button, Toast } from "../components";
import {
  useChurchAdminCounselorsQuery,
  useAssignCounselorMutation,
} from "../api/queries/churchAdmin";
import {
  useAdminUpdateUserStatusMutation,
  useAdminVerifyUserMutation,
} from "../api/queries/admin";
import { useVerifyCounselorUserMutation } from "../api/queries/counselor";
import {
  useUserProfileQuery,
  useUpdateUserMutation,
} from "../api/queries/users";

const UserDashboard = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const viewedAccountId = id || user?.id;

  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCounselorAccountId, setSelectedCounselorAccountId] =
    useState("");
  const [formData, setFormData] = useState({
    originCountry: "",
    originState: "",
    originLga: "",
    residenceCountry: "",
    residenceState: "",
    residenceCity: "",
    residenceAddress: "",
    occupation: "",
    interests: "",
    matchPreference: "my_church",
  });

  const mapProfileToFormData = (currentProfile) => ({
    originCountry: currentProfile?.originCountry || "",
    originState: currentProfile?.originState || "",
    originLga: currentProfile?.originLga || "",
    residenceCountry: currentProfile?.residenceCountry || "",
    residenceState: currentProfile?.residenceState || "",
    residenceCity: currentProfile?.residenceCity || "",
    residenceAddress: currentProfile?.residenceAddress || "",
    occupation: currentProfile?.occupation || "",
    interests: currentProfile?.interests
      ? JSON.stringify(currentProfile.interests)
      : "",
    matchPreference: currentProfile?.matchPreference || "my_church",
  });

  const profileQuery = useUserProfileQuery(viewedAccountId, {
    enabled: Boolean(viewedAccountId),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onError: () =>
      setToast({ type: "error", message: "Failed to fetch profile" }),
  });

  const updateProfileMutation = useUpdateUserMutation();
  const adminVerifyMutation = useAdminVerifyUserMutation();
  const adminStatusMutation = useAdminUpdateUserStatusMutation();
  const counselorVerifyMutation = useVerifyCounselorUserMutation();
  const assignCounselorMutation = useAssignCounselorMutation();

  const profile =
    profileQuery.data?.success && profileQuery.data?.data?.user
      ? profileQuery.data.data.user
      : null;

  const isOwnProfile =
    Boolean(profile?.accountId) && user?.id === profile.accountId;
  const isHigherRoleViewer = Boolean(profile?.accountId) && !isOwnProfile;
  const canEditProfile = isOwnProfile;

  const canSuperAdminManage = user?.role === "SuperAdmin" && !isOwnProfile;
  const canCounselorManage = user?.role === "Counselor" && !isOwnProfile;
  const canChurchAdminManage = user?.role === "ChurchAdmin" && !isOwnProfile;

  const churchAdminCounselorsQuery = useChurchAdminCounselorsQuery(
    profile?.church?.id,
    {},
    {
      enabled: canChurchAdminManage && Boolean(profile?.church?.id),
      staleTime: 1000 * 60 * 2,
      onError: () =>
        setToast({ type: "error", message: "Failed to fetch counselors" }),
    },
  );

  const counselors = churchAdminCounselorsQuery.data?.success
    ? churchAdminCounselorsQuery.data.data.counselors || []
    : [];

  const profileName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    }
    return "User";
  }, [profile?.firstName, profile?.lastName]);

  const isLoadingInitialProfile = profileQuery.isLoading && !profile;
  const anyActionLoading =
    updateProfileMutation.isPending ||
    adminVerifyMutation.isPending ||
    adminStatusMutation.isPending ||
    counselorVerifyMutation.isPending ||
    assignCounselorMutation.isPending;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        interests: formData.interests ? JSON.parse(formData.interests) : null,
      };
      const response = await updateProfileMutation.mutateAsync({
        id: viewedAccountId,
        data: updateData,
      });
      if (response.success) {
        setToast({ type: "success", message: "Profile updated successfully!" });
        setIsEditing(false);
      }
    } catch {
      setToast({ type: "error", message: "Failed to update profile" });
    }
  };

  const handleSuperAdminVerify = async (isVerified) => {
    if (!profile?.accountId) return;
    try {
      const response = await adminVerifyMutation.mutateAsync({
        accountId: profile.accountId,
        isVerified,
      });
      if (response.success) {
        setToast({
          type: "success",
          message: `User ${isVerified ? "verified" : "unverified"} successfully`,
        });
      }
    } catch {
      setToast({ type: "error", message: "Failed to update verification" });
    }
  };

  const handleSuperAdminStatus = async (status) => {
    if (!profile?.accountId) return;
    try {
      const response = await adminStatusMutation.mutateAsync({
        accountId: profile.accountId,
        status,
      });
      if (response.success) {
        setToast({
          type: "success",
          message: `User ${status === "active" ? "activated" : "suspended"} successfully`,
        });
      }
    } catch {
      setToast({ type: "error", message: "Failed to update account status" });
    }
  };

  const handleCounselorDecision = async (status) => {
    if (!profile?.accountId) return;
    try {
      const response = await counselorVerifyMutation.mutateAsync({
        userAccountId: profile.accountId,
        status,
        notes: "",
      });
      if (response.success) {
        setToast({
          type: "success",
          message: `User ${status === "verified" ? "verified" : "rejected"} successfully`,
        });
      }
    } catch {
      setToast({ type: "error", message: "Action not allowed for this user" });
    }
  };

  const handleAssignCounselor = async () => {
    if (
      !profile?.accountId ||
      !selectedCounselorAccountId ||
      !profile?.church?.id
    ) {
      setToast({ type: "error", message: "Select a counselor first" });
      return;
    }

    try {
      const response = await assignCounselorMutation.mutateAsync({
        userAccountId: profile.accountId,
        counselorAccountId: selectedCounselorAccountId,
        churchId: profile.church.id,
      });
      if (response.success) {
        setToast({
          type: "success",
          message: "Counselor assigned successfully",
        });
      }
    } catch {
      setToast({ type: "error", message: "Failed to assign counselor" });
    }
  };

  const sidebar = (
    <nav className="space-y-2">
      <div className="px-4 py-2 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600">Verification Status</p>
        <p className="font-semibold text-gray-900">
          {profile?.verificationStatus || "pending"}
        </p>
      </div>
      <div className="px-4 py-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">Account Status</p>
        <p className="font-semibold text-gray-900">
          {profile?.accountStatus || "active"}
        </p>
      </div>
      {profile?.isEmailVerified && (
        <div className="px-4 py-2 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">Email</p>
          <p className="font-semibold text-green-700">Verified</p>
        </div>
      )}
    </nav>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      {isLoadingInitialProfile && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      )}

      {!isLoadingInitialProfile && profileQuery.isError && (
        <Card>
          <div className="space-y-3">
            <p className="text-red-600">Failed to load profile data.</p>
            <Button onClick={() => profileQuery.refetch()} variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!isLoadingInitialProfile && !profileQuery.isError && profile && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {isHigherRoleViewer ? (
                  <>
                    <Eye className="w-7 h-7 text-blue-600" />
                    {`Viewing ${profileName}'s Dashboard`}
                  </>
                ) : (
                  "My Profile"
                )}
              </h1>
            </div>
            {canEditProfile && (
              <Button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    return;
                  }
                  setFormData(mapProfileToFormData(profile));
                  setIsEditing(true);
                }}
                variant={isEditing ? "secondary" : "primary"}
              >
                <span className="inline-flex items-center gap-2">
                  <UserPen className="w-4 h-4" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </span>
              </Button>
            )}
          </div>

          <Card title={`${isEditing ? "Edit Account Information" : "Account Information"}`}>
            {!isEditing && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600">First Name</label>
                <p className="font-semibold text-gray-900">
                  {profile.firstName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Name</label>
                <p className="font-semibold text-gray-900">
                  {profile.lastName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-semibold text-gray-900">
                  {profile.phone || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email Verified</label>
                <p
                  className={`font-semibold ${profile.isEmailVerified ? "text-green-600" : "text-red-600"}`}
                >
                  {profile.isEmailVerified ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Status</label>
                <p className="font-semibold text-gray-900">
                  {profile.accountStatus || "active"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Created At</label>
                <p className="font-semibold text-gray-900">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Verification</label>
                <p className="font-semibold text-gray-900 uppercase">
                  {profile.verificationStatus || "pending"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Subscription Tier
                </label>
                <p className="font-semibold text-gray-900 uppercase">
                  {profile.subscriptionTier || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Subscription Status
                </label>
                <p className="font-semibold text-gray-900">
                  {profile.subscriptionStatus || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Origin Country</label>
                <p className="font-semibold text-gray-900">
                  {profile.originCountry || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Origin State</label>
                <p className="font-semibold text-gray-900">
                  {profile.originState || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Origin LGA</label>
                <p className="font-semibold text-gray-900">
                  {profile.originLga || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Residence Country
                </label>
                <p className="font-semibold text-gray-900">
                  {profile.residenceCountry || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Residence State</label>
                <p className="font-semibold text-gray-900">
                  {profile.residenceState || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Residence City</label>
                <p className="font-semibold text-gray-900">
                  {profile.residenceCity || "N/A"}
                </p>
              </div>
              <div className="lg:col-span-2">
                <label className="text-sm text-gray-600">
                  Residence Address
                </label>
                <p className="font-semibold text-gray-900">
                  {profile.residenceAddress || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Occupation</label>
                <p className="font-semibold text-gray-900">
                  {profile.occupation || "N/A"}
                </p>
              </div>
              <div className="lg:col-span-2">
                <label className="text-sm text-gray-600">Interests</label>
                <p className="font-semibold text-gray-900">
                  {Array.isArray(profile.interests)
                    ? profile.interests.join(", ") || "N/A"
                    : profile.interests || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Match Preference
                </label>
                <p className="font-semibold text-gray-900">
                  {profile.matchPreference || "N/A"}
                </p>
              </div>
            </div>}

            {isEditing && canEditProfile && (
              
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origin Country
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.originCountry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originCountry: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origin State
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.originState}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originState: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origin LGA
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.originLga}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originLga: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residence Country
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.residenceCountry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            residenceCountry: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residence State
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.residenceState}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            residenceState: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residence City
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.residenceCity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            residenceCity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residence Address
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.residenceAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            residenceAddress: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.occupation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            occupation: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Match Preference
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.matchPreference}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            matchPreference: e.target.value,
                          })
                        }
                      >
                        <option value="my_church">My Church</option>
                        <option value="my_church_plus">My Church +</option>
                        <option value="other_churches">Other Churches</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={anyActionLoading}>
                      Save Changes
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

          <Card title="Church Information" subtitle="">
            {profile.church ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Church className="w-4 h-4" />
                    Name
                  </p>
                  <p className="font-semibold text-gray-900">
                    {profile.church.officialName || profile.church.aka || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Church AKA</p>
                  <p className="font-semibold text-gray-900">
                    {profile.church.aka}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No church assigned.</p>
            )}
          </Card>

          <Card title="Assigned Counselor" subtitle="">
            {profile.assignedCounselor ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Counselor
                  </p>
                  <p className="font-semibold text-gray-900">
                    {profile.assignedCounselor.firstName}{" "}
                    {profile.assignedCounselor.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">
                    {profile.assignedCounselor.email || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No counselor assigned.</p>
            )}
          </Card>

          {profile.isVerified && (
            <Card title="Verification Status">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <p
                    className={`font-semibold text-lg ${
                      profile.verificationStatus === "verified"
                        ? "text-green-600"
                        : profile.verificationStatus === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {profile.verificationStatus?.toUpperCase() || "PENDING"}
                  </p>
                </div>
                {profile.verificationNotes && (
                  <div>
                    <label className="text-sm text-gray-600">Notes</label>
                    <p className="text-gray-900">{profile.verificationNotes}</p>
                  </div>
                )}
                {profile.verifiedAt && (
                  <div>
                    <label className="text-sm text-gray-600">
                      Verified Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(profile.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card title="Subscription">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600">Tier</label>
                <p className="font-semibold text-gray-900 uppercase">
                  {profile.subscriptionTier}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <p
                  className={`font-semibold ${profile.subscriptionStatus === "active" ? "text-green-600" : "text-gray-600"}`}
                >
                  {profile.subscriptionStatus}
                </p>
              </div>
            </div>
          </Card>

          {(canSuperAdminManage ||
            canCounselorManage ||
            canChurchAdminManage) && (
            <Card
              title="Role Actions"
              subtitle="Actions available for your role"
            >
              <div className="flex flex-col gap-4">
                {canSuperAdminManage && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={profile.isVerified ? "secondary" : "success"}
                      onClick={() =>
                        handleSuperAdminVerify(!profile.isVerified)
                      }
                      disabled={anyActionLoading}
                    >
                      <span className="inline-flex items-center gap-2">
                        {profile.isVerified ? (
                          <ShieldX className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        {profile.isVerified ? "Unverify User" : "Verify User"}
                      </span>
                    </Button>
                    <Button
                      variant={
                        profile.accountStatus === "active"
                          ? "danger"
                          : "success"
                      }
                      onClick={() =>
                        handleSuperAdminStatus(
                          profile.accountStatus === "active"
                            ? "suspended"
                            : "active",
                        )
                      }
                      disabled={anyActionLoading}
                    >
                      <span className="inline-flex items-center gap-2">
                        {profile.accountStatus === "active" ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {profile.accountStatus === "active"
                          ? "Suspend User"
                          : "Activate User"}
                      </span>
                    </Button>
                  </div>
                )}

                {canCounselorManage && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="success"
                      onClick={() => handleCounselorDecision("verified")}
                      disabled={anyActionLoading}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Verify User
                      </span>
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleCounselorDecision("rejected")}
                      disabled={anyActionLoading}
                    >
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Reject User
                      </span>
                    </Button>
                  </div>
                )}

                {canChurchAdminManage && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <select
                      className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg"
                      value={selectedCounselorAccountId}
                      onChange={(e) =>
                        setSelectedCounselorAccountId(e.target.value)
                      }
                      disabled={
                        churchAdminCounselorsQuery.isLoading || anyActionLoading
                      }
                    >
                      <option value="">Select counselor</option>
                      {counselors.map((counselor) => (
                        <option
                          key={counselor.accountId}
                          value={counselor.accountId}
                        >
                          {counselor.firstName} {counselor.lastName}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleAssignCounselor}
                      disabled={anyActionLoading}
                    >
                      Assign Counselor
                    </Button>
                  </div>
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
    </DashboardLayout>
  );
};

export default UserDashboard;
