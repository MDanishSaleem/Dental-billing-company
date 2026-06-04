"use client";

import { useState, useEffect } from "react";
import { GitCompare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "compare_companies";
const MAX_COMPARE = 3;

type CompareEntry = {
  id: string;
  slug: string;
  name: string;
  logo?: string;
};

function getCompareList(): CompareEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompareEntry[]) : [];
  } catch {
    return [];
  }
}

function setCompareList(list: CompareEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

interface CompareButtonProps {
  company: CompareEntry;
}

export function CompareButton({ company }: CompareButtonProps) {
  const [added, setAdded] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const list = getCompareList();
    setAdded(list.some((c) => c.id === company.id));
    setFull(list.length >= MAX_COMPARE && !list.some((c) => c.id === company.id));
  }, [company.id]);

  function toggle() {
    const list = getCompareList();
    if (added) {
      const updated = list.filter((c) => c.id !== company.id);
      setCompareList(updated);
      setAdded(false);
      setFull(false);
    } else {
      if (list.length >= MAX_COMPARE) return;
      const updated = [...list, company];
      setCompareList(updated);
      setAdded(true);
      setFull(updated.length >= MAX_COMPARE);
    }
  }

  return (
    <Button
      variant={added ? "teal" : "outline"}
      size="sm"
      className="w-full"
      onClick={toggle}
      disabled={full && !added}
      title={
        full && !added
          ? `You can compare up to ${MAX_COMPARE} companies at a time`
          : undefined
      }
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Added to Compare
        </>
      ) : (
        <>
          <GitCompare className="w-3.5 h-3.5" />
          Add to Compare
        </>
      )}
    </Button>
  );
}
