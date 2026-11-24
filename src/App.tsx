import { lazy, useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, ArrowLeftRight, BarChart3, BookOpen, Compass, Globe2, Layers3, MapPin, Search, Sparkles, X } from 'lucide-react';
import Header from './components/Header';
import CountrySelector from './components/CountrySelector';
import type { Notification } from './components/NotificationCenter';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import CollaborationPanel from './components/CollaborationPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAuth } from './contexts/AuthContext';
import MarketResearch, { type ResearchMode } from './components/MarketResearch';
import MarketComparison from './components/MarketComparison';
import type { RestoreDraft } from './services/marketPlanRestore';
import { useMarketShortlist } from './hooks/useMarketShortlist';
import { useMarketPlans, type MarketPlanSession } from './hooks/useMarketPlans';
import { filterMarketGuides, MARKETS, type MarketRegion } from './data/marketCatalog';
import { SEA_COUNTRIES } from './components/visual/seaGeography';
import ToolPanel from './components/ToolPanel';
import { downloadMarketPlan } from './services/downloadMarketPlan';
import './components/MarketExplorer.css';

const EntryPlanner = lazy(() => import('./components/EntryPlanner'));
const MarketPlanHub = lazy(() => import('./components/MarketPlanHub'));
const LiveMarketData = lazy(() => import('./components/LiveMarketData'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const InstitutionalReports = lazy(() => import('./components/InstitutionalReports'));
const ReportGenerator = lazy(() => import('./components/ReportGenerator'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const DataPlayground = lazy(() => import('./components/DataPlayground'));
const ExportScheduler = lazy(() => import('./components/ExportScheduler'));
const DataRefreshDashboard = lazy(() => import('./components/DataRefreshDashboard'));
const EnterpriseIntelligenceDashboard = lazy(() => import('./components/EnterpriseIntelligenceDashboard'));
const ReferenceResearch = lazy(() => import('./components/ReferenceResearch'));
const ExportTools = lazy(() => import('./components/ExportTools'));
const ComparisonMode = lazy(() => import('./components/ComparisonMode'));

type ResearchView = 'main' | 'live-data' | 'analytics' | 'reports' | 'report-generator' | 'dashboard' | 'playground' | 'scheduler' | 'data-sync' | 'enterprise-intelligence';

const regions = [...new Set(MARKETS.map(market => market.region))];
const atlasMarkets = new Map(MARKETS.filter(market => market.region === 'Southeast Asia').map(market => [market.countryCode.toLowerCase(), market.id]));
const referenceCityByMarket: Readonly<Record<string, string>> = {
  thailand: 'bangkok', singapore: 'singapore-city', malaysia: 'kuala-lumpur',
  indonesia: 'jakarta', philippines: 'manila', vietnam: 'ho-chi-minh',
};

function ResearchWorkspace({ route, planSession, selectedCountries, setSelectedCountries, shortlistSaved, initialView = 'main', initialAction }: { route: string; planSession: MarketPlanSession; selectedCountries: string[]; setSelectedCountries: (change: (countries: string[]) => string[]) => void; shortlistSaved: boolean; initialView?: ResearchView; initialAction?: 'search' | 'compare' }) {
  const [selectedCities, setSelectedCities] = useState<string[]>(['singapore-city', 'bangkok']);
  const [activeTab, setActiveTab] = useState<ResearchMode>('overview');
  const [currentView, setView] = useState<ResearchView>(initialView);
  useEffect(() => { setView(initialView); }, [initialView]);
  const setCurrentView = (view: ResearchView) => {
    setView(view);
    window.location.hash = view === 'main' ? '/research' : `/research/${view}`;
  };
  const [activeInsightTab, setActiveInsightTab] = useState<string>('overview');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('technology');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<string>('grab-success');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonRequest, setComparisonRequest] = useState(0);
  const completedComparisonRequest = useRef(0);
  const [showSearch, setShowSearch] = useState(false);
  const [showReferenceExamples, setShowReferenceExamples] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<MarketRegion>();
  const [requestedCity, setRequestedCity] = useState<string | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (initialAction === 'compare') {
      setShowComparison(true);
      setComparisonRequest(request => request + 1);
    }
    if (initialAction === 'search') setShowSearch(true);
  }, [initialAction]);
  useEffect(() => {
    if (showSearch && currentView === 'main') requestAnimationFrame(() => searchInput.current?.focus());
  }, [showSearch, currentView]);
  const focusSearch = () => { setCurrentView('main'); setShowSearch(true); requestAnimationFrame(() => searchInput.current?.focus()); };
  const openComparison = () => {
    // Reassigning the same fragment can interrupt scrolling without a hashchange.
    if (window.location.hash === '#/research') setView('main');
    else setCurrentView('main');
    setShowComparison(true);
    setComparisonRequest(request => request + 1);
  };
  useEffect(() => {
    // Wait until the hash navigation (including its scroll reset) has committed.
    // Each explicit action gets one focus/scroll, even if the table is already open.
    if (!showComparison || currentView !== 'main' || route !== window.location.hash || comparisonRequest === completedComparisonRequest.current) return;
    const frame = requestAnimationFrame(() => {
      const comparison = document.getElementById('market-comparison');
      if (!comparison) return;
      comparison.focus({ preventScroll: true });
      // An immediate destination avoids interrupted browser scroll animations and
      // honors reduced motion without changing navigation elsewhere.
      comparison.scrollIntoView({ behavior: 'instant', block: 'start' });
      completedComparisonRequest.current = comparisonRequest;
    });
    return () => cancelAnimationFrame(frame);
  }, [showComparison, currentView, comparisonRequest, route]);
  function chooseMarkets() {
    setSearchQuery('');
    setRegion(undefined);
    requestAnimationFrame(() => {
      const markets = document.getElementById('explore-markets');
      markets?.focus({ preventScroll: true });
      markets?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }
  function includeMarket(countryId: string) {
    setSelectedCountries(previous => previous.includes(countryId) ? previous : [...previous, countryId]);
  }
  const openPlan = () => { window.location.hash = '/plan'; };
  const showMode = (mode: ResearchMode) => { setActiveTab(mode); requestAnimationFrame(() => document.getElementById('research-modes')?.scrollIntoView({ behavior: 'instant', block: 'start' })); };
  const exploreCountry = (countryId: string) => {
    includeMarket(countryId);
    if (showReferenceExamples && referenceCityByMarket[countryId]) {
      showMode('cities');
    } else {
      setShowReferenceExamples(false);
      setActiveTab('cities');
      setRequestedCity(countryId);
    }
  };
  useEffect(() => {
    if (!requestedCity || activeTab !== 'cities' || showReferenceExamples) return;
    const frame = requestAnimationFrame(() => {
      const city = document.getElementById(`city-research-${requestedCity}`);
      if (!city) return;
      city.focus({ preventScroll: true });
      city.scrollIntoView({ behavior: 'instant', block: 'start' });
      setRequestedCity(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [requestedCity, activeTab, showReferenceExamples]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [collaborationTarget] = useState({ type: '', id: '' });
  const { user } = useAuth();

  const handleCountryToggle = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(previous => previous.filter(id => id !== countryId));
    } else {
      includeMarket(countryId);
    }
  };

  const handleCityToggle = (cityId: string) => {
    setSelectedCities(prev =>
      prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  useEffect(() => {
    const welcomeNotification: Notification = {
      id: '1',
      type: 'info',
      title: 'Welcome to Flow',
      message: 'Explore the research library. Static and seeded material needs current source verification before business decisions.',
      timestamp: new Date(),
      read: false
    };
    setNotifications([welcomeNotification]);


  }, []);

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: focusSearch,
      description: 'Toggle search'
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      action: openComparison,
      description: 'Toggle comparison mode'
    },
    {
      key: 'l',
      ctrl: true,
      action: () => setCurrentView('live-data'),
      description: 'Go to market data'
    },
    {
      key: 'h',
      ctrl: true,
      action: () => setCurrentView('main'),
      description: 'Go to home'
    },
    {
      key: 'e',
      ctrl: true,
      action: () => setCurrentView('enterprise-intelligence'),
      description: 'Go to enterprise intelligence'
    },
    {
      key: '?',
      action: () => { setCurrentView('main'); setShowKeyboardHelp(true); },
      description: 'Show keyboard shortcuts'
    }
  ]);

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const countryComparisonData = [
    { name: 'Indonesia', gdp: 1320, population: 273.5, growth: 5.2, digitalAdoption: 73.4, marketSize: 287.2 },
    { name: 'Thailand', gdp: 543, population: 69.8, growth: 2.8, digitalAdoption: 85.2, marketSize: 127.4 },
    { name: 'Singapore', gdp: 397, population: 5.9, growth: 2.6, digitalAdoption: 92.3, marketSize: 89.6 },
    { name: 'Malaysia', gdp: 432, population: 32.7, growth: 4.5, digitalAdoption: 78.9, marketSize: 98.3 },
    { name: 'Philippines', gdp: 394, population: 109.6, growth: 6.2, digitalAdoption: 68.7, marketSize: 156.8 },
    { name: 'Vietnam', gdp: 409, population: 97.3, growth: 6.8, digitalAdoption: 75.3, marketSize: 142.1 }
  ];

  if ((currentView === 'dashboard' || currentView === 'scheduler') && !user) {
    return <div className="min-h-screen bg-slate-900 text-white">
      <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)} onLogoClick={() => setCurrentView('main')} onLiveDataClick={() => setCurrentView('live-data')} onAnalyticsClick={() => setCurrentView('analytics')} />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold">An account is required for this workspace</h2>
        <p className="text-slate-400 mt-4">Personal dashboards and scheduled exports require connected account services. Your entry research can be saved and exported from the guest planner.</p>
        <a href="#/plan" className="inline-block mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white">Return to entry planner</a>
      </main>
    </div>;
  }

  if (!showReferenceExamples && (currentView === 'analytics' || currentView === 'report-generator' || currentView === 'enterprise-intelligence')) {
    const title = currentView === 'analytics' ? 'Understand the market.' : currentView === 'enterprise-intelligence' ? 'See the bigger picture.' : 'Turn research into a brief.';
    const description = currentView === 'analytics' ? 'Find the series, source and period behind a useful comparison.' : currentView === 'enterprise-intelligence' ? 'Explore the questions, sources and operating details behind an expansion.' : 'Use source directories, build your entry plan, or inspect the existing report templates.';
    return <div className="flow-explore-shell">
      <Header referenceMode={false} onLogoClick={() => setCurrentView('main')} onLiveDataClick={() => setCurrentView('live-data')} onAnalyticsClick={() => setCurrentView('analytics')} onEnterpriseIntelligenceClick={() => setCurrentView('enterprise-intelligence')} onSearchClick={focusSearch} onComparisonClick={openComparison} />
      <main className="explorer-main explorer-module-page">
        <a href="#/research" className="explorer-back">← Explore markets</a>
        <header className="explorer-module-heading"><span className="explorer-eyebrow">{currentView === 'analytics' ? 'ANALYTICS & DATA' : currentView === 'enterprise-intelligence' ? 'MARKET INTELLIGENCE' : 'RESEARCH & REPORTS'}</span><h1>{title}</h1><p>{description}</p></header>
        <MarketResearch planSession={planSession} onIncludeMarket={includeMarket} mode={currentView === 'enterprise-intelligence' ? 'insights' : 'data'} selectedCountries={selectedCountries} onPlan={openPlan} onReference={() => setShowReferenceExamples(true)} onCompare={openComparison} onOpenData={() => setCurrentView('live-data')} onOpenReports={() => setCurrentView('reports')} />
        <section className="explorer-reference-callout"><div><BookOpen size={20} /><span><strong>{currentView === 'report-generator' ? 'Reference report templates' : 'Looking for the original examples?'}</strong><small>Existing examples have unverified sources and observation dates. They stay separate from your entry plan.</small></span></div><button onClick={() => setShowReferenceExamples(true)}>View unverified reference examples <ArrowRight size={15} /></button></section>
      </main>
    </div>;
  }

  if (currentView === 'live-data') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <ToolPanel name="Market data"><LiveMarketData /></ToolPanel>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <ToolPanel name="Analytics"><AnalyticsDashboard /></ToolPanel>
        <div className="fixed bottom-6 right-6 space-x-2 flex">
          <button
            onClick={() => setCurrentView('reports')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Reports →
          </button>
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'reports') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <ToolPanel name="Source directory"><InstitutionalReports /></ToolPanel>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-end gap-2 px-6 pb-6">
          <button
            onClick={() => setCurrentView('report-generator')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Generate Reports →
          </button>
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'report-generator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <ToolPanel name="Report generator"><ReportGenerator /></ToolPanel>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ToolPanel name="Account dashboard"><UserDashboard /></ToolPanel>
        </div>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'playground') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ToolPanel name="Data playground"><DataPlayground /></ToolPanel>
        </div>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'scheduler') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ToolPanel name="Export scheduler"><ExportScheduler /></ToolPanel>
        </div>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'data-sync') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ToolPanel name="Data sync"><DataRefreshDashboard /></ToolPanel>
        </div>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'enterprise-intelligence') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)}
          onLogoClick={() => setCurrentView('main')}
          onLiveDataClick={() => setCurrentView('live-data')}
          onAnalyticsClick={() => setCurrentView('analytics')}
          onSearchClick={() => { setCurrentView('main'); setShowSearch(true); }}
          onComparisonClick={openComparison}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />
        <ToolPanel name="Enterprise intelligence"><EnterpriseIntelligenceDashboard /></ToolPanel>
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setCurrentView('main')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ← Back to Research
          </button>
        </div>
      </div>
    );
  }
  const tabs: { id: ResearchMode; name: string; shortName: string; icon: typeof Globe2 }[] = [
    { id: 'overview', name: 'Market Overview', shortName: 'Overview', icon: Globe2 },
    { id: 'cities', name: 'City Analysis', shortName: 'Cities', icon: MapPin },
    { id: 'industries', name: 'Industry Deep Dive', shortName: 'Industries', icon: Layers3 },
    { id: 'insights', name: 'Market Intelligence', shortName: 'Intelligence', icon: Sparkles },
    { id: 'cases', name: 'Case Studies', shortName: 'Case studies', icon: BookOpen },
    { id: 'data', name: 'Data Visualization', shortName: 'Charts', icon: BarChart3 },
  ];
  const selectedMarkets = MARKETS.filter(market => selectedCountries.includes(market.id));
  const otherRegionCount = region ? selectedMarkets.filter(market => market.region !== region).length : 0;
  const matchingMarkets = filterMarketGuides(MARKETS, searchQuery, region);
  const referenceScope = selectedMarkets.length ? selectedMarkets : MARKETS;
  const referenceCountries = referenceScope.filter(market => referenceCityByMarket[market.id]).map(market => market.id);
  const referenceCityIds = referenceCountries.map(id => referenceCityByMarket[id]);
  const referenceCities = selectedCities.filter(city => referenceCityIds.includes(city));
  const outsideArchive = selectedMarkets.filter(market => !referenceCityByMarket[market.id]);
  const selectedShapeIds = new Set(selectedMarkets.map(market => market.countryCode.toLowerCase()));
  return <div className="flow-explore-shell">
    <Header activeView="research" referenceMode={showReferenceExamples} onExitReference={() => setShowReferenceExamples(false)} onLogoClick={() => setCurrentView('main')} onLiveDataClick={() => setCurrentView('live-data')} onAnalyticsClick={() => setCurrentView('analytics')} onEnterpriseIntelligenceClick={() => setCurrentView('enterprise-intelligence')} onSearchClick={focusSearch} onComparisonClick={openComparison} notifications={notifications} onMarkNotificationAsRead={handleMarkNotificationAsRead} onClearAllNotifications={handleClearAllNotifications} onDismissNotification={handleDismissNotification} />
    <main className="explorer-main">
      <section className="explorer-hero" aria-labelledby="explorer-title">
        <div className="explorer-hero-copy">
          <div className="explorer-eyebrow"><span /> {regions.join(' · ').toUpperCase()}</div>
          <h1 id="explorer-title">Find your next market.<br /><em>Make your move.</em></h1>
          <p>Explore countries, discover cities and understand what to research before you launch or expand.</p>
          <form className={`explorer-search${showSearch ? ' is-active' : ''}`} role="search" onSubmit={event => { event.preventDefault(); const results = document.getElementById('explore-markets'); results?.focus({ preventScroll: true }); results?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>
            <Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="market-search">Search markets or cities</label><input id="market-search" ref={searchInput} value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Try Singapore, Sydney or Dubai…" autoComplete="off" />{searchQuery && <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')}><X size={15} /></button>}<button type="submit" className="explorer-search-submit" aria-label="Search markets"><ArrowRight size={18} /></button>
          </form>
          <div className="explorer-hero-actions"><a href="#/plan" className="explorer-plan-link">Plan my entry <ArrowUpRight size={15} /></a><span>For founders, growing businesses & enterprises</span></div>
        </div>
        <div className="explorer-atlas" aria-label="Geographic context for Southeast Asia">
          <div className="atlas-orbit atlas-orbit-one" /><div className="atlas-orbit atlas-orbit-two" />
          <svg viewBox="0 0 740 630" aria-hidden="true" focusable="false"><defs><linearGradient id="explorer-land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3b82f6" /><stop offset="1" stopColor="#2dd4bf" /></linearGradient></defs>{SEA_COUNTRIES.map(country => <path key={country.id} d={country.path} data-market={atlasMarkets.get(country.id)} className={selectedShapeIds.has(country.id) ? 'atlas-country is-selected' : 'atlas-country'} />)}</svg>
          <div className="atlas-label atlas-label-north"><span>🇹🇭</span> Thailand <span>🇻🇳</span> Vietnam</div><div className="atlas-label atlas-label-east"><span>🇵🇭</span> Philippines</div><div className="atlas-label atlas-label-south"><span>🇸🇬</span> Singapore <span>🇲🇾</span> Malaysia</div><div className="atlas-label atlas-label-bottom"><span>🇮🇩</span> Indonesia</div>
          <div className="atlas-caption"><Compass size={14} /><span>Southeast Asia atlas</span><small>Geographic context · no market ranking</small></div>
        </div>
      </section>

      <nav className="explorer-mode-tabs" aria-label="Research modes">{tabs.map(({ id, name, shortName, icon: Icon }) => <button key={id} aria-label={name} aria-current={activeTab === id ? 'page' : undefined} onClick={() => showMode(id)}><Icon size={18} /><span className="mode-name-full">{name}</span><span className="mode-name-short" aria-hidden="true">{shortName}</span></button>)}</nav>

      <section className="explorer-markets" id="explore-markets" aria-labelledby="markets-title" tabIndex={-1}>
        <div className="explorer-section-heading"><div><span className="explorer-eyebrow">EXPLORE BY REGION</span><h2 id="markets-title">Build your market shortlist.</h2></div><div className="explorer-selection-actions"><span>{selectedCountries.length} selected</span><button onClick={openComparison}><ArrowLeftRight size={15} />Compare markets <span>{selectedCountries.length}</span></button></div></div>
        <div className="explorer-region-filters" role="group" aria-label="Filter market cards by region">
          <button type="button" aria-pressed={!region} onClick={() => setRegion(undefined)}>All regions <span>{MARKETS.length}</span></button>
          {regions.map(item => <button key={item} type="button" aria-pressed={region === item} onClick={() => setRegion(item)}>
            {item} <span>{MARKETS.filter(market => market.region === item).length}</span>
          </button>)}
        </div>
        {otherRegionCount > 0 && <p className="explorer-region-note">
          Your shortlist includes {otherRegionCount} {otherRegionCount === 1 ? 'market' : 'markets'} outside {region}.
        </p>}
        {searchQuery && <p role="status" className="explorer-search-count">{matchingMarkets.length} {matchingMarkets.length === 1 ? 'market' : 'markets'} matching “{searchQuery}” <button onClick={() => setSearchQuery('')}>Clear</button></p>}
        <CountrySelector region={region} onSearchAllRegions={() => { setRegion(undefined); document.getElementById('explore-markets')?.focus({ preventScroll: true }); }} selectedCountries={selectedCountries} onCountryToggle={handleCountryToggle} referenceMode={showReferenceExamples} showHeading={false} searchQuery={searchQuery} onExploreCountry={exploreCountry} />
        <div className="explorer-shortlist"><span title={shortlistSaved ? 'Saved on this browser' : 'Session only; export your shortlist to keep it'}>Your shortlist · {shortlistSaved ? 'saved here' : 'session only'}</span><div>{selectedMarkets.length ? selectedMarkets.map(market => <button key={market.id} onClick={() => handleCountryToggle(market.id)} aria-label={`Remove ${market.name} from shortlist`}>{market.flag} {market.name}<X size={11} /></button>) : <small>Select a market to tailor the research below. Selections stay in your shortlist when you switch regions.</small>}</div><a href="#/research/reports">Source directory <ArrowUpRight size={13} /></a></div>
      </section>

      {showComparison && <MarketComparison
        onChooseMarkets={chooseMarkets} selectedCountries={selectedCountries} onClose={() => setShowComparison(false)}
        onReference={() => setShowReferenceExamples(true)} referenceMode={showReferenceExamples}
      >
        {showReferenceExamples && referenceCountries.length > 0 && (
          <ToolPanel name="Reference comparison" onReturn={() => setShowReferenceExamples(false)}>
            <ComparisonMode key={referenceCountries.join(',')} availableCountries={countryComparisonData.filter(country => referenceCountries.includes(country.name.toLowerCase()))} />
          </ToolPanel>
        )}
      </MarketComparison>}

      <section className="explorer-research" id="research-modes" aria-labelledby="research-title">
        <h2 id="research-title" className="sr-only">From a place to a plan.</h2>

        {showReferenceExamples ? <><div className="explorer-reference-strip"><span><BookOpen size={14} />Unverified reference examples · observation dates unknown</span><button onClick={() => setShowReferenceExamples(false)}>Return to research guides <X size={13} /></button></div>
          {outsideArchive.length > 0 && <p className="explorer-archive-coverage" role="status">Reference examples cover six markets in Southeast Asia. For {outsideArchive.map(market => market.name).join(', ')}, use the historical figures and city guides.</p>}
          {referenceCountries.length > 0 && <ToolPanel name="Reference research" onReturn={() => setShowReferenceExamples(false)}>
            <ReferenceResearch mode={activeTab} selectedCountries={referenceCountries} selectedCities={referenceCities} onCityToggle={handleCityToggle} onIndustrySelect={setSelectedIndustry} onInsightTabChange={setActiveInsightTab} onCaseStudySelect={setSelectedCaseStudy} />
          </ToolPanel>}</> : <MarketResearch planSession={planSession} onIncludeMarket={includeMarket} mode={activeTab} selectedCountries={selectedCountries} onPlan={openPlan} onReference={() => setShowReferenceExamples(true)} onCompare={openComparison} onOpenData={() => setCurrentView('live-data')} onOpenReports={() => setCurrentView('reports')} />}
      </section>

      {showReferenceExamples && referenceCountries.length > 0 && <section className="explorer-export-section"><div className="explorer-section-heading"><div><span className="explorer-eyebrow">TAKE IT WITH YOU</span><h2>Reference report studio</h2></div><span className="explorer-data-note">Southeast Asia templates · not verified research</span></div>
        <ToolPanel name="Reference exports" onReturn={() => setShowReferenceExamples(false)}>
          <ExportTools selectedCountries={selectedCountries.length ? referenceCountries : []} selectedCities={referenceCities} activeTab={activeTab} activeInsightTab={activeInsightTab} selectedIndustry={selectedIndustry} selectedCaseStudy={selectedCaseStudy} />
        </ToolPanel>
      </section>}
      {!showReferenceExamples && <section className="explorer-reference-callout"><div><BookOpen size={20} /><span><strong>The original research collection, still here.</strong><small>Inspect existing charts, case studies and PDF, slide and spreadsheet templates as explicitly unverified examples.</small></span></div><button onClick={() => setShowReferenceExamples(true)}>View unverified reference examples <ArrowRight size={15} /></button></section>}

      <section className="explorer-next-step"><div><span className="explorer-eyebrow">YOUR BUSINESS. YOUR NEXT CHAPTER.</span><h2>Found a market worth exploring?</h2><p>Keep your assumptions, sources and city preparation together in your entry plan. Start whenever you're ready.</p></div><a href="#/plan">Plan my entry <ArrowUpRight size={18} /></a></section>
      <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
      <CollaborationPanel targetType={collaborationTarget.type} targetId={collaborationTarget.id} isOpen={showCollaboration} onClose={() => setShowCollaboration(false)} />
    </main>
    {!showComparison && <aside className="explorer-mobile-shortlist" aria-label="Your market shortlist"><div><span>{selectedMarkets.map(market => market.flag).join(' ') || <Globe2 size={21} />}</span><strong>{selectedCountries.length} selected</strong></div><button onClick={openComparison}>Compare shortlist <ArrowRight size={17} /></button></aside>}
    <footer className="explorer-footer"><span>Flow <i>·</i> Find your next market.</span><div><a href="#/research/reports">Sources</a><a href="#/plan">Your plan</a><button onClick={() => setShowKeyboardHelp(true)}>Keyboard shortcuts</button></div><small>Curated research guides & optional reference examples. AI consulting is not enabled.</small></footer>
  </div>;
}

const researchViews = new Set<ResearchView>(['main', 'live-data', 'analytics', 'reports', 'report-generator', 'dashboard', 'playground', 'scheduler', 'data-sync', 'enterprise-intelligence']);

export default function App() {
  const planSession = useMarketPlans();
  const [route, setRoute] = useState(() => window.location.hash);
  const shortlist = useMarketShortlist();
  const selectedCountries = shortlist.countries;

  function restorePlan(draft: RestoreDraft) {
    const plan = planSession.restoreDraft(draft, selectedCountries);
    const selection = shortlist.update(countries => [...new Set([...countries, ...draft.marketIds])]);
    return plan.savedLocally && selection.saved;
  }
  useEffect(() => {
    const onHashChange = (event: HashChangeEvent) => {
      if (window.location.hash === '' || window.location.hash.startsWith('#/')) {
        const navigation = new CustomEvent('flow:before-navigate', { cancelable: true, detail: window.location.hash });
        if (!window.dispatchEvent(navigation)) {
          window.history.replaceState(null, '', event.oldURL);
          return;
        }
        setRoute(window.location.hash);
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  if (!route.startsWith('#/plan')) {
    const requested = route.split('/')[2] as ResearchView;
    const initialView = researchViews.has(requested) ? requested : 'main';
    const initialAction = requested === ('search' as string) || requested === ('compare' as string) ? requested as 'search' | 'compare' : undefined;
    return <ResearchWorkspace planSession={planSession} route={route} selectedCountries={selectedCountries} setSelectedCountries={shortlist.update} shortlistSaved={shortlist.saved} initialView={initialView} initialAction={initialAction} />;
  }
  const isNotebook = route === '#/plan/notebook';
  const worksheetId = /^#\/plan\/worksheet\/([a-z-]+)$/.exec(route)?.[1];
  const question = /^#\/plan\/question\/([a-z-]+)\/(customers|location|setup)$/.exec(route);
  const focusTarget = worksheetId ? `break-even-${worksheetId}` : question && `question-${question[1]}-${question[2]}`;
  return <div className={isNotebook ? 'min-h-screen flow-planner-shell' : 'flow-explore-shell'}>
    <Header
      onLogoClick={() => { window.location.hash = '/research'; }}
      onLiveDataClick={() => { window.location.hash = '/research/live-data'; }}
      onAnalyticsClick={() => { window.location.hash = '/research/analytics'; }}
      onEnterpriseIntelligenceClick={() => { window.location.hash = '/research/enterprise-intelligence'; }}
    />
    {isNotebook ? (
      <ToolPanel name="City notebook"><EntryPlanner /></ToolPanel>
    ) : (
      <ToolPanel name="Market plan" onExportPlan={() => downloadMarketPlan(planSession.plans, selectedCountries)}>
        <MarketPlanHub onRestore={restorePlan} shortlistSaved={shortlist.saved} focusTarget={focusTarget} planSession={planSession} selectedCountries={selectedCountries} />
      </ToolPanel>
    )}
  </div>;
}
