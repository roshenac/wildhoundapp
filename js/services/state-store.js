window.WH_STATE_STORE = (function () {
  function migrateSnapshot(rawSnapshot, targetVersion) {
    var snapshot = (rawSnapshot && typeof rawSnapshot === "object") ? { ...rawSnapshot } : {};
    var from = Number(snapshot.stateVersion || 1);
    if (from < 2) {
      if (snapshot.awardedSourceKeys === undefined) snapshot.awardedSourceKeys = {};
      if (snapshot.lastBackupAt === undefined) snapshot.lastBackupAt = "";
      if (snapshot.analyticsCounters === undefined) snapshot.analyticsCounters = {};
    }
    snapshot.stateVersion = Number(targetVersion || 2);
    return snapshot;
  }

  return {
    migrateSnapshot: migrateSnapshot
  };
})();
