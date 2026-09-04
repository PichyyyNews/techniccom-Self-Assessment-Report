"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SemesterOption {
  value: string;
  label: string;
  shortLabel: string;
}

export const SEMESTER_OPTIONS: SemesterOption[] = [
  { value: "1", label: "ภาคเรียนที่ 1", shortLabel: "เทอม 1" },
  { value: "2", label: "ภาคเรียนที่ 2", shortLabel: "เทอม 2" },
  { value: "all", label: "ตลอดปีการศึกษา", shortLabel: "ทั้งปี" },
];

export const AVAILABLE_YEARS: string[] = ["2569", "2568", "2567", "2566", "2565"];

interface AcademicYearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
  availableYears: string[];
  availableSemesters: SemesterOption[];
  termLabel: string;
  shortTermLabel: string;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<string>("2568");
  const [selectedSemester, setSelectedSemesterState] = useState<string>("1");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedYear = localStorage.getItem("techsar_academic_year");
      if (savedYear && AVAILABLE_YEARS.includes(savedYear)) {
        setSelectedYearState(savedYear);
      }
      const savedSemester = localStorage.getItem("techsar_academic_semester");
      if (savedSemester && SEMESTER_OPTIONS.some((s) => s.value === savedSemester)) {
        setSelectedSemesterState(savedSemester);
      }
    } catch {
      // Ignore localStorage error (SSR or restricted mode)
    }
  }, []);

  const setSelectedYear = (year: string) => {
    setSelectedYearState(year);
    try {
      localStorage.setItem("techsar_academic_year", year);
    } catch {
      // Ignore
    }
  };

  const setSelectedSemester = (semester: string) => {
    setSelectedSemesterState(semester);
    try {
      localStorage.setItem("techsar_academic_semester", semester);
    } catch {
      // Ignore
    }
  };

  const currentSemester =
    SEMESTER_OPTIONS.find((s) => s.value === selectedSemester) || SEMESTER_OPTIONS[0];

  const termLabel = `ปีการศึกษา ${selectedYear} (${currentSemester.label})`;
  const shortTermLabel = `ปี ${selectedYear} / ${currentSemester.shortLabel}`;

  return (
    <AcademicYearContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        selectedSemester,
        setSelectedSemester,
        availableYears: AVAILABLE_YEARS,
        availableSemesters: SEMESTER_OPTIONS,
        termLabel,
        shortTermLabel,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error("useAcademicYear must be used within an AcademicYearProvider");
  }
  return context;
}
