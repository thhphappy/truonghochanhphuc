import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataProvider } from './provider';
import { ClassInfo, Student, Parent } from './types';

interface AppContextType {
  classes: ClassInfo[];
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  activeClass: ClassInfo | undefined;
  classInfo: ClassInfo | null;
  students: Student[];
  parents: Parent[];
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeStudent: Student | undefined;
  activeParent: Parent | undefined;
  refreshKey: number;
  refreshData: () => void;
  resetDemoData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [activeClassId, setActiveClassId] = useState<string>('class-11a2');
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('s-1');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const loadBaseData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cls, c, s, p] = await Promise.all([
        dataProvider.getClasses(),
        dataProvider.getClassInfo(),
        dataProvider.getStudents(),
        dataProvider.getParents(),
      ]);
      setClasses(cls);
      setClassInfo(c);
      setStudents(s);
      setParents(p);
      if (cls.length > 0 && !cls.some((item) => item.id === activeClassId)) {
        setActiveClassId(cls[0].id);
      }
      if (s.length > 0 && !s.some((st) => st.id === activeStudentId)) {
        setActiveStudentId(s[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial class data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeClassId, activeStudentId]);

  useEffect(() => {
    loadBaseData();
  }, [refreshKey, loadBaseData]);

  const resetDemoData = async () => {
    await dataProvider.seedData(true);
    refreshData();
  };

  const activeClass = classes.find((c) => c.id === activeClassId) || classInfo || classes[0];
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const activeParent = parents.find((p) => p.id === activeStudent?.parentId) || parents[0];

  return (
    <AppContext.Provider
      value={{
        classes,
        activeClassId,
        setActiveClassId,
        activeClass,
        classInfo: activeClass || classInfo,
        students,
        parents,
        activeStudentId,
        setActiveStudentId,
        activeStudent,
        activeParent,
        refreshKey,
        refreshData,
        resetDemoData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
