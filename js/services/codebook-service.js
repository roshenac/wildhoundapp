window.WH_CODEBOOK_SERVICE = (function () {
  function mergeCodebook(base, incoming) {
    var safeBase = (base && typeof base === "object") ? base : {};
    var safeIncoming = (incoming && typeof incoming === "object") ? incoming : {};
    return {
      ...safeBase,
      ...safeIncoming,
      hillWalkUnlockCodesBySkillId: {
        ...(safeBase.hillWalkUnlockCodesBySkillId || {}),
        ...(safeIncoming.hillWalkUnlockCodesBySkillId || {})
      },
      unlockCodesBySkillId: {
        ...(safeBase.unlockCodesBySkillId || {}),
        ...(safeIncoming.unlockCodesBySkillId || {})
      },
      assessmentPassCodesBySkillId: {
        ...(safeBase.assessmentPassCodesBySkillId || {}),
        ...(safeIncoming.assessmentPassCodesBySkillId || {})
      },
      assessmentReworkCodesBySkillId: {
        ...(safeBase.assessmentReworkCodesBySkillId || {}),
        ...(safeIncoming.assessmentReworkCodesBySkillId || {})
      }
    };
  }

  return {
    mergeCodebook: mergeCodebook
  };
})();
