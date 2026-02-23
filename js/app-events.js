    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const tabBtn = target.closest(".tab-btn");
      const actionEl = target.closest("[data-action]");
      const getEventByKind = (kind, eventId) => (
        kind === "assessment"
          ? state.slots.find(s => s.id === eventId)
          : state.monthlyWalks.find(w => w.id === eventId)
      );

      if (tabBtn instanceof HTMLElement) {
        const screenId = tabBtn.dataset.screen;
        showScreen(screenId);
        if (screenId === "rewards") {
          recalculatePointsFromHistory();
          renderGlanceChips();
          renderRewards();
          persistState();
        }
      }

      const action = actionEl instanceof HTMLElement ? actionEl.dataset.action : undefined;
      const id = actionEl instanceof HTMLElement ? Number(actionEl.dataset.id) : NaN;
      const kind = actionEl instanceof HTMLElement ? actionEl.dataset.kind : undefined;
      if (action === "unlock-skill") openUnlockSkillModal(id);
      if (action === "view-skill") {
        state.selectedSkillId = id;
        renderSkillDetail();
        showScreen("skill-detail");
      }
      if (action === "open-assessment-booking") {
        document.getElementById("submitEvidenceBtn").click();
      }
      if (action === "focus-assessor-code") {
        const code = window.prompt("Enter Stage 4 assessor code");
        if (code === null) return;
        applyAssessmentCodeForSelectedSkill(code);
      }
      if (action === "show-more-logs") {
        const current = state.loggedSkillLimits[id] || 20;
        state.loggedSkillLimits[id] = current + 20;
        renderLoggedSkills();
        persistState();
      }
      if (action === "show-more-logs-date") {
        state.loggedDateLimit = (state.loggedDateLimit || 30) + 30;
        renderLoggedSkills();
        persistState();
      }
      if (action === "toggle-log-select") {
        const logId = actionEl instanceof HTMLElement ? actionEl.dataset.logId : undefined;
        if (!logId) return;
        if (actionEl instanceof HTMLInputElement && actionEl.checked) state.selectedLogIds[logId] = true;
        else delete state.selectedLogIds[logId];
        renderLoggedSkills();
        persistState();
      }
      if (action === "edit-log") {
        const skillId = actionEl instanceof HTMLElement ? Number(actionEl.dataset.skillId) : NaN;
        const logId = actionEl instanceof HTMLElement ? actionEl.dataset.logId : undefined;
        if (skillId && logId) editPracticeLog(skillId, logId);
      }
      if (action === "delete-log") {
        const skillId = actionEl instanceof HTMLElement ? Number(actionEl.dataset.skillId) : NaN;
        const logId = actionEl instanceof HTMLElement ? actionEl.dataset.logId : undefined;
        if (skillId && logId) deletePracticeLog(skillId, logId);
      }
      if (action === "book-slot") {
        const slot = state.slots.find(s => s.id === id);
        if (slot && slot.status === "pending") {
          if (slot.bookedCount < slot.capacity) {
            slot.bookedCount += 1;
            slot.status = "booked";
            slot.paymentStatus = "unpaid";
            slot.bookingPointHistoryIds = slot.bookingPointHistoryIds || [];
            const bookAwardId = awardEvent("book_walk_early", { sourceKey: `booking:assessment:${slot.id}` });
            if (bookAwardId) slot.bookingPointHistoryIds.push(bookAwardId);
            showToast("Assessment booked.");
            renderAll();
          } else {
            slot.waitlistCount += 1;
            slot.status = "waitlisted";
            showToast("Added to assessment waitlist.", "warn");
            renderAll();
          }
        }
      }
      if (action === "book-walk") {
        const walk = state.monthlyWalks.find(w => w.id === id);
        if (walk && walk.status === "pending") {
          if (walk.bookedCount < walk.capacity) {
            walk.bookedCount += 1;
            walk.status = "booked";
            walk.paymentStatus = "unpaid";
            walk.bookingPointHistoryIds = walk.bookingPointHistoryIds || [];
            const earlyAwardId = awardEvent("book_walk_early", { sourceKey: `booking:hillwalk:${walk.id}` });
            if (earlyAwardId) walk.bookingPointHistoryIds.push(earlyAwardId);
            const attendanceAwardId = awardEvent("walk_attendance", { sourceKey: `booking:hillwalk:${walk.id}` });
            if (attendanceAwardId) walk.bookingPointHistoryIds.push(attendanceAwardId);
            showToast("Hill walk booked. Attendance logged.");
            renderAll();
          } else {
            walk.waitlistCount += 1;
            walk.status = "waitlisted";
            showToast("Added to hill walk waitlist.", "warn");
            renderAll();
          }
        }
      }
      if (action === "pay-now" && kind) {
        const event = getEventByKind(kind, id);
        if (event && event.status === "booked") {
          const payType = kind === "assessment" ? "assessment" : "walk";
          const label = kind === "assessment"
            ? `${event.day} ${event.time}`
            : (event.month || `${event.day} ${event.time}`);
          const payUrl = `payment.html?type=${encodeURIComponent(payType)}&skill=${encodeURIComponent(label)}&skillId=${event.id}`;
          window.location.assign(payUrl);
          showToast("Complete payment in Stripe. Paid status should be updated from Stripe confirmation.");
        }
      }
      if (action === "leave-waitlist" && kind) {
        const event = getEventByKind(kind, id);
        if (event && event.status === "waitlisted") {
          event.status = "pending";
          if (event.waitlistCount > 0) event.waitlistCount -= 1;
          showToast("Removed from waitlist.");
          renderAll();
        }
      }
      if (action === "cancel-booking" && kind) {
        const event = getEventByKind(kind, id);
        if (event && event.status === "booked") {
          event.status = "pending";
          delete event.paymentStatus;
          const removedPoints = removePointsHistoryByIds(event.bookingPointHistoryIds || []);
          event.bookingPointHistoryIds = [];
          if (event.bookedCount > 0) event.bookedCount -= 1;
          if (event.waitlistCount > 0) {
            event.waitlistCount -= 1;
            event.bookedCount += 1;
            showToast(removedPoints > 0
              ? `Booking canceled. -${removedPoints} pts removed. One waitlisted participant was auto-promoted.`
              : "Booking canceled. One waitlisted participant was auto-promoted.");
          } else {
            showToast(removedPoints > 0 ? `Booking canceled. -${removedPoints} pts removed.` : "Booking canceled.");
          }
          renderAll();
        }
      }
    });

    document.getElementById("practiceGainBtn").addEventListener("click", () => {
      const skill = state.skills.find(s => s.id === state.selectedSkillId);
      if (!skill || !skill.unlocked) return;
      state.practicePanelOpen = !state.practicePanelOpen;
      renderSkillDetail();
      persistState();
    });
    document.getElementById("closePracticePanelBtn").addEventListener("click", () => {
      state.practicePanelOpen = false;
      renderSkillDetail();
      persistState();
    });
    document.getElementById("practiceForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const skill = state.skills.find(s => s.id === state.selectedSkillId);
      if (!skill || !skill.unlocked) return;

      const date = document.getElementById("practiceDate").value;
      const duration = Number(document.getElementById("practiceDuration").value);
      const focus = document.getElementById("practiceFocus").value;
      const notes = document.getElementById("practiceNotes").value.trim();
      if (!date || !duration) return;

      if (!state.practiceLogs[skill.id]) state.practiceLogs[skill.id] = [];
      const loggedAt = new Date().toISOString();
      state.practiceLogs[skill.id].unshift({
        id: `${skill.id}-${loggedAt}-${Math.random().toString(16).slice(2, 8)}`,
        date,
        duration,
        focus,
        notes,
        loggedAt
      });
      state.practicePanelOpen = false;
      document.getElementById("practiceNotes").value = "";
      showToast("Practice log saved.");
      renderAll();
    });
    document.getElementById("toggleLogSelectModeBtn").addEventListener("click", () => {
      state.logSelectionMode = !state.logSelectionMode;
      if (!state.logSelectionMode) state.selectedLogIds = {};
      renderLoggedSkills();
      persistState();
    });
    document.getElementById("loggedViewModeSelect").addEventListener("change", (e) => {
      state.loggedViewMode = e.target.value === "date" ? "date" : "skill";
      state.selectedLogIds = {};
      renderLoggedSkills();
      persistState();
    });
    document.getElementById("cancelLogEditBtn").addEventListener("click", () => {
      closeLogEditModal();
    });
    document.getElementById("logEditForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const ctx = state.logEditContext;
      if (!ctx) return;

      const originSkillId = ctx.skillId;
      const logId = ctx.logId;
      const originLogs = state.practiceLogs[originSkillId] || [];
      const idx = originLogs.findIndex((l) => l.id === logId);
      if (idx < 0) {
        closeLogEditModal();
        return;
      }
      const current = originLogs[idx];
      const targetSkillId = Number(document.getElementById("logEditSkill").value);
      const date = document.getElementById("logEditDate").value.trim();
      const focus = document.getElementById("logEditStep").value.trim();
      const duration = Number(document.getElementById("logEditDuration").value);
      const notes = document.getElementById("logEditComment").value.trim();
      if (!targetSkillId || !date || !focus || Number.isNaN(duration) || duration <= 0) {
        showToast("Please complete all required fields.", "warn");
        return;
      }

      const updated = {
        ...current,
        date,
        focus,
        duration,
        notes
      };
      originLogs.splice(idx, 1);
      if (!state.practiceLogs[targetSkillId]) state.practiceLogs[targetSkillId] = [];
      state.practiceLogs[targetSkillId].unshift(updated);
      if (state.selectedSkillId === originSkillId && originSkillId !== targetSkillId) {
        state.selectedSkillId = targetSkillId;
      }
      closeLogEditModal();
      showToast("Practice log updated.");
      renderAll();
    });
    document.getElementById("deleteSelectedLogsBtn").addEventListener("click", () => {
      const selected = Object.keys(state.selectedLogIds);
      if (!selected.length) {
        showToast("No logs selected.", "warn");
        return;
      }
      const ok = window.confirm(`Delete ${selected.length} selected log${selected.length === 1 ? "" : "s"}?`);
      if (!ok) return;
      let removedPointsTotal = 0;
      Object.keys(state.practiceLogs).forEach((skillId) => {
        state.practiceLogs[skillId] = (state.practiceLogs[skillId] || []).filter((log) => {
          if (!state.selectedLogIds[log.id]) return true;
          removedPointsTotal += removePracticeLogPointsIfEligible(log);
          return false;
        });
      });
      state.selectedLogIds = {};
      state.logSelectionMode = false;
      showToast(
        removedPointsTotal > 0
          ? `${selected.length} logs deleted. -${removedPointsTotal} pts removed.`
          : `${selected.length} logs deleted.`
      );
      renderAll();
    });
    document.getElementById("stepsContainer").addEventListener("change", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== "checkbox") return;

      const step = Number(target.dataset.step);
      const item = Number(target.dataset.item);
      const skillId = state.selectedSkillId;
      if (!skillId || !step || Number.isNaN(item)) return;
      if (!isStepUnlocked(skillId, step)) return;

      const checks = getSkillStepChecks(skillId);
      checks[step][item] = target.checked;
      syncSkillProgressFromSteps(skillId);
      renderSkills();
      renderSkillDetail();
      persistState();
    });
    document.getElementById("stage5StretchBox").addEventListener("change", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.id !== "stage5StretchCheck") return;
      const skill = state.skills.find((s) => s.id === state.selectedSkillId);
      if (!skill || skill.progressStatus !== "passed") return;
      if (target.checked) state.stage5StretchDoneBySkill[skill.id] = true;
      else delete state.stage5StretchDoneBySkill[skill.id];
      renderSkills();
      renderSkillDetail();
      persistState();
    });
    document.getElementById("submitEvidenceBtn").addEventListener("click", () => {
      const skill = state.skills.find(s => s.id === state.selectedSkillId);
      if (!skill || !skill.unlocked) return;
      state.bookingFilters.type = "assessment";
      state.bookingFilters.status = "all";
      showScreen("booking");
      renderBooking();
      persistState();
      showToast("Choose an assessment slot to book in.");
    });
    document.getElementById("dashboardEditUserBtn").addEventListener("click", () => {
      const nextName = window.prompt("Update username", state.user || "");
      if (nextName === null) return;
      const cleanName = nextName.trim();
      if (!cleanName) return;
      state.user = cleanName;
      try {
        localStorage.setItem(SAVED_USERNAME_KEY, cleanName);
      } catch (e) {
        // Ignore storage access issues in preview environments.
      }
      showToast("Username updated.");
      renderAll();
    });
    document.getElementById("copyReferralBtn").addEventListener("click", async () => {
      const link = getReferralLink();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link);
          showToast("Referral link copied.");
        } else {
          showToast("Copy not available on this browser.", "warn");
        }
      } catch (e) {
        showToast("Could not copy link. You can copy it manually.", "warn");
      }
    });
    document.getElementById("jumpToBookingBtn").addEventListener("click", () => {
      showScreen("booking");
      showToast("Find your next event and keep climbing.");
    });
    document.getElementById("mobileStickyCtaBtn").addEventListener("click", () => {
      document.getElementById("submitEvidenceBtn").click();
    });
    document.getElementById("backToSkillsBtn").addEventListener("click", () => {
      showScreen("skills");
    });
    document.getElementById("bookingTypeFilter").addEventListener("change", (e) => {
      state.bookingFilters.type = e.target.value;
      renderBooking();
      persistState();
    });
    document.getElementById("bookingStatusFilter").addEventListener("change", (e) => {
      state.bookingFilters.status = e.target.value;
      renderBooking();
      persistState();
    });
    document.getElementById("unlockSkillCancelBtn").addEventListener("click", () => {
      closeUnlockSkillModal();
    });
    document.getElementById("unlockViaCodeBtn").addEventListener("click", () => {
      document.getElementById("unlockCodeSection").style.display = "grid";
      document.getElementById("unlockCodeInput").focus();
    });
    document.getElementById("unlockCodeCancelBtn").addEventListener("click", () => {
      document.getElementById("unlockCodeInput").value = "";
      document.getElementById("unlockCodeSection").style.display = "none";
    });
    document.getElementById("unlockCodeSubmitBtn").addEventListener("click", () => {
      submitUnlockCode();
    });
    document.getElementById("unlockViaPaymentBtn").addEventListener("click", () => {
      startPaymentUnlockFlow();
    });
    document.getElementById("unlockCodeInput").addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      submitUnlockCode();
    });
    document.getElementById("unlockSkillModalBackdrop").addEventListener("click", (e) => {
      if (e.target && e.target.id === "unlockSkillModalBackdrop") closeUnlockSkillModal();
    });

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      updateInstallGate();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      updateInstallGate();
    });
    document.getElementById("installAppBtn").addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try {
        await deferredInstallPrompt.userChoice;
      } catch (e) {
        // Ignore prompt errors in preview environments.
      }
      deferredInstallPrompt = null;
      updateInstallGate();
    });

    syncAllSkillProgressFromSteps();
    renderAll();
    showScreen(getInitialScreenFromUrl());
    updateInstallGate();
    hydrateRemoteEvents({ silent: true });
    setInterval(() => {
      hydrateRemoteEvents({ silent: true });
    }, REMOTE_EVENTS_REFRESH_MS);
