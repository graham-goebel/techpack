import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ProjectOnboarding } from './components/onboarding/ProjectOnboarding';
import { PromptsHomePage } from './components/home/PromptsHomePage';
import { ProjectTypeChangeConfirmModal } from './components/ui/ProjectTypeChangeConfirmModal';
import { HomeNavButton } from './components/ui/HomeNavButton';
import { useProject } from './hooks/useProject';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ProjectConfig } from './types';
import { parseProjectConfig } from './utils/projectConfigParse';

function App() {
  const [appView, setAppView] = useState<'home' | 'workspace'>('home');
  const [pendingProjectTypeId, setPendingProjectTypeId] = useState<string | null>(null);

  const {
    config,
    tier,
    setProjectType,
    completeOnboarding,
    toggleBlock,
    setTechChoice,
    setProjectName,
    setProjectDescription,
    setTypeDetail,
    setModel,
    setUseSubagents,
    setSubagentModel,
    setTool,
    toggleLibrary,
    toggleIntegration,
    addResourceUrl,
    addResourceFile,
    removeResource,
    hydrateWorkspace,
    resetWorkspace,
  } = useProject();

  const [savedConfigs, setSavedConfigs] = useLocalStorage<ProjectConfig[]>('tech-pack-saved', []);

  const normalizedSaved = useMemo(() => {
    if (!Array.isArray(savedConfigs)) return [];
    const out: ProjectConfig[] = [];
    for (const x of savedConfigs) {
      const c = parseProjectConfig(x, false);
      if (c && c.projectTypeId) out.push(c);
    }
    return out.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [savedConfigs]);

  const configRef = useRef(config);
  configRef.current = config;

  const upsertIntoSaved = useCallback(
    (snap: ProjectConfig) => {
      setSavedConfigs((prev) => {
        const ts = Date.now();
        const next = { ...snap, updatedAt: ts };
        const i = prev.findIndex((c) => c.id === next.id);
        if (i >= 0) {
          const out = [...prev];
          out[i] = next;
          return out;
        }
        return [...prev, next];
      });
    },
    [setSavedConfigs],
  );

  useEffect(() => {
    if (!config.projectTypeId) return;
    const t = window.setTimeout(() => {
      const snap = configRef.current;
      if (!snap.projectTypeId) return;
      upsertIntoSaved(snap);
    }, 500);
    return () => window.clearTimeout(t);
  }, [config.updatedAt, config.projectTypeId, config.id, upsertIntoSaved]);

  const requestSetProjectType = useCallback(
    (typeId: string) => {
      if (typeId === config.projectTypeId) return;
      if (!config.projectTypeId) {
        setProjectType(typeId);
        return;
      }
      setPendingProjectTypeId(typeId);
    },
    [config.projectTypeId, setProjectType],
  );

  const confirmProjectTypeModal =
    pendingProjectTypeId !== null ? (
      <ProjectTypeChangeConfirmModal
        pendingTypeId={pendingProjectTypeId}
        onCancel={() => setPendingProjectTypeId(null)}
        onConfirm={() => {
          setProjectType(pendingProjectTypeId);
          setPendingProjectTypeId(null);
        }}
      />
    ) : null;

  const goHome = useCallback(() => setAppView('home'), []);

  const handleOpenSaved = useCallback(
    (item: ProjectConfig) => {
      hydrateWorkspace(item);
      setAppView('workspace');
    },
    [hydrateWorkspace],
  );

  const handleDeleteSaved = useCallback(
    (id: string) => {
      setSavedConfigs((prev) => prev.filter((c) => c.id !== id));
    },
    [setSavedConfigs],
  );

  const handleNewPrompt = useCallback(() => {
    resetWorkspace();
    setAppView('workspace');
  }, [resetWorkspace]);

  const handleContinueSession = useCallback(() => setAppView('workspace'), []);

  const inOnboarding = Boolean(config.projectTypeId && config.onboardingCompleted === false);

  const homeCornerButton =
    appView === 'home' ? null : (
      <div className="fixed top-4 right-4 z-[220] sm:top-5 sm:right-6 pointer-events-auto">
        <HomeNavButton
          onClick={goHome}
          iconSize={18}
          className="border-rule bg-white/90 shadow-lg shadow-black/10 backdrop-blur-md"
        />
      </div>
    );

  if (appView === 'home') {
    return (
      <>
        {confirmProjectTypeModal}
        <PromptsHomePage
          savedPrompts={normalizedSaved}
          currentConfig={config}
          onOpenPrompt={handleOpenSaved}
          onDeletePrompt={handleDeleteSaved}
          onNewPrompt={handleNewPrompt}
          onContinueSession={handleContinueSession}
        />
      </>
    );
  }

  if (inOnboarding) {
    return (
      <>
        {confirmProjectTypeModal}
        {homeCornerButton}
        <ProjectOnboarding
          config={config}
          tier={tier}
          onComplete={completeOnboarding}
          onChangeProjectType={() => requestSetProjectType('')}
          onSetName={setProjectName}
          onSetDescription={setProjectDescription}
          onSetTypeDetail={setTypeDetail}
          onSetTool={setTool}
          onToggleBlock={toggleBlock}
          onToggleIntegration={toggleIntegration}
          onAddResourceUrl={addResourceUrl}
          onAddResourceFile={addResourceFile}
          onRemoveResource={removeResource}
        />
      </>
    );
  }

  return (
    <>
      {confirmProjectTypeModal}
      {homeCornerButton}
      <div className="flex h-screen overflow-hidden">
        {config.projectTypeId ? (
          <Sidebar
            config={config}
            tier={tier}
            onSetProjectType={requestSetProjectType}
            onToggleBlock={toggleBlock}
            onSetTechChoice={setTechChoice}
            onSetName={setProjectName}
            onSetDescription={setProjectDescription}
            onSetTypeDetail={setTypeDetail}
            onSetModel={setModel}
            onSetUseSubagents={setUseSubagents}
            onSetSubagentModel={setSubagentModel}
            onSetTool={setTool}
            onToggleLibrary={toggleLibrary}
            onToggleIntegration={toggleIntegration}
            onAddResourceUrl={addResourceUrl}
            onAddResourceFile={addResourceFile}
            onRemoveResource={removeResource}
          />
        ) : null}
        <MainContent
          config={config}
          tier={tier}
          onToggleBlock={toggleBlock}
          onSetTechChoice={setTechChoice}
          onToggleLibrary={toggleLibrary}
          onToggleIntegration={toggleIntegration}
          onSetProjectType={requestSetProjectType}
        />
      </div>
    </>
  );
}

export default App;
