import React, { useEffect, useState } from "react";
import ProfileSidebar from "../../../components/reusable components/ProfileSidebar";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../../lib/api";
import {
  listNotifications,
  unreadCount as getUnreadCount,
  markAllRead as apiMarkAllRead,
  markRead as apiMarkRead,
  NotificationItem,
} from "../../../api/notification";
import { Save } from "lucide-react";

type NotificationKey =
  | "emailNotification"
  | "communityNotification"
  | "teamNotification"
  | "grantUpdates";

interface NotificationState {
  emailNotification: boolean;
  communityNotification: boolean;
  teamNotification: boolean;
  grantUpdates: boolean;
}

export function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) {
    return "Just now";
  }

  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} min ago`;
  }

  if (diff < 86400) {
    const hrs = Math.floor(diff / 3600);
    return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  }

  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diff < 172800) {
    return `Yesterday • ${timePart}`;
  }

  const datePart = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${datePart} • ${timePart}`;
}

export default function Notification() {
  const [notifications, setNotifications] = useState<NotificationState>({
    emailNotification: true,
    communityNotification: true,
    teamNotification: true,
    grantUpdates: true,
  });
  const [saving, setSaving] = useState(false);

  // server notifications list
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [errorList, setErrorList] = useState<string>("");

  // Naya state mobile dropdown ke liye
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadPrefs = async () => {
    try {
      const prefs = await getNotificationPreferences();
      const email = prefs?.email_notifications ?? {};
      const app = prefs?.app_notifications ?? {};
      setNotifications({
        emailNotification:
          (email.account ?? app.account ?? true) as boolean,
        communityNotification:
          (email.community ?? app.community ?? true) as boolean,
        teamNotification: (email.team ?? app.team ?? true) as boolean,
        grantUpdates:
          (email.grant_updates ?? app.grant_updates ?? true) as boolean,
      });
    } catch {
    }
  };

  const loadServerNotifications = async () => {
    try {
      setLoadingList(true);
      setErrorList("");
      const [{ results }, unreadCnt] = await Promise.all([
        listNotifications({ page: 1, page_size: 25 }),
        getUnreadCount(),
      ]);
      setItems(results);
      setUnread(unreadCnt);
    } catch (e: any) {
      setErrorList(e?.response?.data?.error ||
        e?.response?.data?.message ||
         e?.response?.data?.detail || "Failed to load notifications");
      setItems([]);
      setUnread(0);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPrefs();
    loadServerNotifications();
  }, []);

  const handleToggle = (key: NotificationKey) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences({
        email_notifications: {
          account: notifications.emailNotification,
          community: notifications.communityNotification,
          team: notifications.teamNotification,
          grant_updates: notifications.grantUpdates,
        },
        app_notifications: {
          account: notifications.emailNotification,
          community: notifications.communityNotification,
          team: notifications.teamNotification,
          grant_updates: notifications.grantUpdates,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const markAllRead = async () => {
    await apiMarkAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const markOneRead = async (id: string | number, data: any) => {
    data.is_read = true;
    await apiMarkRead(id, data);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-2 md:gap-5 p-2 md:p-3 bg-gray-50">
      
      {/* Sidebar Desktop: Hidden on Mobile */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <ProfileSidebar />
      </div>

      {/* MOBILE DROPDOWN: Bilkul Plans Page Jaisa */}
      <div className="md:hidden w-full">
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm border border-[#E5E7EB] text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            <span className="material-icons text-[20px] text-gray-500">menu</span>
            Settings
          </span>
          <span 
            className="material-icons text-[20px] text-gray-400 transition-transform duration-200" 
            style={{ transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            expand_more
          </span>
        </button>

        {settingsOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden">
            <ProfileSidebar />
          </div>
        )}
      </div>

      <div className="flex-1 p-2 min-w-0 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8">
          {/* <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notification</h1>
            <p className="text-[#777B7F]">
              Manage your account preferences, profile details and app settings
            </p>
          </div> */}

          {/* Preferences */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    Email Notification
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates and announcements
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("emailNotification")}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      notifications.emailNotification
                        ? "translate-x-6 bg-black"
                        : "translate-x-1 bg-black"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    Community Notification
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates and announcements
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("communityNotification")}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      notifications.communityNotification
                        ? "translate-x-6 bg-black"
                        : "translate-x-1 bg-black"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    Team Notification
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates and announcements
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("teamNotification")}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      notifications.teamNotification
                        ? "translate-x-6 bg-black"
                        : "translate-x-1 bg-black"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    Grant Updates
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates and announcements
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("grantUpdates")}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      notifications.grantUpdates
                        ? "translate-x-6 bg-black"
                        : "translate-x-1 bg-black"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div> */}

          {/* <div className="flex justify-end mb-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#93C893] hover:bg-green-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
            >
              <span>{saving ? "Saving…" : "Save"}</span>
              <Save size={16} />
            </button>
          </div> */}

          {/* Notifications list */}
          {/* Notifications list header */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
  <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
  
  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
    <span className="text-sm text-[#6B7280]">
      {loadingList ? "…" : `${unread} unread`}
    </span>
    
    <div className="flex items-center gap-2">
      <button
        onClick={loadServerNotifications}
        className="h-9 w-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
        title="Refresh"
      >
        <span className="material-icons text-[18px] text-[#6B7280]">refresh</span>
      </button>
      
      <button
        onClick={markAllRead}
        disabled={!unread}
        className="px-3 h-9 rounded-lg border border-[#E5E7EB] text-sm font-medium hover:bg-gray-50 disabled:opacity-50 active:scale-95 transition-all whitespace-nowrap"
      >
        Mark all read
      </button>
    </div>
  </div>
</div>

{errorList && <div className="text-sm text-red-600 mb-4">{errorList}</div>}

{/* Notifications items */}
<div className="space-y-3">
  {items.map((n) => (
    <div
      key={String(n.id)}
      className={`p-4 rounded-xl border transition-all ${
        n.is_read ? "bg-gray-50 border-gray-100" : "bg-white border-emerald-100 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {!n.is_read && (
          <span className="mt-2.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {n.title}
            </div>
            {!n.is_read && (
              <button
                onClick={() => markOneRead(n.id, n)}
                className="self-start sm:self-center flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 bg-white transition-colors"
              >
                Mark read
              </button>
            )}
          </div>
          
          <div className="text-sm text-[#4B5563] leading-relaxed break-words">
            {n.message}
          </div>
          
          <div className="text-[11px] text-[#9AA0A6] mt-2 flex items-center gap-1">
            <span className="material-icons text-[14px]">schedule</span>
            {formatNotificationTime(n.created_at)}
          </div>
        </div>
      </div>
    </div>
  ))}

  {!loadingList && items.length === 0 && (
    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
      <p className="text-gray-400 text-sm">No notifications to show.</p>
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
}