    function renderDashboard() {
      const rank = getRank(state.points);
      const unlocked = unlockedSkills();
      const assessmentsBooked = state.slots.filter(e => e.status === "booked" || e.status === "passed").length;
      const walksBooked = state.monthlyWalks.filter(e => e.status === "booked" || e.status === "passed").length;
      const walksAttended = state.monthlyWalks.filter(e => e.status === "passed").length;
      const walksNeededForMaster = Math.max(0, 5 - walksAttendedCount());
      const skillsNeededForMaster = Math.max(0, 14 - unlocked.length);
      const skillsPassed = Object.keys(state.skillAssessmentsPassed).length;
      const nextRank = rank.next;
      const start = rank.min;
      const end = nextRank || rank.min;
      const pct = nextRank ? Math.max(0, Math.min(100, ((state.points - start) / (end - start)) * 100)) : 100;

      document.getElementById("rankLabel").textContent = rank.name;
      document.getElementById("totalPoints").textContent = state.points;
      document.getElementById("unlockedCount").textContent = `${unlocked.length} / ${state.skills.length}`;
      document.getElementById("dashboardUserName").textContent = state.user;
      document.getElementById("statAssessmentsBooked").textContent = assessmentsBooked;
      document.getElementById("statWalksBooked").textContent = walksBooked;
      document.getElementById("statWalksAttended").textContent = walksAttended;
      document.getElementById("statSkillsPassed").textContent = skillsPassed;
      const dashboardSyncEl = document.getElementById("dashboardSyncState");
      if (dashboardSyncEl) {
        const fmt = (iso) => {
          if (!iso) return "";
          const dt = new Date(iso);
          if (Number.isNaN(dt.getTime())) return "";
          return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        };
        const syncTime = fmt(state.eventsLastSyncedAt);
        if (state.eventsSyncStatus === "ready") {
          dashboardSyncEl.textContent = syncTime ? `Sync status: Up to date (last sync ${syncTime})` : "Sync status: Up to date";
          dashboardSyncEl.classList.remove("warn");
        } else if (state.eventsSyncStatus === "loading") {
          dashboardSyncEl.textContent = "Sync status: Checking latest events...";
          dashboardSyncEl.classList.remove("warn");
        } else if (state.eventsSyncStatus === "error") {
          dashboardSyncEl.textContent = "Sync status: Could not sync latest events.";
          dashboardSyncEl.classList.add("warn");
        } else {
          dashboardSyncEl.textContent = "Sync status: Not checked yet.";
          dashboardSyncEl.classList.remove("warn");
        }
      }
      const backupTextEl = document.getElementById("dashboardBackupText");
      const lastBackupEl = document.getElementById("dashboardLastBackup");
      if (backupTextEl) {
        if (!state.lastBackupAt) {
          backupTextEl.textContent = "No backup exported yet. Export now before changing or deleting your app/device.";
          if (lastBackupEl) lastBackupEl.textContent = "Last backed up: Never";
        } else {
          const backupDate = new Date(state.lastBackupAt);
          if (Number.isNaN(backupDate.getTime())) {
            backupTextEl.textContent = "Backup date unavailable. Export a fresh backup now.";
            if (lastBackupEl) lastBackupEl.textContent = "Last backed up: Unknown";
          } else {
            const days = Math.floor((Date.now() - backupDate.getTime()) / (24 * 60 * 60 * 1000));
            const last = backupDate.toLocaleDateString();
            const lastWithTime = `${backupDate.toLocaleDateString()} ${backupDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
            if (lastBackupEl) lastBackupEl.textContent = `Last backed up: ${lastWithTime}`;
            if (days >= 14) {
              backupTextEl.textContent = `Last backup: ${last} (${days} days ago). Consider exporting a fresh backup now.`;
            } else {
              backupTextEl.textContent = `Last backup: ${last}. Keep this file safe in cloud storage or email.`;
            }
          }
        }
      }
      document.getElementById("rankProgress").style.width = `${pct}%`;
      document.getElementById("progressPct").textContent = `${Math.round(pct)}%`;
      document.getElementById("progressLabel").textContent = nextRank
        ? `${Math.max(0, nextRank - state.points)} pts to ${rank.nextName}`
        : "Top level achieved";
      if (rank.nextName === "Trail Dog Master" && state.points >= 1249 && !hasMasterRequirements()) {
        document.getElementById("progressLabel").textContent = `Master unlock needs ${skillsNeededForMaster} skills + ${walksNeededForMaster} walks`;
      }

      const monthly = getCurrentMonthlySkill() || state.skills[0];
      document.getElementById("monthlySkillName").textContent = monthly ? monthly.name : "-";
      document.getElementById("monthlySkillDesc").textContent = monthly ? monthly.desc : "";

      const unlockedTags = document.getElementById("unlockedSkillsTags");
      unlockedTags.innerHTML = unlocked.length
        ? unlocked.map((s) => {
          const progress = getProgressMeta(s);
          const statusClass = progress && progress.className ? ` status-${progress.className}` : "";
          return `
            <button
              type="button"
              class="tag${statusClass}"
              data-action="view-skill"
              data-id="${s.id}"
              aria-label="Open ${s.name} details"
            >${s.name}</button>
          `;
        }).join("")
        : `<span class="tag locked">No unlocked skills yet</span>`;
    }

    function renderGlanceChips() {
      const rank = getRank(state.points);
      const rankIconMap = {
        "No Rank Yet": "○",
        "Trail Dog Starter": "🧭",
        "Trail Dog Rookie": "🐾",
        "Trail Dog Explorer": "🥾",
        "Trail Dog Advanced": "⛰",
        "Trail Dog Pathfinder": "🗺️",
        "Trail Dog Expert": "🏕️",
        "Trail Dog Master": "👑"
      };
      const rankIcon = rankIconMap[rank.name] || "🏅";
      document.querySelectorAll("[data-glance-rank]").forEach(el => {
        el.textContent = `Rank: ${rankIcon} ${rank.name}`;
      });
      document.querySelectorAll("[data-glance-points]").forEach(el => {
        el.textContent = `Points: ${state.points}`;
      });
    }

    function getProgressMeta(skill) {
      if (!skill || !skill.unlocked) return null;
      const status = skill.progressStatus;
      if (status === "passed" && state.stage5StretchDoneBySkill[skill.id]) {
        return { text: "Mastered", className: "passed-stretch" };
      }
      if (status === "passed") return { text: "Passed", className: "passed" };
      if (status === "needs_more_work") return { text: "Needs More Work", className: "needs-more-work" };
      if (status === "in_progress") return { text: "In Progress", className: "in-progress" };
      if (status === "not_started") return { text: "Not Started", className: "not-started" };
      return { text: "Not Started", className: "not-started" };
    }

    function renderSkills() {
      const container = document.getElementById("skillsGrid");
      container.innerHTML = state.skills.map(skill => {
        const progress = skill.unlocked ? getProgressMeta(skill) : null;
        const trailEtiquetteLocked = skill.id === 14 && !areFirstThirteenSkillsPassed();
        const statusClass = !skill.unlocked
          ? "locked"
          : `status-${(progress?.className || (skill.progressStatus || "not_started").replaceAll("_", "-"))}`;
        return `
        <article class="skill-card ${statusClass}">
          <div class="inline">
            <h3 style="margin:0">${skill.name}</h3>
            <span class="status ${skill.unlocked ? progress.className : "locked"}">${skill.unlocked ? progress.text : "Locked"}</span>
          </div>
          <p class="muted">${skill.desc}</p>
          <div class="btn-row">
            ${skill.unlocked
              ? `<button class="btn-secondary" data-action="view-skill" data-id="${skill.id}">View Skill</button>`
              : trailEtiquetteLocked
                ? `<button class="btn-secondary" disabled>Pass Skills 1-13 First</button>`
                : `<button class="btn-primary" data-action="unlock-skill" data-id="${skill.id}">Unlock Skill</button>`}
          </div>
          ${trailEtiquetteLocked ? `<p class="muted">Unlocks only after all first 13 skills are passed.</p>` : ``}
        </article>
      `;
      }).join("");
    }

    function findSkillByName(name) {
      return state.skills.find(skill => skill.name === name);
    }

    function getSkillStepChecks(skillId) {
      if (!state.skillStepChecks[skillId]) {
        state.skillStepChecks[skillId] = {
          1: [false],
          2: [false],
          3: [false],
          4: [false]
        };
      } else {
        [1, 2, 3, 4].forEach((stepNum) => {
          const existing = state.skillStepChecks[skillId][stepNum];
          const normalized = Array.isArray(existing) ? [existing.some(Boolean)] : [Boolean(existing)];
          state.skillStepChecks[skillId][stepNum] = normalized;
        });
      }
      return state.skillStepChecks[skillId];
    }

    function isStepComplete(skillId, stepNum) {
      const checks = getSkillStepChecks(skillId);
      return checks[stepNum].every(Boolean);
    }

    function isStepUnlocked(skillId, stepNum) {
      if (stepNum === 1) return true;
      return isStepComplete(skillId, stepNum - 1);
    }

    function buildSteps(skillId) {
      const cfg = SKILL_STAGE_CONTENT[skillId] || SKILL_STAGE_CONTENT[1];
      const checks = getSkillStepChecks(skillId);
      const skill = state.skills.find((s) => s.id === skillId);
      const stage4Passed = Boolean(skill && skill.progressStatus === "passed");
      return [1, 2, 3, 4].map((stepNum) => {
        const unlocked = isStepUnlocked(skillId, stepNum);
        const complete = isStepComplete(skillId, stepNum);
        if (stepNum === 4) {
          return `
            <details class="${unlocked ? "" : "step-locked"}" ${unlocked ? "open" : ""}>
              <summary>Stage 4 ${unlocked ? "(Pass Criteria)" : "(Locked)"} ${stage4Passed ? "✓" : ""}</summary>
              <div class="checklist">
                <div class="muted">${(cfg.stages[4] || "").replace(/^Stage\s+\d+\s*-\s*/i, "")}</div>
                ${stage4Passed ? `<div class="muted"><strong>${skill.name} passed assessment.</strong></div>` : ""}
                ${unlocked && !stage4Passed ? `
                  <div class="btn-row" style="margin-top: 6px;">
                    <button class="btn-secondary" type="button" data-action="open-assessment-booking">Book In For Assessment</button>
                    <button class="btn-secondary" type="button" data-action="focus-assessor-code">Enter Assessor Code</button>
                  </div>
                ` : ""}
              </div>
            </details>
          `;
        }

        return `
          <details class="${unlocked ? "" : "step-locked"}" ${(unlocked && !complete) ? "open" : ""}>
            <summary>Stage ${stepNum} ${complete ? "✓" : (unlocked ? "" : "(Locked)")}</summary>
            <div class="checklist">
              <label class="check-item">
                <input type="checkbox" data-step="${stepNum}" data-item="0" ${checks[stepNum][0] ? "checked" : ""} ${unlocked ? "" : "disabled"}>
                ${(cfg.stages[stepNum] || "").replace(/^Stage\s+\d+\s*-\s*/i, "")}
              </label>
            </div>
          </details>
        `;
      }).join("");
    }

    function getStageFocusOptions(skillId) {
      const cfg = SKILL_STAGE_CONTENT[skillId] || SKILL_STAGE_CONTENT[1];
      const options = [1, 2, 3, 4].map((stageNum) => {
        const raw = String((cfg && cfg.stages && cfg.stages[stageNum]) || `Stage ${stageNum}`).trim();
        const label = raw.includes(":") ? raw.split(":")[0].trim() : raw;
        return { value: label, label };
      });
      options.push({ value: "Stage 5 - Stretch Goal", label: "Stage 5 - Stretch Goal" });
      return options;
    }

    function populateStageFocusSelect(selectEl, skillId, selectedValue) {
      if (!(selectEl instanceof HTMLSelectElement)) return;
      const options = getStageFocusOptions(skillId);
      selectEl.innerHTML = options.map((opt) => {
        const escapedValue = String(opt.value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        const escapedLabel = String(opt.label).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<option value="${escapedValue}">${escapedLabel}</option>`;
      }).join("");
      const wanted = String(selectedValue || "").trim();
      if (wanted && options.some((opt) => opt.value === wanted)) {
        selectEl.value = wanted;
      } else {
        selectEl.value = options[0].value;
      }
    }

    function renderSkillDetail() {
      let selected = state.skills.find(s => s.id === state.selectedSkillId);
      if (!selected || !selected.unlocked) {
        selected = unlockedSkills()[0];
        if (selected) state.selectedSkillId = selected.id;
      }

      if (!selected) {
        document.getElementById("detailTitle").textContent = "No Unlocked Skills Yet";
        document.getElementById("detailDescription").textContent = "Unlock a skill from Skills Overview to begin.";
        document.getElementById("detailStatus").textContent = "Locked";
        document.getElementById("stepsContainer").innerHTML = "";
        document.getElementById("level5Heading").textContent = "Stage 5 (Locked)";
        document.getElementById("trailStandardText").textContent = "";
        document.getElementById("trailStandardText").style.display = "none";
        document.getElementById("stage5Details").classList.add("step-locked");
        document.getElementById("stage5Details").removeAttribute("open");
        document.getElementById("skillPoints").textContent = "0";
        document.getElementById("submitEvidenceBtn").disabled = true;
        document.getElementById("submitEvidenceBtn").style.display = "none";
        document.getElementById("submitEvidenceBtn").textContent = "Book In For Skill Assessment";
        const badgeBox = document.getElementById("skillBadgeBox");
        badgeBox.classList.remove("earned");
        badgeBox.innerHTML = "";
        badgeBox.style.display = "none";
        document.getElementById("practiceLogPanel").style.display = "none";
        updateStickyCta();
        return;
      }

      document.getElementById("detailTitle").textContent = selected.name;
      document.getElementById("detailDescription").textContent = selected.desc;
      document.getElementById("detailStatus").textContent = selected.unlocked ? getProgressMeta(selected).text : "Locked";
      document.getElementById("skillPoints").textContent = selected.points;
      document.getElementById("stepsContainer").innerHTML = buildSteps(selected.id);
      populateStageFocusSelect(document.getElementById("practiceFocus"), selected.id);
      const stage4Unlocked = isStepUnlocked(selected.id, 4);
      const skillContent = SKILL_STAGE_CONTENT[selected.id] || SKILL_STAGE_CONTENT[1];
      const isPassed = selected.progressStatus === "passed";
      const stretchDone = Boolean(state.stage5StretchDoneBySkill[selected.id]);
      const stage5Details = document.getElementById("stage5Details");
      const stage5Text = document.getElementById("trailStandardText");
      document.getElementById("level5Heading").textContent = isPassed
        ? (stretchDone ? "Stage 5: Stretch Goal ✓" : "Stage 5: Stretch Goal")
        : "Stage 5 (Locked)";
      if (isPassed) {
        stage5Details.classList.remove("step-locked");
        stage5Details.setAttribute("open", "");
        stage5Text.style.display = "none";
        stage5Text.textContent = "";
      } else {
        stage5Details.classList.add("step-locked");
        stage5Details.removeAttribute("open");
        stage5Text.style.display = "none";
        stage5Text.textContent = "";
      }
      const stage5StretchBox = document.getElementById("stage5StretchBox");
      if (stage5StretchBox) {
        stage5StretchBox.style.display = isPassed ? "grid" : "none";
        stage5StretchBox.innerHTML = isPassed
          ? `
            <label class="check-item">
              <input type="checkbox" id="stage5StretchCheck" ${stretchDone ? "checked" : ""}>
              ${skillContent.stretch}
            </label>
          `
          : "";
      }
      const evidenceDone = Boolean(state.skillEvidenceSubmitted[selected.id]);
      const evidenceBtn = document.getElementById("submitEvidenceBtn");
      evidenceBtn.style.display = "none";
      const needsMoreWork = selected.progressStatus === "needs_more_work";
      evidenceBtn.disabled = evidenceDone && !needsMoreWork;
      evidenceBtn.textContent = "Book In For Skill Assessment";
      const badgeBox = document.getElementById("skillBadgeBox");
      if (selected.progressStatus === "passed") {
        badgeBox.classList.add("earned");
        badgeBox.style.display = "block";
        badgeBox.innerHTML = `
          <div class="badge-award">
            <div class="badge-mark">★</div>
            <div>
              <p class="badge-title">${selected.name} Mastery Badge</p>
              <p class="badge-sub">Trail Certified Achievement Unlocked</p>
            </div>
          </div>
        `;
      } else {
        badgeBox.classList.remove("earned");
        badgeBox.innerHTML = "";
        badgeBox.style.display = "none";
      }

      const panel = document.getElementById("practiceLogPanel");
      panel.style.display = state.practicePanelOpen ? "block" : "none";
      const logs = state.practiceLogs[selected.id] || [];
      document.getElementById("practiceLogCount").textContent = logs.length;
      document.getElementById("practiceLogList").innerHTML = logs.length
        ? logs.map(log => `
          <div class="log-item">
            <strong>${log.date}</strong> - ${log.duration} min - ${log.focus}
            <div class="muted">${log.notes || "No notes added."}</div>
            <div class="btn-row" style="margin-top: 6px;">
              <button class="btn-mini" data-action="edit-log" data-skill-id="${selected.id}" data-log-id="${log.id}">Edit</button>
              <button class="btn-mini" data-action="delete-log" data-skill-id="${selected.id}" data-log-id="${log.id}">Delete</button>
            </div>
          </div>
        `).join("")
        : `<div class="log-item">No logs yet for this skill.</div>`;

      const dateInput = document.getElementById("practiceDate");
      if (dateInput && !dateInput.value) {
        const today = new Date();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        dateInput.value = `${today.getFullYear()}-${m}-${d}`;
      }
      updateStickyCta();
    }

    function updateStickyCta() {
      const wrap = document.getElementById("mobileStickyCta");
      const detailActive = document.getElementById("skill-detail").classList.contains("active");
      const evidenceBtn = document.getElementById("submitEvidenceBtn");
      const canShow = detailActive && evidenceBtn && evidenceBtn.style.display !== "none" && !evidenceBtn.disabled;
      wrap.style.display = canShow ? "block" : "none";
    }

    function renderRewards() {
      document.getElementById("rewardPoints").textContent = state.points;
      const rewardMilestones = [
        { threshold: 75, label: "Trail Dog Starter", icon: "🧭", tier: "starter" },
        { threshold: 150, label: "Trail Dog Rookie", icon: "🐾", tier: "rookie" },
        { threshold: 300, label: "Trail Dog Explorer", icon: "🥾", tier: "explorer" },
        { threshold: 500, label: "Trail Dog Advanced", icon: "⛰", tier: "advanced" },
        { threshold: 700, label: "Trail Dog Pathfinder", icon: "🗺️", tier: "pathfinder" },
        { threshold: 950, label: "Trail Dog Expert", icon: "🏕️", tier: "expert" },
        { threshold: 1250, label: "Trail Dog Master", icon: "👑", tier: "master" }
      ];
      const prev = rewardMilestones.filter(r => state.points >= r.threshold).pop() || { threshold: 0, label: "Start" };
      const next = rewardMilestones.find(r => state.points < r.threshold);
      const bandSize = (next ? next.threshold : prev.threshold) - prev.threshold || 1;
      const inBand = state.points - prev.threshold;
      const rewardPct = next ? Math.max(0, Math.min(100, (inBand / bandSize) * 100)) : 100;
      document.getElementById("rewardJourneyProgress").style.width = `${rewardPct}%`;
      document.getElementById("rewardJourneyPct").textContent = `${Math.round(rewardPct)}%`;
      document.getElementById("rewardJourneyLabel").textContent = next
        ? `${state.points} / ${next.threshold} pts`
        : "All major rewards unlocked";
      document.getElementById("nextRewardText").textContent = next
        ? `${Math.max(0, next.threshold - state.points)} pts to reach ${next.label}`
        : "You unlocked every reward tier. Keep climbing.";
      const badgeTitleEl = document.getElementById("rewardBadgeTitle");
      const badgeSubEl = document.getElementById("rewardBadgeSub");
      const badgeIconEl = document.getElementById("rewardBadgeIcon");
      const badgeCardEl = document.getElementById("rewardBadgeCard");
      if (badgeCardEl) {
        badgeCardEl.classList.remove("tier-starter", "tier-rookie", "tier-explorer", "tier-advanced", "tier-pathfinder", "tier-expert", "tier-master");
        if (prev.threshold > 0 && prev.tier) badgeCardEl.classList.add(`tier-${prev.tier}`);
      }
      if (badgeTitleEl) badgeTitleEl.textContent = prev.threshold > 0 ? `${prev.label} Digital Badge` : "No Badge Yet";
      if (badgeSubEl) {
        badgeSubEl.textContent = prev.threshold > 0
          ? ""
          : "Reach 75 points to unlock your first digital badge.";
      }
      if (badgeIconEl) {
        badgeIconEl.textContent = prev.threshold > 0 ? (prev.icon || "🏅") : "🏔";
      }
      if (!next && !hasMasterRequirements()) {
        const skillsNeeded = Math.max(0, 14 - unlockedSkills().length);
        const walksNeeded = Math.max(0, 5 - walksAttendedCount());
        document.getElementById("nextRewardText").textContent = `Master requires ${skillsNeeded} more skills and ${walksNeeded} more walks`;
      }

      const groups = Object.entries(POINT_RULES || {});
      const formatGroupTitle = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
      document.getElementById("pointsRuleSummary").innerHTML = groups.map(([groupKey, rules]) => {
        const items = (rules || []).map(rule => `${rule.label}: +${rule.points}`).join("<br>");
        return `<strong>${formatGroupTitle(groupKey)}</strong><br>${items}`;
      }).concat([
        `<strong>Log Safeguard</strong><br>Training log points are removed if that log is deleted within 14 days.`
      ]).join("<br><br>");

      document.querySelectorAll("#rewardsLadder .step").forEach((step, index) => {
        const kind = step.getAttribute("data-kind");
        const threshold = Number(step.getAttribute("data-threshold"));
        const walkGoal = Number(step.getAttribute("data-walks"));
        const isMasterStep = threshold === 1250;
        const reached = kind === "all-skills-pass"
          ? Object.keys(state.skillAssessmentsPassed).length >= 14
          : kind === "walks-attended"
            ? walksAttendedCount() >= walkGoal
          : (isMasterStep ? (state.points >= threshold && hasMasterRequirements()) : state.points >= threshold);
        step.classList.toggle("reached", reached);

        const fallbackBase = step.getAttribute("data-base-label") || step.textContent.trim();
        step.setAttribute("data-base-label", fallbackBase);
        const rewardKey = kind
          ? `${kind}:${kind === "walks-attended" ? walkGoal : "all"}`
          : `threshold:${threshold || index}`;
        step.setAttribute("data-reward-key", rewardKey);
        step.setAttribute("data-reward-label", fallbackBase);
        step.setAttribute("data-claimable", reached ? "true" : "false");
        const isTrailStarter = !kind && threshold === 75;
        const claimDetails = (state.rewardClaimDetails || {})[rewardKey];
        const hasSubmittedClaimDetails = Boolean(
          claimDetails
          && claimDetails.submittedViaTally === true
        ) || Boolean(
          claimDetails
          && String(claimDetails.fullName || "").trim()
          && (
            (typeof claimDetails.address === "string" && String(claimDetails.address).trim())
            || (
              claimDetails.address
              && String(claimDetails.address.line1 || "").trim()
              && String(claimDetails.address.city || "").trim()
              && String(claimDetails.address.postcode || "").trim()
              && String(claimDetails.address.country || "").trim()
            )
          )
        );
        const claimed = reached && Boolean((state.claimedRewards || {})[rewardKey]) && hasSubmittedClaimDetails;
        const btnText = claimed ? "Claimed" : (reached ? "Claim Reward" : "Locked");
        const escapedLabel = fallbackBase
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const buttonHtml = isTrailStarter
          ? `<span class="muted reward-step-status">${reached ? "Auto Unlocked" : "Locked"}</span>`
          : `<button
              type="button"
              class="btn-secondary reward-claim-btn"
              data-action="claim-reward"
              data-reward-key="${rewardKey}"
              ${(!reached || claimed) ? "disabled" : ""}
            >${btnText}</button>`;
        step.innerHTML = `
          <div class="inline reward-step-row">
            <span class="reward-step-label">${escapedLabel}</span>
            ${buttonHtml}
          </div>
        `;
      });

      const history = document.getElementById("pointsHistoryList");
      if (!state.pointsHistory.length) {
        history.innerHTML = `<div class="log-item">No point events yet.</div>`;
      } else {
        history.innerHTML = state.pointsHistory.slice(0, 12).map(item => `
          <div class="log-item">
            <strong>+${item.points} pts</strong> - ${item.label}
            <div class="muted">${item.when}</div>
          </div>
        `).join("");
      }
    }

    function renderBooking() {
      if (!state.bookingFilters || typeof state.bookingFilters !== "object") {
        state.bookingFilters = { type: "all", status: "all" };
      }
      const validTypes = new Set(["all", "assessment", "hillwalk"]);
      const validStatuses = new Set(["all", "pending", "booked", "waitlisted", "passed"]);
      if (!validTypes.has(state.bookingFilters.type)) state.bookingFilters.type = "all";
      if (!validStatuses.has(state.bookingFilters.status)) state.bookingFilters.status = "all";

      const typeFilter = document.getElementById("bookingTypeFilter");
      const statusFilter = document.getElementById("bookingStatusFilter");
      if (typeFilter) {
        if (validTypes.has(typeFilter.value)) state.bookingFilters.type = typeFilter.value;
        typeFilter.value = state.bookingFilters.type;
      }
      if (statusFilter) {
        if (validStatuses.has(statusFilter.value)) state.bookingFilters.status = statusFilter.value;
        statusFilter.value = state.bookingFilters.status;
      }

      const parseDateTime = (dateISO, time12h) => {
        if (typeof dateISO !== "string" || !dateISO) return Number.POSITIVE_INFINITY;
        const timeText = typeof time12h === "string" && time12h.trim() ? time12h.trim() : "9:00 AM";
        const [time = "9:00", meridiem = "AM"] = timeText.split(" ");
        let [hour, minute] = time.split(":").map(Number);
        if (!Number.isFinite(hour)) hour = 9;
        if (!Number.isFinite(minute)) minute = 0;
        if (meridiem === "PM" && hour !== 12) hour += 12;
        if (meridiem === "AM" && hour === 12) hour = 0;
        const dt = new Date(`${dateISO}T00:00:00`);
        if (Number.isNaN(dt.getTime())) return Number.POSITIVE_INFINITY;
        dt.setHours(hour, minute, 0, 0);
        return dt.getTime();
      };

      const buildEvents = (typeValue, statusValue) => ([
        ...state.slots.map(slot => ({ ...slot, eventType: "assessment" })),
        ...state.monthlyWalks.map(walk => ({ ...walk, eventType: "hillwalk" }))
      ]
        .filter(event => typeValue === "all" || event.eventType === typeValue)
        .filter(event => statusValue === "all" || event.status === statusValue)
        .sort((a, b) => parseDateTime(a.dateISO, a.time) - parseDateTime(b.dateISO, b.time)));

      let events = buildEvents(state.bookingFilters.type, state.bookingFilters.status);

      const wrap = document.getElementById("bookingEvents");
      const syncEl = document.getElementById("bookingSyncState");
      if (syncEl) {
        const formatSyncTime = (isoText) => {
          if (!isoText) return "";
          const dt = new Date(isoText);
          if (Number.isNaN(dt.getTime())) return "";
          return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        };
        const statusText = state.eventsSyncStatus === "loading"
          ? "Checking latest events..."
          : state.eventsSyncStatus === "error"
            ? (state.eventsSyncMessage || "Could not sync latest events.")
            : (state.eventsSyncMessage || "Events are up to date.");
        const syncTime = formatSyncTime(state.eventsLastSyncedAt);
        syncEl.innerHTML = syncTime
          ? `${statusText}<br><span class="muted">Last synced at ${syncTime}</span>`
          : statusText;
        syncEl.classList.toggle("warn", state.eventsSyncStatus === "error");
      }

      if (!events.length) {
        if (state.eventsSyncStatus === "loading") {
          wrap.innerHTML = `<div class="card"><p class="muted">Loading events...</p></div>`;
          return;
        }
        if (state.eventsSyncStatus === "error") {
          wrap.innerHTML = `
            <div class="card">
              <p class="muted">Couldn't load events right now.</p>
              <div class="btn-row">
                <button class="btn-secondary" data-action="retry-events-sync">Try Again</button>
              </div>
            </div>
          `;
          return;
        }
        wrap.innerHTML = `<div class="card"><p class="muted">No events match the selected filters.</p></div>`;
        return;
      }
      const now = Date.now();
      const toStatusText = (status) => (
        status === "pending" ? "Not Booked"
          : status === "booked" ? "Booked"
          : status === "waitlisted" ? "Waitlisted"
          : "Passed"
      );

      const renderEventCard = (event) => {
        const paymentState = event.paymentStatus || "unpaid";
        const primaryAction = event.status === "pending"
          ? `<button class="btn-primary" data-action="${event.eventType === "assessment" ? "book-slot" : "book-walk"}" data-id="${event.id}">${event.waitlistOnly ? "Join Waitlist" : (event.eventType === "assessment" ? "Book" : "Book Walk")}</button>`
          : event.status === "booked" && paymentState === "paid"
            ? ""
            : event.status === "booked"
              ? `<button class="btn-primary" data-action="pay-now" data-id="${event.id}" data-kind="${event.eventType}">Pay</button>`
                : "";
        const paymentBadge = event.status === "booked" && paymentState === "paid"
          ? `<span class="status-pill payment">Paid</span>`
          : event.status === "booked"
            ? `<span class="status-pill pending">Payment Due</span>`
            : "";
        const secondaryAction = event.status === "booked"
          ? `<button class="btn-secondary" data-action="cancel-booking" data-id="${event.id}" data-kind="${event.eventType}">Cancel</button>`
          : event.status === "waitlisted"
            ? `<button class="btn-secondary" data-action="leave-waitlist" data-id="${event.id}" data-kind="${event.eventType}">Leave Waitlist</button>`
            : "";

        return `
          <div class="slot">
            <div>
              <strong>${event.day} - ${event.time}</strong>
              <small>
                ${event.eventType === "assessment" ? "Assessment Day" : event.month}
                | ${event.location}
                ${event.eventType === "hillwalk" ? ` | Skill Focus: ${event.skill}` : ""}
                | ${event.waitlistOnly ? "Waitlist Only" : "Booking Open"}
              </small>
            </div>
            <div class="btn-row" style="margin:0;">
              ${primaryAction}
              ${secondaryAction}
              ${paymentBadge}
              ${event.status === "pending" ? "" : `<span class="status-pill ${event.status}">${toStatusText(event.status)}</span>`}
            </div>
          </div>
        `;
      };

      const renderSection = (title, sectionEvents, emptyText, reverseChronological = false) => {
        if (!sectionEvents.length) {
          return `
            <div class="card">
              <h3>${title}</h3>
              <p class="muted">${emptyText}</p>
            </div>
          `;
        }

        const ordered = [...sectionEvents].sort((a, b) => {
          const diff = parseDateTime(a.dateISO, a.time) - parseDateTime(b.dateISO, b.time);
          return reverseChronological ? -diff : diff;
        });

        let sectionHtml = `<div class="card"><h3>${title}</h3>`;
        let activeMonth = "";
        ordered.forEach((event) => {
          const monthDate = new Date(`${event.dateISO}T00:00:00`);
          const monthKey = Number.isNaN(monthDate.getTime())
            ? "Upcoming"
            : monthDate.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric"
              });
          if (monthKey !== activeMonth) {
            activeMonth = monthKey;
            sectionHtml += `<p class="month-header">${monthKey}</p>`;
          }
          sectionHtml += renderEventCard(event);
        });
        sectionHtml += `</div>`;
        return sectionHtml;
      };

      const yourBookings = events.filter((event) => {
        const eventTime = parseDateTime(event.dateISO, event.time);
        return (event.status === "booked" || event.status === "waitlisted") && eventTime >= now;
      });
      const availableToBook = events.filter((event) => {
        const eventTime = parseDateTime(event.dateISO, event.time);
        return event.status === "pending" && eventTime >= now;
      });
      const pastAndCompleted = events.filter((event) => {
        const eventTime = parseDateTime(event.dateISO, event.time);
        return event.status === "passed" || eventTime < now;
      });

      const html = [
        renderSection("Your Upcoming Bookings", yourBookings, "You are not booked into any upcoming events yet."),
        renderSection("Available to Book", availableToBook, "No upcoming events available for booking with the current filters."),
        renderSection("Past & Completed", pastAndCompleted, "No past bookings yet.", true)
      ].join("");

      wrap.innerHTML = html;
    }

    function renderLoggedSkills() {
      const getLogTime = (log) => {
        if (log.loggedAt) return new Date(log.loggedAt).getTime();
        if (log.date) return new Date(`${log.date}T00:00:00`).getTime();
        return 0;
      };
      const allLoggedSkills = state.skills
        .map(skill => ({
          skill,
          logs: [...(state.practiceLogs[skill.id] || [])].sort((a, b) => getLogTime(b) - getLogTime(a))
        }))
        .filter(row => row.logs.length > 0)
        .sort((a, b) => getLogTime(b.logs[0]) - getLogTime(a.logs[0]));

      const total = allLoggedSkills.reduce((sum, row) => sum + row.logs.length, 0);
      document.getElementById("totalLoggedSessions").textContent = total;
      const viewSelect = document.getElementById("loggedViewModeSelect");
      if (viewSelect) viewSelect.value = state.loggedViewMode;
      const selectedCount = Object.keys(state.selectedLogIds).length;
      const selectedText = document.getElementById("selectedLogsCountText");
      if (selectedText) {
        selectedText.textContent = `${selectedCount} selected`;
        selectedText.style.display = state.logSelectionMode ? "inline" : "none";
      }
      const modeBtn = document.getElementById("toggleLogSelectModeBtn");
      if (modeBtn) modeBtn.textContent = state.logSelectionMode ? "Cancel Selection" : "Select Multiple";
      const deleteBtn = document.getElementById("deleteSelectedLogsBtn");
      if (deleteBtn) deleteBtn.style.display = selectedCount > 0 ? "inline-block" : "none";

      const container = document.getElementById("loggedSkillsList");
      if (!allLoggedSkills.length) {
        container.innerHTML = `<div class="card"><p class="muted">No skills logged yet. Open a skill and save a practice log.</p></div>`;
        return;
      }

      const renderLogItem = (skillId, log, options = {}) => `
        <div class="log-item">
          ${state.logSelectionMode ? `
            <label class="log-select-row">
              <input type="checkbox" data-action="toggle-log-select" data-log-id="${log.id}" ${state.selectedLogIds[log.id] ? "checked" : ""}>
              Select this log
            </label>
          ` : ""}
          ${options.skillName ? `<div class="muted">Skill: ${options.skillName}</div>` : ""}
          <strong>${log.date}</strong> - ${log.duration} min - ${log.focus}
          <div class="muted">${log.notes || "No notes added."}</div>
          <div class="btn-row" style="margin-top: 6px;">
            <button class="btn-mini" data-action="edit-log" data-skill-id="${skillId}" data-log-id="${log.id}">Edit</button>
            <button class="btn-mini" data-action="delete-log" data-skill-id="${skillId}" data-log-id="${log.id}">Delete</button>
          </div>
        </div>
      `;

      if (state.loggedViewMode === "date") {
        const flat = allLoggedSkills
          .flatMap(({ skill, logs }) => logs.map(log => ({ skill, log })))
          .sort((a, b) => getLogTime(b.log) - getLogTime(a.log));
        const visible = flat.slice(0, state.loggedDateLimit || 30);
        let html = `<div class="card"><div class="log-list">`;
        let activeMonth = "";
        visible.forEach(({ skill, log }) => {
          const monthKey = new Date(`${log.date}T00:00:00`).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
          });
          if (monthKey !== activeMonth) {
            activeMonth = monthKey;
            html += `<p class="month-header">${activeMonth}</p>`;
          }
          html += renderLogItem(skill.id, log, { skillName: skill.name });
        });
        html += `</div>`;
        if (flat.length > (state.loggedDateLimit || 30)) {
          html += `<div class="btn-row"><button class="btn-secondary" data-action="show-more-logs-date">Show 30 More</button></div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
        return;
      }

      container.innerHTML = allLoggedSkills.map(({ skill, logs }) => `
        <div class="card">
          <details class="collapse-card" ${allLoggedSkills.length <= 2 ? "open" : ""}>
            <summary>${skill.name} (${logs.length} log${logs.length === 1 ? "" : "s"})</summary>
            <div class="log-list">
              ${logs.slice(0, (state.loggedSkillLimits[skill.id] || 20)).map(log => renderLogItem(skill.id, log)).join("")}
            </div>
            ${logs.length > (state.loggedSkillLimits[skill.id] || 20)
              ? `<div class="btn-row"><button class="btn-secondary" data-action="show-more-logs" data-id="${skill.id}">Show 20 More</button></div>`
              : ""}
          </details>
        </div>
      `).join("");
    }

    function openLogEditModal(skillId, logId) {
      const logs = state.practiceLogs[skillId] || [];
      const log = logs.find((l) => l.id === logId);
      if (!log) return false;

      const skillSelect = document.getElementById("logEditSkill");
      skillSelect.innerHTML = state.skills
        .filter((s) => s.unlocked)
        .map((s) => `<option value="${s.id}">${s.name}</option>`)
        .join("");
      skillSelect.value = String(skillId);
      populateStageFocusSelect(document.getElementById("logEditStep"), skillId, log.focus || "");
      document.getElementById("logEditDate").value = log.date || "";
      document.getElementById("logEditDuration").value = String(log.duration || 20);
      document.getElementById("logEditComment").value = log.notes || "";
      state.logEditContext = { skillId, logId };
      document.getElementById("logEditModalBackdrop").style.display = "flex";
      return true;
    }

    function closeLogEditModal() {
      state.logEditContext = null;
      document.getElementById("logEditModalBackdrop").style.display = "none";
    }

    function editPracticeLog(skillId, logId) {
      if (state.logSelectionMode) {
        showToast("Exit selection mode to edit logs.", "warn");
        return;
      }
      openLogEditModal(skillId, logId);
    }

    function deletePracticeLog(skillId, logId) {
      if (state.logSelectionMode) {
        showToast("Use Delete Selected while in selection mode.", "warn");
        return;
      }
      const logs = state.practiceLogs[skillId] || [];
      const idx = logs.findIndex((l) => l.id === logId);
      if (idx < 0) return;
      const ok = window.confirm("Delete this practice log?");
      if (!ok) return;
      const removedPoints = removePracticeLogPointsIfEligible(logs[idx]);
      logs.splice(idx, 1);
      showToast(removedPoints > 0 ? `Practice log deleted. -${removedPoints} pts removed.` : "Practice log deleted.");
      renderAll();
    }

    function renderAll() {
      recalculatePointsFromHistory();
      renderDashboard();
      renderGlanceChips();
      renderSkills();
      renderSkillDetail();
      renderRewards();
      renderBooking();
      renderLoggedSkills();
      updateStickyCta();
      persistState();
    }
