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
  const [availableYears, setAvailableYears] = useState<string[]>(AVAILABLE_YEARS);

  // Load from DB & localStorage on mount
  useEffect(() => {
    async function loadAcademicYears() {
      try {
        const res = await fetch("/api/admin/academic-years?active=true");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            const dbYears: string[] = Array.from(new Set(data.items.map((i: any) => String(i.year))));
            dbYears.sort((a, b) => Number(b) - Number(a));
            setAvailableYears(dbYears);

            // If user has no saved selection, default to DB current
            const savedYear = localStorage.getItem("techsar_academic_year");
            const savedSemester = localStorage.getItem("techsar_academic_semester");

            if (!savedYear && data.current?.year) {
              setSelectedYearState(data.current.year);
            } else if (savedYear && dbYears.includes(savedYear)) {
              setSelectedYearState(savedYear);
            }

            if (!savedSemester && data.current?.semester) {
              setSelectedSemesterState(data.current.semester);
            } else if (savedSemester) {
              setSelectedSemesterState(savedSemester);
            }
            return;
          }
        }
      } catch {
        // Fallback to local storage
      }

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
        // Ignore
      }
    }

    loadAcademicYears();
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
        availableYears,
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
