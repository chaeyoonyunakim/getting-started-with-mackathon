import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface StudentContextType {
  currentStudent: string;
  setCurrentStudent: (name: string) => void;
  isProfileSet: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [currentStudent, setCurrentStudentRaw] = useState(() => {
    try { return localStorage.getItem("currentStudent") ?? ""; } catch { return ""; }
  });

  const setCurrentStudent = useCallback((name: string) => {
    const trimmed = name.trim();
    setCurrentStudentRaw(trimmed);
    try { localStorage.setItem("currentStudent", trimmed); } catch {}
  }, []);

  return (
    <StudentContext.Provider
      value={{
        currentStudent,
        setCurrentStudent,
        isProfileSet: currentStudent.length > 0,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
};
