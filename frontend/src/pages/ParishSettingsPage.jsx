import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChurchAdminDashboardQuery } from "../api/queries/churchAdmin";
import { useChurchQuery, useUpdateChurchMutation } from "../api/queries/churches";
import { Toast } from "../components/Toast";

export const ParishSettingsPage = () => {
  const { user: currentUser } = useAuth();
  const [toast, setToast] = useState(null);

  // Fetch church admin dashboard to resolve church ID
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

  const churchData = churchQuery.data?.data?.church || dashboardQuery.data?.data?.church;

  const [formData, setFormData] = useState({
    officialName: "",
    aka: "",
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

  useEffect(() => {
    if (churchData) {
      setFormData({
        officialName: churchData.officialName || "",
        aka: churchData.aka || "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedChurchId) {
      setToast({ type: "error", message: "Parish ID could not be identified." });
      return;
    }

    try {
      const response = await updateChurchMutation.mutateAsync({
        id: resolvedChurchId,
        data: formData,
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
        message: err?.response?.data?.message || err?.message || "Failed to update parish settings",
      });
    }
  };

  const isLoading = dashboardQuery.isLoading || churchQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Loading parish settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Parish Profile & Pastoral Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your church branch details, official pastoral oversight, and congregant contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Church Information Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
                value={formData.officialName}
                onChange={(e) => setFormData({ ...formData, officialName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Also Known As (AKA / Branch Alias)
              </label>
              <input
                type="text"
                value={formData.aka}
                onChange={(e) => setFormData({ ...formData, aka: e.target.value })}
                placeholder="e.g. City of David, Grace Sanctuary"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Parish Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Parish Phone *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Location & Address Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
                value={formData.country}
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
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                City / LGA
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Full Street Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 15 Kingdom Way, Victoria Island"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Senior Pastor Leadership Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
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
                value={formData.pastorName}
                onChange={(e) => setFormData({ ...formData, pastorName: e.target.value })}
                placeholder="e.g. Pastor John Doe"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Pastor Email
              </label>
              <input
                type="email"
                value={formData.pastorEmail}
                onChange={(e) => setFormData({ ...formData, pastorEmail: e.target.value })}
                placeholder="pastor@church.org"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Pastor Phone
              </label>
              <input
                type="text"
                value={formData.pastorPhone}
                onChange={(e) => setFormData({ ...formData, pastorPhone: e.target.value })}
                placeholder="+234..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={updateChurchMutation.isPending}
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
          >
            {updateChurchMutation.isPending ? "Saving Changes..." : "Save Parish Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParishSettingsPage;
