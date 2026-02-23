window.WH_VALIDATORS = (function () {
  function parseDateTime(event) {
    if (!event || typeof event !== "object") return Number.NaN;
    var dateISO = String(event.dateISO || "");
    var time = String(event.time || "9:00 AM");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return Number.NaN;
    var parts = time.split(" ");
    var clock = parts[0] || "9:00";
    var meridiem = parts[1] || "AM";
    var hm = clock.split(":").map(Number);
    var hour = Number.isFinite(hm[0]) ? hm[0] : 9;
    var minute = Number.isFinite(hm[1]) ? hm[1] : 0;
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    var d = new Date(dateISO + "T00:00:00");
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  }

  function validateEventsPayload(payload) {
    var warnings = [];
    var errors = [];
    var slots = Array.isArray(payload && payload.slots) ? payload.slots : [];
    var walks = Array.isArray(payload && payload.monthlyWalks) ? payload.monthlyWalks : [];
    var all = slots.map(function (e) { return Object.assign({}, e, { kind: "assessment" }); })
      .concat(walks.map(function (e) { return Object.assign({}, e, { kind: "hillwalk" }); }));
    var idSet = new Set();

    all.forEach(function (event) {
      var id = Number(event.id);
      if (!Number.isFinite(id)) {
        errors.push("Event missing numeric id.");
        return;
      }
      if (idSet.has(id)) errors.push("Duplicate event id " + id + ".");
      idSet.add(id);
      if (!event.dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(String(event.dateISO))) {
        errors.push("Event " + id + " has invalid dateISO.");
      }
      if (event.kind === "hillwalk" && !String(event.skill || "").trim()) {
        errors.push("Hill walk " + id + " missing skill.");
      }
      if (typeof event.waitlistOnly !== "boolean") {
        warnings.push("Event " + id + " missing waitlistOnly flag (default false will apply).");
      }
    });

    var sorted = all.slice().sort(function (a, b) { return parseDateTime(a) - parseDateTime(b); });
    var outOfOrder = all.some(function (event, idx) { return sorted[idx] && Number(event.id) !== Number(sorted[idx].id); });
    if (outOfOrder) warnings.push("Events are not in chronological order in source JSON.");
    return { warnings: warnings, errors: errors };
  }

  function validateCodebookPayload(payload) {
    var warnings = [];
    var errors = [];
    if (!payload || typeof payload !== "object") {
      errors.push("Codebook payload is not an object.");
      return { warnings: warnings, errors: errors };
    }
    var mapKeys = [
      "hillWalkUnlockCodesBySkillId",
      "unlockCodesBySkillId",
      "assessmentPassCodesBySkillId",
      "assessmentReworkCodesBySkillId"
    ];
    mapKeys.forEach(function (key) {
      var val = payload[key];
      if (val === undefined) {
        warnings.push("Codebook missing " + key + ".");
        return;
      }
      if (!val || typeof val !== "object" || Array.isArray(val)) {
        errors.push("Codebook " + key + " must be an object.");
        return;
      }
      Object.keys(val).forEach(function (skillId) {
        var code = String(val[skillId] || "").trim();
        if (!code) warnings.push("Codebook " + key + " has empty code for skill " + skillId + ".");
      });
    });
    return { warnings: warnings, errors: errors };
  }

  return {
    validateEventsPayload: validateEventsPayload,
    validateCodebookPayload: validateCodebookPayload
  };
})();
