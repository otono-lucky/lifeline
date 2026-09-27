import React from "react";
import { useAuth } from "../hooks/useAuth";
import ChurchAdminDashboard from "./ChurchAdminDashboard";
import CounselorDashboard from "./CounselorDashboard";
import VettingQueuePage from "./VettingQueuePage";
import MonitoredChatsPage from "./MonitoredChatsPage";
import ParishSettingsPage from "./ParishSettingsPage";

/**
 * ChurchPortalPage routes the unified /church/* views dynamically based on:
 * 1. The current route section (overview, members, vetting, counselors, matches, debriefs, settings)
 * 2. The logged-in user's role (ChurchAdmin, Counselor, SuperAdmin)
 */
export const ChurchPortalPage = ({ section = "overview" }) => {
  const { user } = useAuth();
  const role = user?.role;

  switch (section) {
    case "counselors":
      return <ChurchAdminDashboard bare defaultTab="counselors" />;

    case "settings":
      return <ParishSettingsPage />;

    case "vetting":
    case "debriefs":
      return <VettingQueuePage />;

    case "chats":
      return <MonitoredChatsPage />;

    case "matches":
      if (role === "Counselor") {
        return <CounselorDashboard bare defaultTab="matches" />;
      }
      return <ChurchAdminDashboard bare defaultTab="matches" />;

    case "members":
      if (role === "Counselor") {
        return <CounselorDashboard bare defaultTab="users" />;
      }
      return <ChurchAdminDashboard bare defaultTab="members" />;

    case "overview":
    default:
      if (role === "Counselor") {
        return <CounselorDashboard bare defaultTab="dashboard" />;
      }
      return <ChurchAdminDashboard bare defaultTab="overview" />;
  }
};

export default ChurchPortalPage;
