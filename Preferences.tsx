import React, { useEffect, useState } from "react";
import ProfileSidebar from "../../../components/reusable components/ProfileSidebar";
import { getNotificationPreferences, updateNotificationPreferences } from "../../../lib/api";

type NotificationKey = 'account' | 'community' | 'team' | 'grant_updates' | 'emailNotification';

interface NotificationState {
    account: boolean;
    community: boolean;
    team: boolean;
    grant_updates: boolean;
}

export default function Preferences() {
    const [appNotifications, setAppNotifications] = useState<NotificationState>({
        account: true,
        community: true,
        team: true,
        grant_updates: true
    });
    const [emailNotifications, setEmailNotifications] = useState<NotificationState>({
        account: true,
        community: true,
        team: true,
        grant_updates: true,
    })
    const [emailToggle, setEmailToggle] = useState(true);
    const [loading, setLoading] = useState(true);

    // Mobile dropdown state
    const [settingsOpen, setSettingsOpen] = useState(false);

    const SaveIcon = () => (
        <span className="material-icons text-[20px]">save</span>
    );

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const prefs = await getNotificationPreferences();
                if (prefs.app_notifications) {
                    setAppNotifications(prefs.app_notifications);
                }
                if (prefs.email_notifications) {
                    setEmailNotifications(prefs.email_notifications);
                    const allEnabled = prefs.email_notifications.community &&
                        prefs.email_notifications.team &&
                        prefs.email_notifications.grant_updates;
                    setEmailToggle(allEnabled);
                }
            } catch (error) {
                // error handling
            } finally {
                setLoading(false);
            }
        };
        loadPreferences();
    }, []);

    const handleToggle = (key: NotificationKey) => {
        if (key != "emailNotification") {
            setAppNotifications(prev => ({
                ...prev,
                [key]: !prev[key]
            }));
        } else {
            setEmailToggle(prev => !prev)
        }
    };

    useEffect(() => {
        setEmailNotifications((prev) => ({
            ...prev,
            community: emailToggle,
            team: emailToggle,
            grant_updates: emailToggle,
        }));
    }, [emailToggle]);

    const handleSave = async () => {
        try {
            await updateNotificationPreferences({
                app_notifications: appNotifications,
                email_notifications: emailNotifications
            });
            alert('Notification preferences saved successfully!');
        } catch (error) {
            alert('Failed to save notification preferences. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen gap-2 md:gap-5 p-2 md:p-3 bg-gray-50">
                <div className="hidden md:block w-64">
                    <ProfileSidebar />
                </div>
                <div className="flex-1 p-2">
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <p className="text-gray-500 text-center">Loading preferences...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen gap-2 md:gap-5 p-2 md:p-3 bg-gray-50">
            
            {/* Sidebar Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
                <ProfileSidebar />
            </div>

            {/* Mobile Dropdown (Same as Plans/Notification) */}
            <div className="md:hidden w-full">
                <button
                    onClick={() => setSettingsOpen((v) => !v)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm border border-[#E5E7EB] text-sm font-medium text-gray-700"
                >
                    <span className="flex items-center gap-2">
                        <span className="material-icons text-[20px] text-gray-500">menu</span>
                        Account Settings
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

            {/* Main Content Area */}
            <div className="flex-1 p-2 min-w-0 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 min-h-full">
                    
                    <div className="mb-8">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Notification</h1>
                        <p className="text-[#777B7F] text-sm md:text-base">
                            Manage your account preferences, profile details and app settings
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-1">Email Notification</h3>
                                    <p className="text-sm text-gray-500">Receive updates and announcements</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('emailNotification')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                ${emailToggle ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                            emailToggle ? 'translate-x-6 bg-black' : 'translate-x-1 bg-black'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-1">Community Notification</h3>
                                    <p className="text-sm text-gray-500">Receive updates and announcements</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('community')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                ${appNotifications.community ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                            appNotifications.community ? 'translate-x-6 bg-black' : 'translate-x-1 bg-black'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-1">Team Notification</h3>
                                    <p className="text-sm text-gray-500">Receive updates and announcements</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('team')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                ${appNotifications.team ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                            appNotifications.team ? 'translate-x-6 bg-black' : 'translate-x-1 bg-black'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-1">Get Latest Grant Updates</h3>
                                    <p className="text-sm text-gray-500">Receive latest grants in E-mail</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('grant_updates')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                ${appNotifications.grant_updates ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                            appNotifications.grant_updates ? 'translate-x-6 bg-black' : 'translate-x-1 bg-black'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button Container */}
                    <div className="flex justify-end mt-10">
                        <button
                            onClick={handleSave}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#93C893] hover:bg-green-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white sm:text-black"
                        >
                            <span>Save</span>
                            <SaveIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}