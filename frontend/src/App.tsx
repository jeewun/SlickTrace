import React, { useState, useEffect } from 'react';
import { TopNav } from './components/layout/TopNav';
import { OperationsPage } from './pages/OperationsPage';
import { EvidencePage } from './pages/EvidencePage';
import { SARScene, SuspectLead } from './types';
import { fetchScenes, fetchSuspectRanking } from './api/client';

export function App() {
  const [activeSubTab, setActiveSubTab] = useState<string>('Map');

  const [scenes, setScenes] = useState<SARScene[]>([]);
  const [selectedScene, setSelectedScene] = useState<SARScene | null>(null);

  const [leads, setLeads] = useState<SuspectLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<SuspectLead | null>(null);

  // Load preset scene feed & initial suspect ranking on mount
  useEffect(() => {
    async function initData() {
      try {
        const scns = await fetchScenes();
        setScenes(scns);
        if (scns.length > 0) {
          setSelectedScene(scns[0]);
          const ranking = await fetchSuspectRanking(scns[0].slick_lat, scns[0].slick_lon);
          setLeads(ranking);
          if (ranking.length > 0) {
            setSelectedLead(ranking[0]);
          }
        }
      } catch (err) {
        console.error('Error initializing SpillGuard data:', err);
      }
    }
    initData();
  }, []);

  const handleSelectScene = async (scene: SARScene) => {
    setSelectedScene(scene);
    try {
      const ranking = await fetchSuspectRanking(scene.slick_lat, scene.slick_lon);
      setLeads(ranking);
      if (ranking.length > 0) {
        setSelectedLead(ranking[0]);
      }
    } catch (err) {
      console.error('Error fetching ranking for scene:', err);
    }
  };

  const subNavTabs = ['Map', 'Evidence'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <TopNav />

      {/* Case Sub-Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-1">
          {subNavTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                activeSubTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Router */}
      <main className="flex-1">
        {activeSubTab === 'Map' && (
          <OperationsPage
            scenes={scenes}
            selectedScene={selectedScene}
            onSelectScene={handleSelectScene}
            leads={leads}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            onNavigateToEvidence={() => setActiveSubTab('Evidence')}
          />
        )}

        {activeSubTab === 'Evidence' && (
          <EvidencePage
            selectedLead={selectedLead}
            onBackToMap={() => setActiveSubTab('Map')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
