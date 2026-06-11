"use client";

import { useEffect, useState } from "react";
import { AuroraSelect } from "./AuroraSelect";

interface AuroraDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export function AuroraDatePicker({ value, onChange }: AuroraDatePickerProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [value]);

  useEffect(() => {
    if (year && month && day) {
      onChange(`${year}-${month}-${day}`);
    }
  }, [year, month, day]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }));

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const getDaysInMonth = (m: string, y: string) => {
    if (!m || !y) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return { value: d, label: d };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
      <div className="min-w-0">
        <AuroraSelect
          options={months}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="Month"
          searchable
        />
      </div>
      <div className="min-w-0">
        <AuroraSelect
          options={days}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="Day"
          searchable
        />
      </div>
      <div className="min-w-0">
        <AuroraSelect
          options={years}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          searchable
        />
      </div>
    </div>
  );
}
