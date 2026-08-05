import React, { createContext, useContext, useState, useEffect } from "react";

interface ProjectContextType {
  activeProjectId: number;
  setActiveProjectId: (id: number) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  activeProjectId: 1,
  setActiveProjectId: () => {},
});

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProjectId, setActiveProjectIdState] = useState<number>(() => {
    const saved = localStorage.getItem("targetx_active_project_id");
    return saved ? parseInt(saved, 10) : 1;
  });

  const setActiveProjectId = (id: number) => {
    setActiveProjectIdState(id);
    localStorage.setItem("targetx_active_project_id", id.toString());
  };

  return (
    <ProjectContext.Provider value={{ activeProjectId, setActiveProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
