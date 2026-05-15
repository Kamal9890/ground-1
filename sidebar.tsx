import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const CloudIcon = () => <span className="material-icons text-[20px]">cloud</span>;
const LineChartIcon = () => <span className="material-icons text-[20px]">show_chart</span>;
const PenSquareIcon = () => <span className="material-icons text-[20px]">edit</span>;
const SearchIcon = () => <span className="material-icons text-[20px]">search</span>;
const LayoutDashboardIcon = () => <span className="material-icons text-[20px]">dashboard</span>;
const CloseIcon = () => <span className="material-icons text-[20px]">close</span>;
const MenuIcon = () => <span className="material-icons text-[20px]">menu</span>;
const UsersIcon = () => <span className="material-icons text-[20px]">groups</span>;
const HeadsetIcon = () => <span className="material-icons text-[20px]">headset</span>;
const BookOpenIcon = () => <span className="material-icons text-[20px]">import_contacts</span>;
const SettingsIcon = () => <span className="material-icons text-[20px]">settings</span>;
const ReportIcon = () => <span className="material-icons text-[20px]">assessment</span>;
const CrowdIcon = () => <span className="material-icons text-[20px]">volunteer_activism</span>;
const FundingIcon = () => <span className="material-icons text-[20px]">attach_money</span>;
const AudienceIcon = () => <span className="material-icons text-[20px]">group</span>;

interface SidebarProps {
  onProfileClick?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Item = ({
  to,
  icon,
  label,
  isCollapsed,
  hideWhenInactive,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
  hideWhenInactive?: boolean;
  onClick?: () => void;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });
  const location = useLocation();

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({ top: rect.top });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => setShowTooltip(false);

  const isActive =
    to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname === to || location.pathname.startsWith(to + "/");

  if (hideWhenInactive && !isActive) return null;

  return (
    <>
      <NavLink
        to={to}
        end={to === "/dashboard"}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={({ isActive }) =>
          [
            "flex items-center gap-3 px-3 py-2 rounded-[12px] transition relative group",
            isActive
              ? "bg-black/[0.2] text-white"
              : "hover:bg-black/[0.04] text-white/80",
            isCollapsed ? "justify-center" : "",
          ].join(" ")
        }
      >
        <span className="h-5 w-5 rounded-full grid place-items-center text-[#93C893] bg-[#202220] flex-shrink-0">
          {icon}
        </span>
        {!isCollapsed && (
          <span className="font-medium text-sm">{label}</span>
        )}
      </NavLink>

      {isCollapsed && showTooltip && (
        <div
          className="fixed left-[78px] bg-gray-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap z-[9999] shadow-lg pointer-events-none"
          style={{ top: `${tooltipPosition.top}px` }}
        >
          {label}
        </div>
      )}
    </>
  );
};

// ── Mobile Slide-out Drawer ──────────────────────────────────────────────────
const MobileSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const location = useLocation();
  const [isStartupOpen, setIsStartupOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={[
          "fixed left-0 top-0 h-full w-72 bg-[#202220] z-50 lg:hidden flex flex-col",
          "transition-transform duration-300 ease-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111827] flex-shrink-0">
          <div>
            <div className="font-semibold text-white">Main</div>
            <div className="text-xs text-gray-300">Navigation menu</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-white transition active:scale-95"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable nav list */}
        <div
          className="flex-1 overflow-y-auto p-3 flex flex-col gap-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Item to="/dashboard" icon={<LayoutDashboardIcon />} label="Dashboard" />

          <p className="pt-4 pb-1 px-2 text-white text-sm">Main</p>

          <Item to="/dashboard/discover"     icon={<SearchIcon />}    label="Discover"      />
          <Item to="/dashboard/write"        icon={<PenSquareIcon />} label="Write"         hideWhenInactive />
          <Item to="/dashboard/track"        icon={<LineChartIcon />} label="Track"         />
          <Item to="/dashboard/organize"     icon={<CloudIcon />}     label="Organize"      />
          <Item to="/dashboard/report"       icon={<ReportIcon />}    label="Report"        />
          <Item to="/dashboard/crowdfunding" icon={<CrowdIcon />}     label="Crowd Funding" />
          <Item to="/dashboard/audience"     icon={<AudienceIcon />}  label="Audience"      />

          <p className="pt-5 pb-1 px-2 text-white text-sm">General</p>

          {/* Startup Toolkit accordion */}
          <button
            onClick={() => setIsStartupOpen(p => !p)}
            className="flex items-center gap-3 px-3 py-2 rounded-[12px] text-white/80 hover:bg-black/[0.04] transition w-full"
          >
            <span className="h-5 w-5 rounded-full grid place-items-center text-[#93C893] bg-[#202220] flex-shrink-0">
              <BookOpenIcon />
            </span>
            <span className="font-medium text-sm flex-1 text-left">Startup Toolkit</span>
            <span className="text-lg leading-none">{isStartupOpen ? "−" : "+"}</span>
          </button>

          {isStartupOpen && (
            <div className="ml-8 flex flex-col gap-1">
              <Item to="/dashboard/fundingtoolkit" icon={<FundingIcon />} label="Funding Toolkit" />
            </div>
          )}

          <Item to="/dashboard/community"        icon={<UsersIcon />}    label="Community" />
          <Item to="/dashboard/support"           icon={<HeadsetIcon />}  label="Support"   />
          <Item to="/dashboard/accountmanagement" icon={<SettingsIcon />} label="Settings"  />
        </div>
      </div>
    </>
  );
};

// ── Main Sidebar Export ──────────────────────────────────────────────────────
export default function Sidebar({
  onProfileClick,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isStartupOpen, setIsStartupOpen] = useState(false);
  const [showStartupTooltip, setShowStartupTooltip] = useState(false);
  const [startupTooltipTop, setStartupTooltipTop] = useState(0);

  const location = useLocation();
  const savedGrantId = location.pathname.match(/\/dashboard\/write\/(\d+)/)?.[1];
  const writeLink = savedGrantId ? `/dashboard/write/${savedGrantId}` : "/dashboard/write";

  const handleStartupClick = () => {
    if (isCollapsed) {
      onToggleCollapse?.();
      setIsStartupOpen(true);
    } else {
      setIsStartupOpen(p => !p);
    }
  };

  return (
    <>
      {/* ── Hamburger button — mobile only, top-left ── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-[#202220] text-white rounded-lg shadow-lg hover:bg-[#2c302c] transition active:scale-95"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* ── Mobile drawer ── */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside
        className={`hidden lg:block flex-shrink-0 overflow-hidden py-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div
          className="h-full shadow border border-white/5 p-0 overflow-y-auto bg-[#202220]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {/* Sticky top header */}
          <div className="flex items-center justify-between mb-4 sticky top-0 z-50 bg-[#111827] p-2">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <div className="font-semibold text-white">Main</div>
                <div className="text-xs text-gray-300">Navigation menu</div>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`rounded-lg text-white hover:bg-gray-700 p-2 transition ${
                isCollapsed ? "w-full" : ""
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <MenuIcon />
            </button>
          </div>

          {/* Nav items */}
          <div className="flex flex-col gap-2 my-2 px-2">
            <Item to="/dashboard" icon={<LayoutDashboardIcon />} label="Dashboard" isCollapsed={isCollapsed} />

            {!isCollapsed && <p className="pt-5 px-2 text-white">Main</p>}

            <Item to="/dashboard/discover"     icon={<SearchIcon />}    label="Discover"      isCollapsed={isCollapsed} />
            <Item to={writeLink}               icon={<PenSquareIcon />} label="Write"         isCollapsed={isCollapsed} hideWhenInactive />
            <Item to="/dashboard/track"        icon={<LineChartIcon />} label="Track"         isCollapsed={isCollapsed} />
            <Item to="/dashboard/organize"     icon={<CloudIcon />}     label="Organize"      isCollapsed={isCollapsed} />
            <Item to="/dashboard/report"       icon={<ReportIcon />}    label="Report"        isCollapsed={isCollapsed} />
            <Item to="/dashboard/crowdfunding" icon={<CrowdIcon />}     label="Crowd Funding" isCollapsed={isCollapsed} />
            <Item to="/dashboard/audience"     icon={<AudienceIcon />}  label="Audience"      isCollapsed={isCollapsed} />

            {!isCollapsed && <p className="pt-5 px-2 text-white">General</p>}

            {/* Startup Toolkit accordion */}
            <div
              onClick={handleStartupClick}
              onMouseEnter={(e) => {
                if (isCollapsed) {
                  setStartupTooltipTop(e.currentTarget.getBoundingClientRect().top);
                  setShowStartupTooltip(true);
                }
              }}
              onMouseLeave={() => setShowStartupTooltip(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-[12px] cursor-pointer hover:bg-black/[0.04] text-white transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <span className="h-5 w-5 rounded-full grid place-items-center text-[#93C893] bg-[#202220] flex-shrink-0">
                <BookOpenIcon />
              </span>
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm flex-1">Startup Toolkit</span>
                  <span className="text-lg">{isStartupOpen ? "−" : "+"}</span>
                </>
              )}
            </div>

            {isCollapsed && showStartupTooltip && (
              <div
                className="fixed left-[78px] bg-gray-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap z-[9999] shadow-lg pointer-events-none"
                style={{ top: `${startupTooltipTop}px` }}
              >
                Startup Toolkit (click to expand)
              </div>
            )}

            {isStartupOpen && !isCollapsed && (
              <div className="ml-8 flex flex-col gap-1">
                <Item to="/dashboard/fundingtoolkit" icon={<FundingIcon />} label="Funding Toolkit" />
              </div>
            )}

            <Item to="/dashboard/community"        icon={<UsersIcon />}    label="Community" isCollapsed={isCollapsed} />
            <Item to="/dashboard/support"           icon={<HeadsetIcon />}  label="Support"   isCollapsed={isCollapsed} />
            <Item to="/dashboard/accountmanagement" icon={<SettingsIcon />} label="Settings"  isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
