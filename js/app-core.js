    const state = {
      user: "User",
      points: 0,
      selectedSkillId: 1,
      practicePanelOpen: false,
      bookingFilters: { type: "all", status: "all" },
      rankBonusesAwarded: { bronze: false, silver: false, gold: false },
      completionMilestonesAwarded: { three: false, seven: false, all: false },
      awardedEvents: {},
      skillEvidenceSubmitted: {},
      skillAssessmentsPassed: {},
      assessmentDiscountBySkill: {},
      level5ReachedBySkill: {},
      stage5StretchDoneBySkill: {},
      skillStepChecks: {},
      loggedSkillLimits: {},
      loggedDateLimit: 30,
      loggedViewMode: "skill",
      logSelectionMode: false,
      selectedLogIds: {},
      logEditContext: null,
      rewardClaimContext: null,
      bookingOverrides: {},
      pointsHistory: [],
      claimedRewards: {},
      rewardClaimDetails: {},
      toasts: [],
      bookedSlotIds: [],
      passedSlotIds: [],
      eventsSyncStatus: "idle",
      eventsSyncMessage: "",
      eventsLastSyncedAt: "",
      eventsVersion: "",
      seenEventsVersion: "",
      dismissedEventsVersion: "",
      hasPendingAppUpdate: false,
      practiceLogs: {},
      skills: [
        { id: 1, name: "Loose-Lead Legends", desc: "Confident loose-lead skills across trail conditions.", unlocked: true, points: 60, progressStatus: "not_started" },
        { id: 2, name: "Reliable Recalls", desc: "First-cue recall around real-world distractions.", unlocked: false, points: 8, progressStatus: "not_started" },
        { id: 3, name: "Downstay Masters", desc: "Calm and steady down-stays in active environments.", unlocked: false, points: 24, progressStatus: "not_started" },
        { id: 4, name: "Close & Behind", desc: "Precise position control for narrow trail sections.", unlocked: false, points: 12, progressStatus: "not_started" },
        { id: 5, name: "Livestock Calm", desc: "Safe, calm behavior around visible livestock.", unlocked: false, points: 0 },
        { id: 6, name: "Polite Passes: Dogs", desc: "Neutral dog-to-dog passing at close distances.", unlocked: false, points: 0 },
        { id: 7, name: "Polite Passes: People", desc: "Calm passing behavior around all people types.", unlocked: false, points: 0 },
        { id: 8, name: "Food Manners", desc: "Ignore dropped and visible food temptations.", unlocked: false, points: 0 },
        { id: 9, name: "Settle & Wait", desc: "Switch off and settle during trail breaks.", unlocked: false, points: 0 },
        { id: 10, name: "Emergency Stop / Check-In", desc: "Rapid stop/check-in response at distance.", unlocked: false, points: 0 },
        { id: 11, name: "Crate or Car Calm", desc: "Calm loading and waiting in crate/car.", unlocked: false, points: 0 },
        { id: 12, name: "Handling & Vet Confidence", desc: "Confident handling for checks and care.", unlocked: false, points: 0 },
        { id: 13, name: "Muzzle Training", desc: "Comfortable, stress-free muzzle wear.", unlocked: false, points: 0 },
        { id: 14, name: "Trail Etiquette Pro", desc: "Reliable cue response and path manners.", unlocked: false, points: 0 }
      ],
      slots: [],
      monthlyWalks: []
    };

    const POINT_RULES = {
      simple: [
        { key: "unlock_skill", label: "Unlock Skill", points: 10 },
        { key: "pass_stage", label: "Pass Stage 1-3", points: 5 },
        { key: "pass_skill_assessment", label: "Pass Skill (Stage 4 Assessment)", points: 20, oncePerSkill: true },
        { key: "master_skill", label: "Master Skill (Stage 5 Stretch Goal)", points: 8 },
        { key: "walk_attendance", label: "Attend Monthly Walk", points: 12 },
        { key: "log_training", label: "Log Training Session", points: 2 }
      ]
    };

    const POINT_MAP = Object.fromEntries(
      Object.values(POINT_RULES).flat().map(rule => [rule.key, rule])
    );

    const SAVED_USERNAME_KEY = "wildhound_username";
    const SAVED_APP_STATE_KEY = "wildhound_app_state_v1";
    const SAVED_SEEN_EVENTS_VERSION_KEY = "wildhound_seen_events_version";
    const SAVED_DISMISSED_EVENTS_VERSION_KEY = "wildhound_dismissed_events_version";
    const HILL_WALK_UNLOCK_CODE = "CODE";
    const ASSESSMENT_PASS_CODE = "PASS5";
    const ASSESSMENT_MORE_WORK_CODE = "REWORK5";
    const SKILL_PAYMENT_PAGE_URL = "payment.html";
    const REMOTE_EVENTS_URL = (typeof window !== "undefined" && window.WH_EVENTS_URL)
      ? String(window.WH_EVENTS_URL)
      : "events.json";
    const REMOTE_EVENTS_REFRESH_MS = 5 * 60 * 1000;
    const REMOTE_ASSESSMENT_RESET_APPLIED_KEY = "wildhound_assessment_reset_applied";
    const REWARD_CLAIM_TALLY_URL = (typeof window !== "undefined" && window.WH_TALLY_REWARD_FORM_URL)
      ? String(window.WH_TALLY_REWARD_FORM_URL)
      : "https://tally.so/r/rj69o2";
    // Set to `true` to require installed-app mode, or `false` to allow normal browser use.
    const ENFORCE_INSTALL_GATE = true;
    let deferredInstallPrompt = null;
    let unlockSkillModalSkillId = null;

    function loadPersistedState() {
      try {
        const raw = localStorage.getItem(SAVED_APP_STATE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const keys = [
            "user", "points", "selectedSkillId", "practicePanelOpen", "bookingFilters",
            "rankBonusesAwarded", "completionMilestonesAwarded", "awardedEvents",
            "skillEvidenceSubmitted", "skillAssessmentsPassed", "assessmentDiscountBySkill", "level5ReachedBySkill", "stage5StretchDoneBySkill", "skillStepChecks", "pointsHistory",
            "claimedRewards", "rewardClaimDetails",
            "bookedSlotIds", "passedSlotIds", "practiceLogs", "skills", "bookingOverrides",
            "loggedSkillLimits", "loggedDateLimit", "loggedViewMode"
          ];
          keys.forEach((key) => {
            if (saved[key] !== undefined) state[key] = saved[key];
          });
        } else {
          const savedName = localStorage.getItem(SAVED_USERNAME_KEY);
          if (savedName && savedName.trim()) state.user = savedName.trim();
        }
      } catch (e) {
        // Ignore storage access issues in preview environments.
      }
      if (!state.user || !String(state.user).trim()) state.user = "User";
      if ((!state.pointsHistory || !state.pointsHistory.length) && Number(state.points) > 0) {
        state.points = 0;
      }
      state.toasts = [];
    }

    function persistState() {
      try {
        const nextBookingOverrides = {};
        (state.slots || []).forEach((slot) => {
          const key = `assessment:${slot.id}`;
          const payload = {};
          if (slot.status) payload.status = slot.status;
          if (slot.paymentStatus) payload.paymentStatus = slot.paymentStatus;
          if (Array.isArray(slot.bookingPointHistoryIds) && slot.bookingPointHistoryIds.length) {
            payload.bookingPointHistoryIds = slot.bookingPointHistoryIds;
          }
          if (Object.keys(payload).length) nextBookingOverrides[key] = payload;
        });
        (state.monthlyWalks || []).forEach((walk) => {
          const key = `hillwalk:${walk.id}`;
          const payload = {};
          if (walk.status) payload.status = walk.status;
          if (walk.paymentStatus) payload.paymentStatus = walk.paymentStatus;
          if (Array.isArray(walk.bookingPointHistoryIds) && walk.bookingPointHistoryIds.length) {
            payload.bookingPointHistoryIds = walk.bookingPointHistoryIds;
          }
          if (Object.keys(payload).length) nextBookingOverrides[key] = payload;
        });
        state.bookingOverrides = nextBookingOverrides;

        const snapshot = {
          user: state.user,
          points: state.points,
          selectedSkillId: state.selectedSkillId,
          practicePanelOpen: state.practicePanelOpen,
          bookingFilters: state.bookingFilters,
          rankBonusesAwarded: state.rankBonusesAwarded,
          completionMilestonesAwarded: state.completionMilestonesAwarded,
          awardedEvents: state.awardedEvents,
          skillEvidenceSubmitted: state.skillEvidenceSubmitted,
          skillAssessmentsPassed: state.skillAssessmentsPassed,
          assessmentDiscountBySkill: state.assessmentDiscountBySkill,
          level5ReachedBySkill: state.level5ReachedBySkill,
          stage5StretchDoneBySkill: state.stage5StretchDoneBySkill,
          skillStepChecks: state.skillStepChecks,
          bookingOverrides: state.bookingOverrides,
          pointsHistory: state.pointsHistory,
          claimedRewards: state.claimedRewards,
          rewardClaimDetails: state.rewardClaimDetails,
          bookedSlotIds: state.bookedSlotIds,
          passedSlotIds: state.passedSlotIds,
          practiceLogs: state.practiceLogs,
          loggedSkillLimits: state.loggedSkillLimits,
          loggedDateLimit: state.loggedDateLimit,
          loggedViewMode: state.loggedViewMode,
          skills: state.skills
        };
        localStorage.setItem(SAVED_APP_STATE_KEY, JSON.stringify(snapshot));
      } catch (e) {
        // Ignore storage access issues in preview environments.
      }
    }

    function isStandaloneMode() {
      return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    }

    function updateInstallGate() {
      if (!ENFORCE_INSTALL_GATE) {
        document.body.classList.remove("install-gated");
        return false;
      }
      const blocked = !isStandaloneMode();
      document.body.classList.toggle("install-gated", blocked);
      const installBtn = document.getElementById("installAppBtn");
      const hint = document.getElementById("installHint");
      if (!installBtn || !hint) return blocked;

      const canPrompt = !!deferredInstallPrompt;
      installBtn.style.display = canPrompt ? "inline-block" : "none";
      hint.textContent = canPrompt
        ? "Tap Add to Home Screen, then open Wild Hound from your home screen."
        : "Open your browser menu and choose Add to Home Screen.";
      return blocked;
    }

    function ensurePracticeLogIds() {
      Object.keys(state.practiceLogs || {}).forEach((skillId) => {
        state.practiceLogs[skillId] = (state.practiceLogs[skillId] || []).map((log, idx) => ({
          ...log,
          id: log.id || `${skillId}-${log.loggedAt || log.date || "log"}-${idx}`
        }));
      });
    }

    function normalizeBookingFilters() {
      const validTypes = new Set(["all", "assessment", "hillwalk"]);
      const validStatuses = new Set(["all", "pending", "booked", "waitlisted", "passed"]);
      const saved = state.bookingFilters && typeof state.bookingFilters === "object" ? state.bookingFilters : {};
      const nextType = validTypes.has(saved.type) ? saved.type : "all";
      const nextStatus = validStatuses.has(saved.status) ? saved.status : "all";
      state.bookingFilters = { type: nextType, status: nextStatus };
    }

    function normalizeBookingData() {
      const normalizeStatus = (raw) => {
        const status = String(raw || "pending").toLowerCase();
        if (status === "not_yet") return "pending";
        if (status === "paid") return "booked";
        return ["pending", "booked", "waitlisted", "passed"].includes(status) ? status : "pending";
      };

      const normalizeSlot = (slot) => {
        if (!slot || typeof slot !== "object") return null;
        const dateISO = typeof slot.dateISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(slot.dateISO) ? slot.dateISO : "";
        const time = typeof slot.time === "string" && slot.time.trim() ? slot.time.trim() : "9:00 AM";
        const day = typeof slot.day === "string" && slot.day.trim() ? slot.day.trim() : "Upcoming";
        const location = typeof slot.location === "string" && slot.location.trim() ? slot.location.trim() : "Trail Location";
        return {
          ...slot,
          day,
          time,
          dateISO,
          location,
          status: normalizeStatus(slot.status),
          waitlistOnly: Boolean(slot.waitlistOnly),
          capacity: Number(slot.capacity) > 0 ? Number(slot.capacity) : 10,
          bookedCount: Math.max(0, Number(slot.bookedCount) || 0),
          waitlistCount: Math.max(0, Number(slot.waitlistCount) || 0)
        };
      };

      const normalizeWalk = (walk) => {
        if (!walk || typeof walk !== "object") return null;
        const normalized = normalizeSlot(walk);
        if (!normalized) return null;
        return {
          ...normalized,
          month: typeof walk.month === "string" && walk.month.trim() ? walk.month.trim() : "Monthly Hill Walk",
          skill: typeof walk.skill === "string" && walk.skill.trim() ? walk.skill.trim() : "Skill Focus"
        };
      };

      state.slots = (Array.isArray(state.slots) ? state.slots : []).map(normalizeSlot).filter(Boolean);
      state.monthlyWalks = (Array.isArray(state.monthlyWalks) ? state.monthlyWalks : []).map(normalizeWalk).filter(Boolean);
    }

    function saveSeenEventsVersion(version) {
      try {
        if (!version) return;
        localStorage.setItem(SAVED_SEEN_EVENTS_VERSION_KEY, String(version));
      } catch (error) {
        // Ignore storage failures.
      }
    }

    function saveDismissedEventsVersion(version) {
      try {
        if (!version) return;
        localStorage.setItem(SAVED_DISMISSED_EVENTS_VERSION_KEY, String(version));
      } catch (error) {
        // Ignore storage failures.
      }
    }

    function setEventsSyncState(status, message) {
      state.eventsSyncStatus = String(status || "idle");
      state.eventsSyncMessage = String(message || "");
    }

    function markEventsSyncedNow() {
      state.eventsLastSyncedAt = new Date().toISOString();
    }

    function setEventsVersionFromPayload(payload, options = {}) {
      const version = payload && payload.updatedAt ? String(payload.updatedAt) : "";
      if (!version) {
        if (!state.eventsVersion) state.hasPendingAppUpdate = false;
        return;
      }

      if (!state.seenEventsVersion) {
        try {
          state.seenEventsVersion = localStorage.getItem(SAVED_SEEN_EVENTS_VERSION_KEY) || "";
        } catch (error) {
          state.seenEventsVersion = "";
        }
      }
      if (!state.dismissedEventsVersion) {
        try {
          state.dismissedEventsVersion = localStorage.getItem(SAVED_DISMISSED_EVENTS_VERSION_KEY) || "";
        } catch (error) {
          state.dismissedEventsVersion = "";
        }
      }

      state.eventsVersion = version;
      const fromRemote = Boolean(options.fromRemote);
      if (!state.seenEventsVersion) {
        state.seenEventsVersion = version;
        saveSeenEventsVersion(version);
        state.hasPendingAppUpdate = false;
        return;
      }

      state.hasPendingAppUpdate = fromRemote
        && version !== state.seenEventsVersion
        && version !== state.dismissedEventsVersion;
    }

    function acknowledgePendingUpdate() {
      state.hasPendingAppUpdate = false;
      if (!state.eventsVersion) return;
      state.seenEventsVersion = state.eventsVersion;
      state.dismissedEventsVersion = state.eventsVersion;
      saveSeenEventsVersion(state.eventsVersion);
      saveDismissedEventsVersion(state.eventsVersion);
    }

    function mergeRemoteEvents(localEvents, remoteEvents) {
      const localById = Object.fromEntries((localEvents || []).map((event) => [Number(event.id), event]));
      return (remoteEvents || []).map((remote) => {
        const local = localById[Number(remote.id)];
        if (!local) return remote;

        // Keep user-specific booking state while allowing remote schedule/capacity updates.
        const merged = { ...remote };
        if (local.status && local.status !== "pending") merged.status = local.status;
        if (local.paymentStatus) merged.paymentStatus = local.paymentStatus;
        if (Array.isArray(local.bookingPointHistoryIds)) merged.bookingPointHistoryIds = local.bookingPointHistoryIds;
        return merged;
      });
    }

    function applyAssessmentResetIfNeeded(payload) {
      const resetToken = String(payload.updatedAt || "reset-v1");
      let resetAlreadyApplied = false;
      try {
        resetAlreadyApplied = localStorage.getItem(REMOTE_ASSESSMENT_RESET_APPLIED_KEY) === resetToken;
      } catch (error) {
        resetAlreadyApplied = false;
      }

      if (payload.clearAssessmentBookings === true && !resetAlreadyApplied) {
        state.slots = (state.slots || []).map((slot) => {
          const reset = { ...slot, status: "pending" };
          delete reset.paymentStatus;
          reset.bookingPointHistoryIds = [];
          return reset;
        });
        Object.keys(state.bookingOverrides || {}).forEach((key) => {
          if (key.startsWith("assessment:")) delete state.bookingOverrides[key];
        });
        try {
          localStorage.setItem(REMOTE_ASSESSMENT_RESET_APPLIED_KEY, resetToken);
        } catch (error) {
          // Ignore storage failures.
        }
      }
    }

    function applyBookingOverridesToEvents() {
      const overrides = state.bookingOverrides && typeof state.bookingOverrides === "object"
        ? state.bookingOverrides
        : {};
      state.slots = (state.slots || []).map((slot) => {
        const key = `assessment:${slot.id}`;
        const override = overrides[key];
        if (!override) return slot;
        return {
          ...slot,
          status: override.status || slot.status,
          paymentStatus: override.paymentStatus || slot.paymentStatus,
          bookingPointHistoryIds: Array.isArray(override.bookingPointHistoryIds)
            ? override.bookingPointHistoryIds
            : slot.bookingPointHistoryIds
        };
      });
      state.monthlyWalks = (state.monthlyWalks || []).map((walk) => {
        const key = `hillwalk:${walk.id}`;
        const override = overrides[key];
        if (!override) return walk;
        return {
          ...walk,
          status: override.status || walk.status,
          paymentStatus: override.paymentStatus || walk.paymentStatus,
          bookingPointHistoryIds: Array.isArray(override.bookingPointHistoryIds)
            ? override.bookingPointHistoryIds
            : walk.bookingPointHistoryIds
        };
      });
    }

    function applyLocalEventsData() {
      const payload = (typeof window !== "undefined" && window.WH_EVENTS_DATA && typeof window.WH_EVENTS_DATA === "object")
        ? window.WH_EVENTS_DATA
        : null;
      if (!payload) return false;
      setEventsVersionFromPayload(payload, { fromRemote: false });

      const nextSlots = Array.isArray(payload.slots) ? payload.slots : [];
      const nextWalks = Array.isArray(payload.monthlyWalks) ? payload.monthlyWalks : [];
      state.slots = mergeRemoteEvents(state.slots, nextSlots);
      state.monthlyWalks = mergeRemoteEvents(state.monthlyWalks, nextWalks);
      applyBookingOverridesToEvents();
      applyAssessmentResetIfNeeded(payload);
      return true;
    }

    async function hydrateRemoteEvents(options = {}) {
      if (typeof fetch !== "function") return false;
      const silent = Boolean(options.silent);
      if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
        markEventsSyncedNow();
        setEventsSyncState("ready", "Local preview mode: using bundled events.");
        return false;
      }
      setEventsSyncState("loading", "Checking latest events...");
      try {
        const response = await fetch(REMOTE_EVENTS_URL, { cache: "no-store" });
        if (!response.ok) {
          setEventsSyncState("error", "Could not sync latest events.");
          return false;
        }
        const payload = await response.json();
        if (!payload || typeof payload !== "object") {
          setEventsSyncState("error", "Could not sync latest events.");
          return false;
        }
        setEventsVersionFromPayload(payload, { fromRemote: true });

        const currentSlots = JSON.stringify(state.slots || []);
        const currentWalks = JSON.stringify(state.monthlyWalks || []);

        const nextSlots = Array.isArray(payload.slots) ? payload.slots : [];
        const nextWalks = Array.isArray(payload.monthlyWalks) ? payload.monthlyWalks : [];

        state.slots = mergeRemoteEvents(state.slots, nextSlots);
        state.monthlyWalks = mergeRemoteEvents(state.monthlyWalks, nextWalks);
        applyBookingOverridesToEvents();
        applyAssessmentResetIfNeeded(payload);

        normalizeBookingData();
        normalizeSkillCatalog();

        const changed = currentSlots !== JSON.stringify(state.slots || [])
          || currentWalks !== JSON.stringify(state.monthlyWalks || []);
        markEventsSyncedNow();
        setEventsSyncState("ready", changed ? "Events updated just now." : "Events are up to date.");
        if (changed) {
          renderAll();
          if (!silent) showToast("Events updated from server.");
        }
        return changed;
      } catch (error) {
        setEventsSyncState("error", "Could not sync latest events.");
        return false;
      }
    }

    function normalizeSkillCatalog() {
      const officialSkills = [
        { id: 1, name: "Loose-Lead Legends", desc: "Confident loose-lead skills across trail conditions.", unlocked: true, points: 0, progressStatus: "not_started" },
        { id: 2, name: "Reliable Recalls", desc: "First-cue recall around real-world distractions.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 3, name: "Downstay Masters", desc: "Calm and steady down-stays in active environments.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 4, name: "Close & Behind", desc: "Precise position control for narrow trail sections.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 5, name: "Livestock Calm", desc: "Safe, calm behavior around visible livestock.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 6, name: "Polite Passes: Dogs", desc: "Neutral dog-to-dog passing at close distances.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 7, name: "Polite Passes: People", desc: "Calm passing behavior around all people types.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 8, name: "Food Manners", desc: "Ignore dropped and visible food temptations.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 9, name: "Settle & Wait", desc: "Switch off and settle during trail breaks.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 10, name: "Emergency Stop / Check-In", desc: "Rapid stop/check-in response at distance.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 11, name: "Crate or Car Calm", desc: "Calm loading and waiting in crate/car.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 12, name: "Handling & Vet Confidence", desc: "Confident handling for checks and care.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 13, name: "Muzzle Training", desc: "Comfortable, stress-free muzzle wear.", unlocked: false, points: 0, progressStatus: "not_started" },
        { id: 14, name: "Trail Etiquette Pro", desc: "Reliable cue response and path manners.", unlocked: false, points: 0, progressStatus: "not_started" }
      ];

      const byId = Object.fromEntries((state.skills || []).map((s) => [Number(s.id), s]));
      state.skills = officialSkills.map((base) => {
        const saved = byId[base.id] || {};
        return {
          id: base.id,
          name: base.name,
          desc: base.desc,
          unlocked: saved.unlocked ?? base.unlocked,
          points: saved.points ?? base.points,
          progressStatus: saved.progressStatus || base.progressStatus
        };
      });

      const walkSkillMap = {
        "Hill Climb Control": "Close & Behind",
        "Loose Lead Walking": "Loose-Lead Legends",
        "Trail Focus": "Reliable Recalls"
      };
      state.monthlyWalks = (state.monthlyWalks || []).map((walk) => ({
        ...walk,
        skill: walkSkillMap[walk.skill] || walk.skill
      }));
    }

    function syncSkillProgressFromSteps(skillId) {
      const skill = state.skills.find((s) => s.id === skillId);
      if (!skill || !skill.unlocked) return;
      if (skill.progressStatus === "passed" || skill.progressStatus === "needs_more_work") return;

      const checks = getSkillStepChecks(skillId);
      const allChecks = [1, 2, 3, 4].flatMap((stepNum) => checks[stepNum] || []);
      const anyChecked = allChecks.some(Boolean);
      skill.progressStatus = anyChecked ? "in_progress" : "not_started";
    }

    function syncAllSkillProgressFromSteps() {
      state.skills.forEach((skill) => syncSkillProgressFromSteps(skill.id));
    }

    loadPersistedState();
    ensurePracticeLogIds();
    normalizeBookingFilters();
    applyLocalEventsData();
    normalizeBookingData();
    normalizeSkillCatalog();
    recalculatePointsFromHistory();

    const SKILL_STAGE_CONTENT = {
      1: {
        stages: {
          1: "Stage 1 - Teaching Basics: Quiet path or garden. Reward every 2-3 steps of slack lead. Stop instantly if lead tightens. Keep to 3-5 minutes.",
          2: "Stage 2 - Building Reliability: Practise around 1-2 mild distractions (bench, bush, bin). Add start/stop and a couple of turns.",
          3: "Stage 3 - Real-World Practice: Walk a short town route or park loop with multiple distractions. Reward for staying slack during each distraction.",
          4: "Stage 4 - Pass Criteria Challenge: Dog walks for 5+ minutes on a loose lead with minimal corrections, including start/stop/turns and 2+ distractions (livestock gate, walker, muddy patch)."
        },
        stretch: "Dog switches sides or drops behind on cue to navigate tight trails."
      },
      2: {
        stages: {
          1: "Stage 1 - Teaching Basics: Enclosed area, call from 3-5m. Reward big every time. End before they lose interest.",
          2: "Stage 2 - Building Reliability: 10-15m distance on a long line. Add mild distraction (treat on ground before recall).",
          3: "Stage 3 - Real-World Practice: 3 recalls during a walk - vary distance and rewards. Mix in play rewards.",
          4: "Stage 4 - Pass Criteria Challenge: Dog returns on first cue from 15m+ away across mild distractions (sniffing, stream, another dog 30m away)."
        },
        stretch: "Recall away from mid-play or prey interest."
      },
      3: {
        stages: {
          1: "Stage 1 - Teaching Basics: Practise 5-second down-stays at your side. Release before they move.",
          2: "Stage 2 - Building Reliability: Increase to 15-20 seconds. Take 1-2 steps away.",
          3: "Stage 3 - Real-World Practice: Down-stay at a park bench for 30 seconds.",
          4: "Stage 4 - Pass Criteria Challenge: Off-lead down-stay for 2 minutes while handler walks 10+ metres away to check a trail, open a gate, or take a break."
        },
        stretch: "Hold position while other hikers or dogs pass."
      },
      4: {
        stages: {
          1: "Stage 1 - Teaching Basics: Reward for walking \"close\" at your side for 5-10 steps.",
          2: "Stage 2 - Building Reliability: Add \"behind\" for 3-5 steps before gates or narrow spots.",
          3: "Stage 3 - Real-World Practice: Use \"close\" or \"behind\" in 3 different walk situations.",
          4: "Stage 4 - Pass Criteria Challenge: Dog walks at heel or behind for 30+ seconds off-lead on narrow or technical terrain when cued."
        },
        stretch: "Maintains position through distractions or during rest breaks."
      },
      5: {
        stages: {
          1: "Stage 1 - Teaching Basics: From 30m away, reward calm looking at livestock.",
          2: "Stage 2 - Building Reliability: Reduce to 15-20m, rewarding focus on you.",
          3: "Stage 3 - Real-World Practice: Walk parallel to a fence with sheep in view.",
          4: "Stage 4 - Pass Criteria Challenge: Dog remains calm and under control on-lead within 20m of visible livestock with no barking, lunging, or spinning."
        },
        stretch: "Calm behaviour while off-lead but on a long line, showing default disengagement."
      },
      6: {
        stages: {
          1: "Stage 1 - Teaching Basics: Start 20m away, reward calm watching.",
          2: "Stage 2 - Building Reliability: Practise at ~10m distance. Add \"let's go\" as you pass.",
          3: "Stage 3 - Real-World Practice: Pass 3 dogs calmly on separate occasions.",
          4: "Stage 4 - Pass Criteria Challenge: Pass another dog calmly within 2m without barking, lunging, or fixating."
        },
        stretch: "Dog disengages on their own after the pass."
      },
      7: {
        stages: {
          1: "Stage 1 - Teaching Basics: Pass a stationary person calmly.",
          2: "Stage 2 - Building Reliability: Pass a moving person at walking speed.",
          3: "Stage 3 - Real-World Practice: Pass a group of people or a runner calmly.",
          4: "Stage 4 - Pass Criteria Challenge: Dog calmly passes people (solo, kids, runners, people with food or gear) without jumping, barking, or excessive interest."
        },
        stretch: "Dog holds a loose-lead sit or down at the side while people pass."
      },
      8: {
        stages: {
          1: "Stage 1 - Teaching Basics: Teach \"leave it\" with treats in hand.",
          2: "Stage 2 - Building Reliability: Practise with treats on the floor.",
          3: "Stage 3 - Real-World Practice: Walk past a picnic spot and reward ignoring.",
          4: "Stage 4 - Pass Criteria Challenge: Walk past discarded food, wrappers, or lunch bags without grabbing or needing a correction."
        },
        stretch: "Dog can be cued to ignore food left out at a rest stop or on a table at a cafe/pub."
      },
      9: {
        stages: {
          1: "Stage 1 - Teaching Basics: Teach settle for 30 seconds at home.",
          2: "Stage 2 - Building Reliability: Increase to 1-2 minutes in a quiet public space.",
          3: "Stage 3 - Real-World Practice: Settle at a coffee stop for 3 minutes.",
          4: "Stage 4 - Pass Criteria Challenge: Lie down and stay settled for 5 minutes at a trail rest stop with minimal fidgeting."
        },
        stretch: "Dog settles at a pub or cafe during a meal."
      },
      10: {
        stages: {
          1: "Stage 1 - Teaching Basics: On-lead, stop moving and reward when dog stops with you.",
          2: "Stage 2 - Building Reliability: Stop from 2-3m away on long line.",
          3: "Stage 3 - Real-World Practice: Stop mid-trail from a short trot.",
          4: "Stage 4 - Pass Criteria Challenge: Dog stops or checks in within 3 seconds of cue at 10-20m."
        },
        stretch: "Dog stops at speed mid-run or mid-chase when cued."
      },
      11: {
        stages: {
          1: "Stage 1 - Teaching Basics: Reward calm entry to crate/car.",
          2: "Stage 2 - Building Reliability: Close door for 1-2 minutes quietly.",
          3: "Stage 3 - Real-World Practice: Short wait in car post-walk.",
          4: "Stage 4 - Pass Criteria Challenge: Load into car/crate without lifting and stay calm for 5+ minutes post-hike."
        },
        stretch: "Dog stays calm in the car while you go grab a coffee or gear."
      },
      12: {
        stages: {
          1: "Stage 1 - Teaching Basics: Handle paws, ears, tail for 5 seconds each.",
          2: "Stage 2 - Building Reliability: Add harness adjustment and gentle brush.",
          3: "Stage 3 - Real-World Practice: Simulate quick first-aid check.",
          4: "Stage 4 - Pass Criteria Challenge: Tolerate paws wiped, burrs removed, harness adjusted, or first-aid check without mouthing or wriggling."
        },
        stretch: "Dog allows another person to do a check while you're present."
      },
      13: {
        stages: {
          1: "Stage 1 - Teaching Basics: Feed treats through muzzle without fastening.",
          2: "Stage 2 - Building Reliability: Fasten for 5-10 seconds with reward.",
          3: "Stage 3 - Real-World Practice: Short walk wearing muzzle.",
          4: "Stage 4 - Pass Criteria Challenge: Wear muzzle for 15 minutes on a walk without stress signs."
        },
        stretch: "Dog wears muzzle on a full walk, during training or travel, with neutral or happy engagement."
      },
      14: {
        stages: {
          1: "Stage 1 - Teaching Basics: Start on loose lead, reward staying on path.",
          2: "Stage 2 - Building Reliability: Practise responding to \"this way\" twice per walk.",
          3: "Stage 3 - Real-World Practice: Maintain calm on a busy trail.",
          4: "Stage 4 - Pass Criteria Challenge: Stay on path, respond to cues, and avoid barking/straying during a 1+ hour walk."
        },
        stretch: "Dog follows informal directions like \"wait there\", \"this way\", \"go on\" across mixed terrain and distractions."
      }
    };

    function getRank(points) {
      if (points >= 1250 && hasMasterRequirements()) return { name: "Trail Dog Master", min: 1250, next: null, nextName: null };
      if (points >= 950) return { name: "Trail Dog Expert", min: 950, next: 1250, nextName: "Trail Dog Master" };
      if (points >= 700) return { name: "Trail Dog Pathfinder", min: 700, next: 950, nextName: "Trail Dog Expert" };
      if (points >= 500) return { name: "Trail Dog Advanced", min: 500, next: 700, nextName: "Trail Dog Pathfinder" };
      if (points >= 300) return { name: "Trail Dog Explorer", min: 300, next: 500, nextName: "Trail Dog Advanced" };
      if (points >= 150) return { name: "Trail Dog Rookie", min: 150, next: 300, nextName: "Trail Dog Explorer" };
      if (points >= 75) return { name: "Trail Dog Starter", min: 75, next: 150, nextName: "Trail Dog Rookie" };
      return { name: "No Rank Yet", min: 0, next: 75, nextName: "Trail Dog Starter" };
    }

    function nextSkillToUnlock() {
      return state.skills.find(s => !s.unlocked);
    }

    function areFirstThirteenSkillsPassed() {
      if (!Array.isArray(state.skills) || state.skills.length < 13) return false;
      return state.skills
        .filter((s) => s.id >= 1 && s.id <= 13)
        .every((s) => s.progressStatus === "passed");
    }

    function getCurrentMonthlySkill(date = new Date()) {
      if (!Array.isArray(state.skills) || !state.skills.length) return null;
      const monthlySkills = state.skills.filter((s) => s.id >= 1 && s.id <= 13);
      if (!monthlySkills.length) return null;

      const startYear = 2026;
      const startMonthIndex = 2; // March (0-based)
      const monthsSinceStart = ((date.getFullYear() - startYear) * 12) + (date.getMonth() - startMonthIndex);
      const totalSkills = monthlySkills.length;
      const skillIndex = ((monthsSinceStart % totalSkills) + totalSkills) % totalSkills;
      return monthlySkills[skillIndex] || monthlySkills[0];
    }

    function unlockedSkills() {
      return state.skills.filter(s => s.unlocked);
    }

    function walksAttendedCount() {
      return state.monthlyWalks.filter(w => w.status === "passed").length;
    }

    function hasMasterRequirements() {
      return unlockedSkills().length >= 14 && walksAttendedCount() >= 5;
    }

    function clampPoints(value) {
      let points = Number(value);
      if (!Number.isFinite(points)) points = 0;
      points = Math.max(0, Math.round(points));
      if (!hasMasterRequirements() && points > 1249) points = 1249;
      if (points > 1250) points = 1250;
      return points;
    }

    function recalculatePointsFromHistory(options = {}) {
      const strict = Boolean(options.strict);
      const history = state.pointsHistory || [];
      if (!history.length) {
        state.points = strict ? 0 : clampPoints(state.points);
        return state.points;
      }
      const total = history.reduce((sum, entry) => sum + (Number(entry?.points) || 0), 0);
      state.points = clampPoints(total);
      return state.points;
    }

    function updatePoints(delta) {
      const before = state.points;
      state.points = clampPoints(state.points + delta);
      return state.points - before;
    }

    function showToast(message, tone = "success") {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      state.toasts.push({ id, message, tone });
      renderToasts();
      setTimeout(() => {
        state.toasts = state.toasts.filter(t => t.id !== id);
        renderToasts();
      }, 2400);
    }

    function renderToasts() {
      const wrap = document.getElementById("toastWrap");
      if (!wrap) return;
      wrap.innerHTML = state.toasts.map(t => `<div class="toast ${t.tone}">${t.message}</div>`).join("");
    }

    function awardEvent(eventKey, options = {}) {
      const rule = POINT_MAP[eventKey];
      if (!rule) return false;
      const sourceKey = options.sourceKey || null;

      if (rule.oneTime && state.awardedEvents[eventKey]) return false;
      if (options.uniqueSource && sourceKey) {
        const exists = (state.pointsHistory || []).some((entry) => entry && entry.sourceKey === sourceKey);
        if (exists) return false;
      }
      if (rule.oncePerSkill) {
        const skillId = options.skillId;
        if (!skillId) return false;
        if (eventKey === "pass_skill_assessment" && state.skillAssessmentsPassed[skillId]) return false;
      }

      const appliedPoints = updatePoints(rule.points);
      if (appliedPoints <= 0) return false;
      const historyId = `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;
      state.pointsHistory.unshift({
        id: historyId,
        label: rule.label,
        points: appliedPoints,
        when: new Date().toLocaleString(),
        sourceKey
      });
      showToast(`+${appliedPoints} pts: ${rule.label}`);
      if (rule.oneTime) state.awardedEvents[eventKey] = true;
      if (eventKey === "pass_skill_assessment" && options.skillId) state.skillAssessmentsPassed[options.skillId] = true;

      applyAutoMilestones();
      applyAutoRankBonuses();
      renderAll();
      return historyId;
    }

    function removePointsHistoryBySourceKeys(sourceKeys) {
      if (!Array.isArray(sourceKeys) || !sourceKeys.length) return 0;
      const keySet = new Set(sourceKeys.filter(Boolean).map(String));
      if (!keySet.size) return 0;
      let removedPoints = 0;
      state.pointsHistory = state.pointsHistory.filter((entry) => {
        if (entry && entry.sourceKey && keySet.has(String(entry.sourceKey))) {
          removedPoints += Number(entry.points) || 0;
          return false;
        }
        return true;
      });
      if (removedPoints > 0) recalculatePointsFromHistory({ strict: true });
      return removedPoints;
    }

    function removePointsHistoryByIds(historyIds) {
      if (!Array.isArray(historyIds) || !historyIds.length) return 0;
      const idSet = new Set(historyIds.map(String));
      let removedPoints = 0;
      state.pointsHistory = state.pointsHistory.filter((entry) => {
        if (entry && entry.id && idSet.has(String(entry.id))) {
          removedPoints += Number(entry.points) || 0;
          return false;
        }
        return true;
      });
      if (removedPoints > 0) recalculatePointsFromHistory({ strict: true });
      return removedPoints;
    }

    function getLogTimestamp(log) {
      if (!log) return 0;
      if (log.loggedAt) return new Date(log.loggedAt).getTime();
      if (log.date) return new Date(`${log.date}T00:00:00`).getTime();
      return 0;
    }

    function removePracticeLogPointsIfEligible(log) {
      if (!log || !log.pointHistoryId) return 0;
      const loggedTime = getLogTimestamp(log);
      if (!loggedTime) return 0;
      const withinFourteenDays = (Date.now() - loggedTime) <= (14 * 24 * 60 * 60 * 1000);
      if (!withinFourteenDays) return 0;
      return removePointsHistoryByIds([log.pointHistoryId]);
    }

    function applyAutoMilestones() {}

    function applyAutoRankBonuses() {}

    function unlockSkill(skillId, source = "walk") {
      const skill = state.skills.find(s => s.id === skillId);
      if (!skill || skill.unlocked) return;
      if (skill.id === 14 && !areFirstThirteenSkillsPassed()) {
        showToast("Trail Etiquette Pro unlocks after the first 13 skills are passed.", "warn");
        return;
      }
      skill.unlocked = true;
      awardEvent("unlock_skill");
      showToast(`Unlocked: ${skill.name}`);
      if (!state.selectedSkillId) state.selectedSkillId = skillId;
    }

    function openUnlockSkillModal(skillId) {
      const skill = state.skills.find((s) => s.id === skillId);
      if (!skill || skill.unlocked) return;
      if (skill.id === 14 && !areFirstThirteenSkillsPassed()) {
        showToast("Pass skills 1-13 first to unlock Trail Etiquette Pro.", "warn");
        return;
      }
      unlockSkillModalSkillId = skillId;
      document.getElementById("unlockSkillTitle").textContent = `Unlock ${skill.name}`;
      document.getElementById("unlockSkillPrompt").textContent = "Use your hill walk code or continue to payment.";
      document.getElementById("unlockCodeInput").value = "";
      document.getElementById("unlockCodeSection").style.display = "none";
      document.getElementById("unlockSkillModalBackdrop").style.display = "flex";
    }

    function closeUnlockSkillModal() {
      unlockSkillModalSkillId = null;
      document.getElementById("unlockCodeInput").value = "";
      document.getElementById("unlockCodeSection").style.display = "none";
      document.getElementById("unlockSkillModalBackdrop").style.display = "none";
    }

    function submitUnlockCode() {
      if (!unlockSkillModalSkillId) return;
      const code = (document.getElementById("unlockCodeInput").value || "").trim().toUpperCase();
      if (!code) {
        showToast("Enter a hill walk code to continue.", "warn");
        return;
      }
      if (code !== HILL_WALK_UNLOCK_CODE) {
        showToast("Invalid hill walk code.", "warn");
        return;
      }
      const targetSkillId = unlockSkillModalSkillId;
      closeUnlockSkillModal();
      unlockSkill(targetSkillId, "walk");
    }

    function startPaymentUnlockFlow() {
      if (!unlockSkillModalSkillId) return;
      const skill = state.skills.find((s) => s.id === unlockSkillModalSkillId);
      if (!skill) return;

      const payUrl = `${SKILL_PAYMENT_PAGE_URL}?type=skill&skill=${encodeURIComponent(skill.name)}&skillId=${skill.id}`;
      closeUnlockSkillModal();
      window.location.assign(payUrl);
    }

    function applyAssessmentCodeForSelectedSkill(rawCode) {
      const skill = state.skills.find((s) => s.id === state.selectedSkillId);
      if (!skill || !skill.unlocked) return;
      const stage4Unlocked = isStepUnlocked(skill.id, 4);
      if (!stage4Unlocked) {
        showToast("Reach Stage 4 before applying an assessment code.", "warn");
        return;
      }
      const code = (rawCode || "").trim().toUpperCase();
      if (!code) {
        showToast("Enter a Stage 4 assessor code.", "warn");
        return;
      }

      if (code === ASSESSMENT_PASS_CODE) {
        skill.progressStatus = "passed";
        state.skillEvidenceSubmitted[skill.id] = true;
        delete state.assessmentDiscountBySkill[skill.id];
        const awarded = awardEvent("pass_skill_assessment", { skillId: skill.id });
        if (!awarded) {
          state.skillAssessmentsPassed[skill.id] = true;
          renderAll();
        }
        return;
      }

      if (code === ASSESSMENT_MORE_WORK_CODE) {
        skill.progressStatus = "needs_more_work";
        state.skillEvidenceSubmitted[skill.id] = true;
        delete state.skillAssessmentsPassed[skill.id];
        state.assessmentDiscountBySkill[skill.id] = 5;
        showToast("Needs More Work recorded. £5 assessment discount is now active until this skill passes.", "warn");
        renderAll();
        return;
      }

      showToast("Invalid assessor code.", "warn");
    }

    function normalizeScreenId(rawScreenId) {
      const raw = String(rawScreenId || "").toLowerCase().trim();
      const alias = raw === "about" ? "settings" : raw;
      const allowed = new Set(["dashboard", "skills", "skill-detail", "rewards", "booking", "logged", "settings"]);
      return allowed.has(alias) ? alias : "dashboard";
    }

    function getInitialScreenFromUrl() {
      const url = new URL(window.location.href);
      const tab = url.searchParams.get("tab");
      const pageDefault = (typeof window !== "undefined" && window.WH_INITIAL_TAB)
        ? String(window.WH_INITIAL_TAB)
        : "dashboard";
      return normalizeScreenId(tab || pageDefault);
    }

    function updateScreenQueryParam(screenId) {
      const activeTab = screenId === "skill-detail" ? "skills" : screenId;
      const tabParam = activeTab === "settings" ? "about" : activeTab;
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabParam);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    function showScreen(screenId) {
      const nextScreenId = normalizeScreenId(screenId);
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
      const activeScreen = document.querySelector(`#${nextScreenId}`) || document.querySelector("#dashboard");
      if (!activeScreen) return;
      activeScreen.classList.add("active");
      activeScreen.classList.add("loading");
      setTimeout(() => activeScreen.classList.remove("loading"), 140);
      const activeTab = nextScreenId === "skill-detail" ? "skills" : nextScreenId;
      document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.screen === activeTab);
      });
      updateScreenQueryParam(nextScreenId);
      if (activeTab === "rewards" && typeof renderRewards === "function") {
        recalculatePointsFromHistory();
        renderGlanceChips();
        renderRewards();
      }
      updateStickyCta();
    }
