import React, { useEffect, useId, useRef, useState } from 'react';
import { Activity, ArrowLeftRight, ArrowUpRight, Bell, Building2, Check, CheckCheck, ChevronDown, Info, LogIn, Moon, MoreHorizontal, Search, ShieldAlert, Sun, TrendingUp, UserRound, X } from 'lucide-react';
import { Notification } from './NotificationCenter';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import './Header.css';

interface HeaderProps {
  activeView?: 'workspace' | 'research';
  referenceMode?: boolean;
  onExitReference?: () => void;
  onLiveDataClick?: () => void;
  onAnalyticsClick?: () => void;
  onSearchClick?: () => void;
  onComparisonClick?: () => void;
  onLogoClick?: () => void;
  onEnterpriseIntelligenceClick?: () => void;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onDismissNotification?: (id: string) => void;
}

const FlowLogo: React.FC<{ className?: string }> = ({ className }) => {
  const gradientId = useId();
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill={`url(#${gradientId})`} opacity="0.1" />
      <path d="M25 35 Q50 15 75 35 Q50 55 25 35" fill={`url(#${gradientId})`} opacity="0.8" />
      <path d="M25 50 Q50 30 75 50 Q50 70 25 50" fill={`url(#${gradientId})`} opacity="0.6" />
      <path d="M25 65 Q50 45 75 65 Q50 85 25 65" fill={`url(#${gradientId})`} opacity="0.4" />
      <circle cx="25" cy="50" r="3" fill="#3B82F6" />
      <circle cx="75" cy="50" r="3" fill="#8B5CF6" />
    </svg>
  );
};

type HeaderPanel = 'more' | 'status' | 'notifications' | null;

const Header: React.FC<HeaderProps> = ({
  activeView,
  referenceMode = false,
  onExitReference,
  onLiveDataClick,
  onAnalyticsClick,
  onSearchClick,
  onComparisonClick,
  onLogoClick,
  onEnterpriseIntelligenceClick,
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onClearAllNotifications = () => {},
  onDismissNotification = () => {}
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [panel, setPanel] = useState<HeaderPanel>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeTrigger = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();
  const currentView = activeView || (window.location.hash.startsWith('#/research') ? 'research' : 'workspace');
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const accountName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';

  useEffect(() => {
    if (!panel) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setPanel(null);
    };
    const handleFocus = (event: FocusEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setPanel(null);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanel(null);
        activeTrigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('keydown', handleKey);
    const frame = requestAnimationFrame(() => {
      const firstItem = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"], button, a') || [])
        .find(item => item.getClientRects().length > 0);
      firstItem?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keydown', handleKey);
    };
  }, [panel]);

  const togglePanel = (next: Exclude<HeaderPanel, null>, trigger: HTMLButtonElement) => {
    activeTrigger.current = trigger;
    setPanel(previous => previous === next ? null : next);
  };

  const runAction = (action?: () => void) => {
    setPanel(null);
    action?.();
  };

  const handleMenuKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'))
      .filter(item => item.getClientRects().length > 0);
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 :
      event.key === 'ArrowDown' ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
    items[next].focus();
  };

  return (
    <header className="flow-header" ref={headerRef}>
      <div className="flow-header-bar">
        <button onClick={onLogoClick} className="flow-brand" title="Back to Home" aria-label="Flow home">
          <FlowLogo className="flow-brand-mark" />
          <span>Flow<span className="flow-brand-period">.</span></span>
        </button>

        <nav className="flow-header-nav" aria-label="Main navigation">
          <a href="#/plan" aria-label="Entry planner" aria-current={currentView === 'workspace' ? 'page' : undefined} onClick={() => setPanel(null)}>Workspace</a>
          <a href="#/research" aria-label="Research library" aria-current={currentView === 'research' ? 'page' : undefined} onClick={() => setPanel(null)}>Research library</a>
          <button onClick={() => runAction(onLiveDataClick)} aria-label="Market Data">Market Data</button>
        </nav>

        <div className="flow-header-tools">
          <button
            className={`flow-data-status${referenceMode ? ' flow-data-status-reference' : ''}`}
            aria-label={referenceMode ? 'Data status: unverified reference examples enabled' : 'Data status: unverified sources'}
            aria-expanded={panel === 'status'}
            aria-controls={panel === 'status' ? `${panelId}-status` : undefined}
            onClick={event => togglePanel('status', event.currentTarget)}
          >
            <span className="flow-status-dot" aria-hidden="true" />
            <span className="flow-status-desktop">{referenceMode ? 'Examples enabled' : 'Unverified sources'}</span>
            <span className="flow-status-mobile">{referenceMode ? 'Examples on' : 'Unverified'}</span>
            <ChevronDown size={12} aria-hidden="true" />
          </button>
          <button
            className={`flow-more-button${panel === 'more' ? ' is-open' : ''}`}
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={panel === 'more'}
            aria-controls={panel === 'more' ? `${panelId}-more` : undefined}
            onClick={event => togglePanel('more', event.currentTarget)}
            onKeyDown={event => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                activeTrigger.current = event.currentTarget;
                setPanel('more');
              }
            }}
          >
            <MoreHorizontal size={20} aria-hidden="true" />
            <span>More</span>
            {unreadCount > 0 && <span className="flow-unread-dot" aria-label={`${unreadCount} unread notifications`} />}
          </button>
          {user ? (
            <button className="flow-account-button" aria-label={`Account: ${accountName}`} onClick={event => togglePanel('more', event.currentTarget)}>
              <span>{user.email?.[0]?.toUpperCase() || 'A'}</span>
            </button>
          ) : (
            <button className="flow-sign-in" onClick={() => { setPanel(null); setShowAuthModal(true); }} aria-label="Sign in">
              <LogIn size={16} aria-hidden="true" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>

      {panel === 'more' && (
        <div className="flow-header-popover flow-more-menu" id={`${panelId}-more`} ref={panelRef} role="menu" aria-label="More options" onKeyDown={handleMenuKeys}>
          <div className="flow-mobile-navigation">
            <p className="flow-menu-heading">Explore Flow</p>
            <a href="#/plan" role="menuitem" aria-label="Entry planner" onClick={() => setPanel(null)}><span>Workspace</span><ArrowUpRight size={15} aria-hidden="true" /></a>
            <a href="#/research" role="menuitem" aria-label="Research library" onClick={() => setPanel(null)}><span>Research library</span><ArrowUpRight size={15} aria-hidden="true" /></a>
            <button role="menuitem" aria-label="Market Data" onClick={() => runAction(onLiveDataClick)}><TrendingUp size={17} aria-hidden="true" /><span>Market Data</span></button>
            <div className="flow-menu-divider" />
          </div>
          <p className="flow-menu-heading">Research tools</p>
          {onSearchClick && <button role="menuitem" aria-label="Search" onClick={() => runAction(onSearchClick)}><Search size={17} aria-hidden="true" /><span>Search</span><kbd>Ctrl K</kbd></button>}
          {onComparisonClick && <button role="menuitem" aria-label="Compare" onClick={() => runAction(onComparisonClick)}><ArrowLeftRight size={17} aria-hidden="true" /><span>Compare markets</span><kbd>Ctrl C</kbd></button>}
          <button role="menuitem" aria-label="Analytics" onClick={() => runAction(onAnalyticsClick)}><Activity size={17} aria-hidden="true" /><span>Analytics</span></button>
          {onEnterpriseIntelligenceClick && <button role="menuitem" aria-label="Enterprise Intelligence" onClick={() => runAction(onEnterpriseIntelligenceClick)}><Building2 size={17} aria-hidden="true" /><span>Enterprise intelligence</span><kbd>Ctrl E</kbd></button>}
          <div className="flow-menu-divider" />
          <button role="menuitem" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}<span>{theme === 'dark' ? 'Light appearance' : 'Dark appearance'}</span></button>
          <button role="menuitem" aria-label="Notifications" onClick={() => setPanel('notifications')}><Bell size={17} aria-hidden="true" /><span>Notifications</span><span className="flow-menu-count">{unreadCount || '0'}</span></button>
          {user && <div className="flow-menu-account"><UserRound size={17} aria-hidden="true" /><div><strong>{accountName}</strong><span>{user.email}</span></div></div>}
          <div className="flow-menu-footer">Southeast Asia, in perspective.</div>
        </div>
      )}

      {panel === 'status' && (
        <div className="flow-header-popover flow-status-panel" id={`${panelId}-status`} ref={panelRef} role="dialog" aria-labelledby={`${panelId}-status-title`}>
          <div className="flow-popover-title">
            <ShieldAlert size={19} aria-hidden="true" />
            <h2 id={`${panelId}-status-title`}>{referenceMode ? 'Reference examples enabled' : 'Know your sources'}</h2>
            <button className="flow-popover-close" aria-label="Close data status" onClick={() => { setPanel(null); activeTrigger.current?.focus(); }}>
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          {referenceMode ? (
            <>
              <p><strong>Unverified reference examples enabled.</strong> Static examples and unverified records are not current market facts.</p>
              <p>Source attributions and observation dates have not been verified. Examples never supply evidence or points to your entry assessment.</p>
              {onExitReference && <button className="flow-hide-examples" onClick={() => runAction(onExitReference)}>Hide examples</button>}
            </>
          ) : (
            <>
              <p>Research library · Sources are not independently verified; missing data remains unavailable.</p>
              <p>Your workspace uses the evidence you add. Source quality and observation dates need your review.</p>
            </>
          )}
          <a href="#/plan" className="flow-status-link" onClick={() => setPanel(null)}>Build a sourced assessment <ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      )}

      {panel === 'notifications' && (
        <div className="flow-header-popover flow-notifications-panel" ref={panelRef} role="dialog" aria-labelledby={`${panelId}-notifications-title`}>
          <div className="flow-popover-title">
            <Bell size={19} aria-hidden="true" />
            <h2 id={`${panelId}-notifications-title`}>Notifications</h2>
            <button className="flow-popover-close" aria-label="Close notifications" onClick={() => { setPanel(null); activeTrigger.current?.focus(); }}>
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          {notifications.length > 0 ? (
            <>
              <div className="flow-notification-toolbar">
                <span>{unreadCount} unread</span>
                <button onClick={onClearAllNotifications}><CheckCheck size={14} aria-hidden="true" />Clear all</button>
              </div>
              <ul className="flow-notification-list">
                {notifications.map(notification => (
                  <li key={notification.id} className={notification.read ? '' : 'is-unread'} data-type={notification.type}>
                    {notification.type === 'warning' || notification.type === 'error' ? <ShieldAlert size={17} aria-hidden="true" /> : <Info size={17} aria-hidden="true" />}
                    <div>
                      <strong><span className="sr-only">{notification.type} notification: </span>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <time dateTime={notification.timestamp.toISOString()}>{notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                      <div className="flow-notification-actions">
                        {!notification.read && (
                          <button onClick={() => onMarkNotificationAsRead(notification.id)} aria-label={`Mark ${notification.title} as read`}>
                            <Check size={13} aria-hidden="true" />Mark as read
                          </button>
                        )}
                        <button onClick={() => onDismissNotification(notification.id)} aria-label={`Dismiss ${notification.title}`}>Dismiss</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flow-notifications-empty">
              <span><Bell size={25} aria-hidden="true" /></span>
              <strong>You’re all caught up</strong>
              <p>No notifications to show.</p>
            </div>
          )}
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

export default Header;
