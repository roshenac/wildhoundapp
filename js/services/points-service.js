window.WH_POINTS_SERVICE = (function () {
  function clampPoints(value, max) {
    var points = Number(value);
    if (!Number.isFinite(points)) points = 0;
    points = Math.max(0, Math.round(points));
    if (Number.isFinite(max)) points = Math.min(points, max);
    return points;
  }

  function sumHistory(history) {
    return (history || []).reduce(function (sum, entry) {
      return sum + (Number(entry && entry.points) || 0);
    }, 0);
  }

  return {
    clampPoints: clampPoints,
    sumHistory: sumHistory
  };
})();
