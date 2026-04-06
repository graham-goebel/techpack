import { useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { ProjectOnboarding } from './components/onboarding/ProjectOnboarding';
import { useProject } from './hooks/useProject';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ProjectConfig } from './types';

function App() {
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
  } = useProject();

  const [, setSavedConfigs] = useLocalStorage<ProjectConfig[]>('tech-pack-saved', []);

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

  const inOnboarding = Boolean(config.projectTypeId && config.onboardingCompleted === false);

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
      />
      <MainContent
        config={config}
        tier={tier}
        onSave={handleSave}
        onToggleBlock={toggleBlock}
        onSetTechChoice={setTechChoice}
        onSetProjectType={setProjectType}
      />
    </div>
  );
}

export default App;
