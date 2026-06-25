"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Opportunity, DiscoverySession, DiscoveryStep } from "./types";
import { SEED_OPPORTUNITIES, SEED_SESSIONS, SEED_STEPS } from "./seed";
import { nextId } from "./utils";

const KEY = "ai-enablement-intake-v1";

type Mode = "loading" | "db" | "local";

interface Data {
  opportunities: Opportunity[];
  sessions: DiscoverySession[];
  steps: DiscoveryStep[];
}

interface Store extends Data {
  loaded: boolean;
  mode: Mode;
  addOpportunity: (o: Opportunity) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  removeOpportunity: (id: string) => void;
  addSession: (s: DiscoverySession) => void;
  updateSession: (id: string, patch: Partial<DiscoverySession>) => void;
  removeSession: (id: string) => void;
  addStep: (s: DiscoveryStep) => void;
  updateStep: (id: string, patch: Partial<DiscoveryStep>) => void;
  removeStep: (id: string) => void;
  resetToSeed: () => void;
  newOpportunityId: () => string;
  newSessionId: () => string;
  newStepId: () => string;
}

const seedData = (): Data => ({
  opportunities: SEED_OPPORTUNITIES,
  sessions: SEED_SESSIONS,
  steps: SEED_STEPS,
});

const StoreContext = createContext<Store | null>(null);

// Fire-and-forget API helpers (DB mode). Errors are logged, local state stays optimistic.
function post(path: string, body: unknown) {
  fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch((e) => console.error("POST", path, e));
}
function patch(path: string, body: unknown) {
  fetch(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch((e) => console.error("PATCH", path, e));
}
function del(path: string) {
  fetch(path, { method: "DELETE" }).catch((e) => console.error("DELETE", path, e));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({
    opportunities: [],
    sessions: [],
    steps: [],
  });
  const [mode, setMode] = useState<Mode>("loading");
  const modeRef = useRef<Mode>("loading");
  modeRef.current = mode;

  // Load: try the API; fall back to local storage if the DB isn't configured.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/data");
        const json = await res.json();
        if (cancelled) return;
        if (json.dbConfigured) {
          setData({
            opportunities: json.opportunities ?? [],
            sessions: json.sessions ?? [],
            steps: json.steps ?? [],
          });
          setMode("db");
          // Clear any stale localStorage from the pre-DB era so old seed
          // data can never resurface in DB mode.
          try {
            localStorage.removeItem(KEY);
          } catch {
            /* ignore */
          }
          return;
        }
      } catch {
        /* fall through to local */
      }
      if (cancelled) return;
      // Local fallback (DB not configured yet)
      try {
        const raw = localStorage.getItem(KEY);
        setData(raw ? JSON.parse(raw) : seedData());
      } catch {
        setData(seedData());
      }
      setMode("local");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to localStorage only in local mode.
  useEffect(() => {
    if (mode === "local") {
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch {
        /* ignore quota errors */
      }
    }
  }, [data, mode]);

  const isDb = () => modeRef.current === "db";

  const addOpportunity = useCallback((o: Opportunity) => {
    setData((d) => ({ ...d, opportunities: [...d.opportunities, o] }));
    if (isDb()) post("/api/opportunities", o);
  }, []);

  const updateOpportunity = useCallback(
    (id: string, p: Partial<Opportunity>) => {
      setData((d) => ({
        ...d,
        opportunities: d.opportunities.map((o) =>
          o.id === id ? { ...o, ...p } : o
        ),
      }));
      if (isDb()) patch(`/api/opportunities/${id}`, p);
    },
    []
  );

  const removeOpportunity = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      opportunities: d.opportunities.filter((o) => o.id !== id),
    }));
    if (isDb()) del(`/api/opportunities/${id}`);
  }, []);

  const addSession = useCallback((s: DiscoverySession) => {
    setData((d) => ({ ...d, sessions: [...d.sessions, s] }));
    if (isDb()) post("/api/sessions", s);
  }, []);

  const updateSession = useCallback((id: string, p: Partial<DiscoverySession>) => {
    setData((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === id ? { ...s, ...p } : s)),
    }));
    if (isDb()) patch(`/api/sessions/${id}`, p);
  }, []);

  const removeSession = useCallback((id: string) => {
    setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
    if (isDb()) del(`/api/sessions/${id}`);
  }, []);

  const addStep = useCallback((s: DiscoveryStep) => {
    setData((d) => ({ ...d, steps: [...d.steps, s] }));
    if (isDb()) post("/api/steps", s);
  }, []);

  const updateStep = useCallback((id: string, p: Partial<DiscoveryStep>) => {
    setData((d) => ({
      ...d,
      steps: d.steps.map((s) => (s.id === id ? { ...s, ...p } : s)),
    }));
    if (isDb()) patch(`/api/steps/${id}`, p);
  }, []);

  const removeStep = useCallback((id: string) => {
    setData((d) => ({ ...d, steps: d.steps.filter((s) => s.id !== id) }));
    if (isDb()) del(`/api/steps/${id}`);
  }, []);

  const resetToSeed = useCallback(() => {
    if (modeRef.current === "local") setData(seedData());
  }, []);

  const newOpportunityId = useCallback(
    () => nextId("WF", data.opportunities.map((o) => o.id)),
    [data.opportunities]
  );
  const newSessionId = useCallback(
    () => nextId("DS", data.sessions.map((s) => s.id)),
    [data.sessions]
  );
  const newStepId = useCallback(
    () => nextId("ST", data.steps.map((s) => s.id)),
    [data.steps]
  );

  const value: Store = {
    ...data,
    loaded: mode !== "loading",
    mode,
    addOpportunity,
    updateOpportunity,
    removeOpportunity,
    addSession,
    updateSession,
    removeSession,
    addStep,
    updateStep,
    removeStep,
    resetToSeed,
    newOpportunityId,
    newSessionId,
    newStepId,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Factory for a blank opportunity with sensible defaults.
export function blankOpportunity(id: string): Opportunity {
  return {
    id,
    submittedDate: new Date().toISOString().slice(0, 10),
    submittedBy: "",
    team: "",
    workflowName: "",
    workflowOwner: "",
    peopleInvolved: "",
    whoUsesOutput: "",
    purpose: "",
    decisionSupported: "",
    whatHappensIfLate: "",
    currentProcess: "",
    frequency: "Unknown",
    minutesPerRun: 0,
    peopleDoingWork: 1,
    outputsPerCycle: "",
    systemsInvolved: "",
    numberOfSystems: 0,
    frictionTypes: [],
    painRating: 3,
    businessCriticality: 3,
    errorProneness: 3,
    urgency: 3,
    peopleAffected: 0,
    customersAffected: "",
    desiredFutureState: "",
    humanReview: "",
    neverAutomate: "",
    trust: "",
    unusable: "",
    howWouldWeKnow: "",
    sensitiveData: "Unsure",
    dataTypes: "",
    inputDataLocation: "",
    outputDestination: "",
    existingReports: "",
    exampleLink: "",
    availableForWalkthrough: "Maybe",
    prototypeWillingness: "Maybe",
    idealTimeline: "",
    initialNotes: "",
    status: "New",
    likelySolutionType: "",
    feasibility: "Unknown",
    riskLevel: "Unknown",
    assignee: "",
    nextReviewDate: "",
    triageNotes: "",
  };
}
