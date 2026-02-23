window.WH_EVENTS_SERVICE = (function () {
  function mergeRemoteEvents(localEvents, remoteEvents) {
    var localById = Object.fromEntries((localEvents || []).map(function (event) { return [Number(event.id), event]; }));
    return (remoteEvents || []).map(function (remote) {
      var local = localById[Number(remote.id)];
      if (!local) return remote;
      var merged = { ...remote };
      if (local.status && local.status !== "pending") merged.status = local.status;
      if (local.paymentStatus) merged.paymentStatus = local.paymentStatus;
      if (Array.isArray(local.bookingPointHistoryIds)) merged.bookingPointHistoryIds = local.bookingPointHistoryIds;
      return merged;
    });
  }

  return {
    mergeRemoteEvents: mergeRemoteEvents
  };
})();
