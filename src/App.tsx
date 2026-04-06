import { useCallback, useMemo, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ProjectOnboarding } from './components/onboarding/ProjectOnboarding';
import { PromptsHomePage } from './components/home/PromptsHomePage';
import { useProject } from './hooks/useProject';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ProjectConfig } from './types';
import { parseProjectConfig } from './utils/projectConfigParse';

function App() {
  const [appView, setAppView] = useState<'home' | 'workspace'>('home');

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

  const handleSave = useCallback(() => {
    setSavedConfigs((prev) => {
      const existing = prev.findIndex((c) => c.id === config.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = config;
        return updated;
      }
      return [...prev, config];
    });
  }, [config, setSavedConfigs]);

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

  if (appView === 'home') {
    return (
      <PromptsHomePage
        savedPrompts={normalizedSaved}
        currentConfig={config}
        onOpenPrompt={handleOpenSaved}
        onDeletePrompt={handleDeleteSaved}
        onNewPrompt={handleNewPrompt}
        onContinueSession={handleContinueSession}
      />
    );
  }

  if (inOnboarding) {
    return (
      <ProjectOnboarding
        config={config}
        tier={tier}
        onComplete={completeOnboarding}
        onChangeProjectType={() => setProjectType('')}
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
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {config.projectTypeId ? (
        <Sidebar
          config={config}
          tier={tier}
          onSetProjectType={setProjectType}
          onToggleBlock={toggleBlock}
          onSetTechChoice={setTechChoice}
          onSetName={setProjectName}
          onSetDescription={setProjectDescription}
          onSetTypeDetail={setTypeDetail}
          onSetModel={setModel}
          onSetTool={setTool}
          onToggleLibrary={toggleLibrary}
          onToggleIntegration={toggleIntegration}
          onAddResourceUrl={addResourceUrl}
          onAddResourceFile={addResourceFile}
          onRemoveResource={removeResource}
          onSave={handleSave}
          onGoHome={goHome}
        />
      ) : null}
      <MainContent
        config={config}
        tier={tier}
        onToggleBlock={toggleBlock}
        onSetTechChoice={setTechChoice}
        onSetProjectType={setProjectType}
        onGoHome={goHome}
      />
    </div>
  );
}

export default App;
