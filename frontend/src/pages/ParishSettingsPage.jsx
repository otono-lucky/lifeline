import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useChurchAdminDashboardQuery,
  useUpdateChurchAdminProfileMutation,
} from "../api/queries/churchAdmin";
import {
  useChurchQuery,
  useUpdateChurchMutation,
  useUploadChurchLogoMutation,
} from "../api/queries/churches";
import { useUpdateCounselorProfileMutation } from "../api/queries/counselor";
import { Toast } from "../components/Toast";

export const ParishSettingsPage = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("parish"); // 'parish' | 'account'
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch church admin dashboard to resolve church ID if not directly on user
  const dashboardQuery = useChurchAdminDashboardQuery(currentUser?.id, {
    staleTime: 1000 * 60 * 5,
  });

  const resolvedChurchId =
    currentUser?.churchId ||
    dashboardQuery.data?.data?.church?.id;

  const churchQuery = useChurchQuery(resolvedChurchId, {
    enabled: Boolean(resolvedChurchId),
  });

  const updateChurchMutation = useUpdateChurchMutation();
  const uploadLogoMutation = useUploadChurchLogoMutation();
  const updateChurchAdminProfileMutation = useUpdateChurchAdminProfileMutation();
  const updateCounselorProfileMutation = useUpdateCounselorProfileMutation();

  const churchData =
    churchQuery.data?.data?.church || dashboardQuery.data?.data?.church;

  // Parish Form Data
  const [parishForm, setParishForm] = useState({
    officialName: "",
    aka: "",
    logoUrl: "",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
    email: "",
    phone: "",
    pastorName: "",
    pastorEmail: "",
    pastorPhone: "",
  });

  // Staff Account Form Data
  const [staffForm, setStaffForm] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    phone: currentUser?.phone || "",
    title: currentUser?.title || "",
    bio: currentUser?.bio || "",
  });

  useEffect(() => {
    if (churchData) {
      setParishForm({
        officialName: churchData.officialName || "",
        aka: churchData.aka || "",
        logoUrl: churchData.logoUrl || "",
        country: churchData.country || "Nigeria",
        state: churchData.state || "",
        city: churchData.city || "",
        address: churchData.address || "",
        email: churchData.email || "",
        phone: churchData.phone || "",
        pastorName: churchData.pastorName || "",
        pastorEmail: churchData.pastorEmail || "",
        pastorPhone: churchData.pastorPhone || "",
      });
    }
  }, [churchData]);

  useEffect(() => {
    if (currentUser) {
      setStaffForm({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        phone: currentUser.phone || "",
        title: currentUser.title || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  // Handle Logo File Upload
  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!resolvedChurchId) {
      setToast({ type: "error", message: "Parish ID not found." });
      return;
    }

    try {
      const response = await uploadLogoMutation.mutateAsync({
        id: resolvedChurchId,
        file,
      });

      if (response?.data?.logoUrl || response?.logoUrl) {
        const newLogoUrl = response?.data?.logoUrl || response?.logoUrl;
        setParishForm((prev) => ({ ...prev, logoUrl: newLogoUrl }));
        setToast({
          type: "success",
          message: "Parish logo uploaded and saved successfully!",
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload church logo",
      });
    }
  };

  // Handle Parish Profile Submit
  const handleParishSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedChurchId) {
      setToast({ type: "error", message: "Parish ID could not be identified." });
      return;
    }

    try {
      const response = await updateChurchMutation.mutateAsync({
        id: resolvedChurchId,
        data: parishForm,
      });

      if (response.success) {
        setToast({
          type: "success",
          message: "Parish profile updated successfully!",
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update parish settings",
      });
    }
  };

  // Handle Staff Profile Submit
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser?.role === "ChurchAdmin") {
        await updateChurchAdminProfileMutation.mutateAsync({
          accountId: currentUser.id,
          data: {
            firstName: staffForm.firstName,
            lastName: staffForm.lastName,
            phone: staffForm.phone,
            title: staffForm.title,
          },
        });
      } else if (currentUser?.role === "Counselor") {
        await updateCounselorProfileMutation.mutateAsync({
          accountId: currentUser.id,
          data: {
            firstName: staffForm.firstName,
            lastName: staffForm.lastName,
            phone: staffForm.phone,
            bio: staffForm.bio,
          },
        });
      }

      setToast({
        type: "success",
        message: "Your staff account profile has been updated!",
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update your account profile",
      });
    }
  };

  const isLoading = dashboardQuery.isLoading || churchQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Loading parish settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          Parish Operations & Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your church brand identity, physical meeting location, pastoral leadership, and personal staff account.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-5 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("parish")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "parish"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>🏛️</span>
            <span>Parish Profile & Brand</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "account"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>👤</span>
            <span>My Staff Profile</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PARISH PROFILE & EMBLEM */}
      {activeTab === "parish" && (
        <form onSubmit={handleParishSubmit} className="space-y-6">
          {/* Church Emblem / Logo Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span>🖼️</span> Parish Emblem & Brand Logo
            </h2>
            <p className="text-xs text-gray-500">
              Upload your church's official emblem or crest. It appears in the navigation bar and on congregational discovery badges.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* Logo Preview */}
              <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {parishForm.logoUrl ? (
                  <img
                    src={parishForm.logoUrl}
                    alt="Parish Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-3xl">🏛️</span>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">No Logo</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-3 flex-1 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogoMutation.isPending}
                    className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition border border-blue-200 disabled:opacity-50"
                  >
                    {uploadLogoMutation.isPending ? "Uploading..." : "📁 Upload New Logo"}
                  </button>

                  {parishForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setParishForm((prev) => ({ ...prev, logoUrl: "" }))}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Or Direct Image URL
                  </label>
                  <input
                    type="url"
                    value={parishForm.logoUrl}
                    onChange={(e) =>
                      setParishForm({ ...parishForm, logoUrl: e.target.value })
                    }
                    placeholder="https://example.org/images/church-logo.png"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Basic Church Information Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b pb-2">
              Parish Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Official Parish Name *
                </label>
                <input
                  type="text"
                  required
                  value={parishForm.officialName}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, officialName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Also Known As (AKA / Branch Alias)
                </label>
                <input
                  type="text"
                  value={parishForm.aka}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, aka: e.target.value })
                  }
                  placeholder="e.g. City of David, Grace Sanctuary"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Parish Public Email *
                </label>
                <input
                  type="email"
                  required
                  value={parishForm.email}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Parish Public Phone *
                </label>
                <input
                  type="text"
                  required
                  value={parishForm.phone}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location & Address Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b pb-2">
              Physical Location & Parish Campus
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value={parishForm.country}
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={parishForm.state}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, state: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  City / LGA
                </label>
                <input
                  type="text"
                  value={parishForm.city}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, city: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Full Street Address
              </label>
              <input
                type="text"
                value={parishForm.address}
                onChange={(e) =>
                  setParishForm({ ...parishForm, address: e.target.value })
                }
                placeholder="e.g. 15 Kingdom Way, Victoria Island"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Senior Pastor Leadership Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span>✝️</span> Pastoral Leadership & Spiritual Oversight
            </h2>
            <p className="text-xs text-gray-500">
              Designated Senior Pastor or Resident Pastor overseeing parish ministry and spiritual adjudication.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Senior Pastor Name
                </label>
                <input
                  type="text"
                  value={parishForm.pastorName}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, pastorName: e.target.value })
                  }
                  placeholder="e.g. Pastor John Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Pastor Email
                </label>
                <input
                  type="email"
                  value={parishForm.pastorEmail}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, pastorEmail: e.target.value })
                  }
                  placeholder="pastor@church.org"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Pastor Phone
                </label>
                <input
                  type="text"
                  value={parishForm.pastorPhone}
                  onChange={(e) =>
                    setParishForm({ ...parishForm, pastorPhone: e.target.value })
                  }
                  placeholder="+234..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={updateChurchMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
            >
              {updateChurchMutation.isPending
                ? "Saving Changes..."
                : "Save Parish Profile"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MY PERSONAL STAFF ACCOUNT */}
      {activeTab === "account" && (
        <form onSubmit={handleStaffSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Staff Account Details
                </h2>
                <p className="text-xs text-gray-500">
                  Your credentials and ecclesiastical title displayed in courtship chats and pastoral notices.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {currentUser?.role === "ChurchAdmin"
                  ? "Church Administrator"
                  : currentUser?.role || "Staff"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.firstName}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.lastName}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Login Email
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400">
                  Contact SuperAdmin to alter administrative email.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Direct Contact Phone
                </label>
                <input
                  type="text"
                  value={staffForm.phone}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, phone: e.target.value })
                  }
                  placeholder="+234..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {currentUser?.role === "ChurchAdmin" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Ecclesiastical Title (e.g. Senior Pastor, Reverend Father, Imam, Resident Minister)
                  </label>
                  <input
                    type="text"
                    value={staffForm.title}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, title: e.target.value })
                    }
                    placeholder="e.g. Senior Pastor, Resident Minister"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    This title is displayed on your church admin badge across the platform.
                  </p>
                </div>
              )}

              {currentUser?.role === "Counselor" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Pastoral & Counseling Bio
                  </label>
                  <textarea
                    rows={3}
                    value={staffForm.bio}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, bio: e.target.value })
                    }
                    placeholder="Brief background on your ministry and family life counseling experience..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={
                updateChurchAdminProfileMutation.isPending ||
                updateCounselorProfileMutation.isPending
              }
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
            >
              {updateChurchAdminProfileMutation.isPending ||
              updateCounselorProfileMutation.isPending
                ? "Updating Profile..."
                : "Update My Staff Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ParishSettingsPage;
