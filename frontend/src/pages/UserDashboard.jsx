import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { DashboardLayout } from "../features/dashboard/components/DashboardLayout";
import { Card, Button, Toast } from "../components";
import { userService, authService } from "../api/services";

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
    church: "",
    matchPreference: "my_church",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getProfile();
      if (response.success && response.data.user) {
        const userData = response.data.user;
        setProfile(userData);
        setFormData({
          originCountry: userData.originCountry || "",
          originState: userData.originState || "",
          originLga: userData.originLga || "",
          residenceCountry: userData.residenceCountry || "",
          residenceState: userData.residenceState || "",
          residenceCity: userData.residenceCity || "",
          residenceAddress: userData.residenceAddress || "",
          occupation: userData.occupation || "",
          interests: userData.interests
            ? JSON.stringify(userData.interests)
            : "",
          church: userData.churchId || "",
          matchPreference: userData.matchPreference || "my_church",
        });
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        interests: formData.interests ? JSON.parse(formData.interests) : null,
      };
      const response = await userService.updateProfile(updateData);
      if (response.success) {
        setToast({ type: "success", message: "Profile updated successfully!" });
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <nav className="space-y-2">
      <div className="px-4 py-2 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600">Status</p>
        <p className="font-semibold text-gray-900">
          {profile?.verificationStatus || "pending"}
        </p>
      </div>
      {profile?.isEmailVerified && (
        <div className="px-4 py-2 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">Email</p>
          <p className="font-semibold text-green-700">✓ Verified</p>
        </div>
      )}
    </nav>
  );

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "secondary" : "primary"}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Account Info Card */}
        <Card title="Account Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <p className="font-semibold text-gray-900">{user?.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <p className="font-semibold text-gray-900">
                {user?.lastName || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email Verified</label>
              <p
                className={`font-semibold ${user?.isEmailVerified ? "text-green-600" : "text-red-600"}`}
              >
                {user?.isEmailVerified ? "✓ Yes" : "✗ No"}
              </p>
            </div>
          </div>
        </Card>

        {/* Verification Status */}
        <Card title="Verification Status">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <p
                className={`font-semibold text-lg ${
                  profile?.verificationStatus === "verified"
                    ? "text-green-600"
                    : profile?.verificationStatus === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {profile?.verificationStatus?.toUpperCase() || "PENDING"}
              </p>
            </div>
            {profile?.verificationNotes && (
              <div>
                <label className="text-sm text-gray-600">Notes</label>
                <p className="text-gray-900">{profile.verificationNotes}</p>
              </div>
            )}
            {profile?.verifiedAt && (
              <div>
                <label className="text-sm text-gray-600">Verified Date</label>
                <p className="text-gray-900">
                  {new Date(profile.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Subscription Status */}
        {profile && (
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
              {profile.subscriptionExpiresAt && (
                <div>
                  <label className="text-sm text-gray-600">Expires</label>
                  <p className="font-semibold text-gray-900">
                    {new Date(
                      profile.subscriptionExpiresAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Profile Edit Form */}
        {isEditing && (
          <Card title="Edit Profile Information">
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
                      setFormData({ ...formData, originState: e.target.value })
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
                      setFormData({ ...formData, originLga: e.target.value })
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
                      setFormData({ ...formData, occupation: e.target.value })
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
                <Button type="submit" disabled={loading}>
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
          </Card>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50"
          style={{
            backgroundColor: toast.type === "success" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "success" ? "#166534" : "#991b1b",
            border: `2px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 font-bold">
              ✕
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;
