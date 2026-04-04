import { useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { useProject } from './hooks/useProject';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ProjectConfig } from './types';

function App() {
  const {
    config,
    tier,
    setProjectType,
    toggleBlock,
    setTechChoice,
    setProjectName,
    setProjectDescription,
    setTypeDetail,
    setModel,
    toggleTool,
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
        onToggleTool={toggleTool}
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
