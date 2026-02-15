function calculateRemainingLevel(dose, currentTime) {
  const adminTime = new Date(dose.administeredAt).getTime();
  const elapsedMs = currentTime - adminTime;
  if (elapsedMs < 0) return 0;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const remaining = dose.amount * Math.pow(0.5, elapsedHours / dose.halfLifeHours);
  if (remaining < dose.amount * 0.001) return 0;
  return remaining;
}

function getAdaptiveInterval(rangeMs, shortestHalfLifeHours) {
  const rangeHours = rangeMs / (1000 * 60 * 60);
  const minInterval = Math.max(shortestHalfLifeHours / 5, 1 / 60);
  let interval;
  if (rangeHours <= 24) interval = 0.25;
  else if (rangeHours <= 168) interval = 1;
  else if (rangeHours <= 720) interval = 4;
  else interval = 12;
  return Math.max(interval, minInterval);
}

function generateTimeSeriesData(doses, startTime, endTime) {
  const grouped = {};
  for (const dose of doses) {
    const key = dose.compoundId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(dose);
  }

  const series = {};
  for (const [compoundId, compoundDoses] of Object.entries(grouped)) {
    const shortestHL = Math.min(...compoundDoses.map(d => d.halfLifeHours));
    const intervalHours = getAdaptiveInterval(endTime - startTime, shortestHL);
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const points = [];

    for (let t = startTime; t <= endTime; t += intervalMs) {
      let totalLevel = 0;
      for (const dose of compoundDoses) {
        totalLevel += calculateRemainingLevel(dose, t);
      }
      points.push({ x: t, y: Math.round(totalLevel * 1000) / 1000 });
    }

    series[compoundId] = {
      compoundName: compoundDoses[0].compoundName,
      category: compoundDoses[0].category,
      unit: compoundDoses[0].unit,
      color: compoundDoses[0].color || '#888',
      data: points
    };
  }
  return series;
}

function getActiveDoses(doses, currentTime) {
  return doses.filter(d => calculateRemainingLevel(d, currentTime) > 0);
}

function getActiveCompoundSummaries(doses, currentTime) {
  const grouped = {};
  for (const dose of doses) {
    const key = dose.compoundName;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(dose);
  }

  const summaries = [];
  for (const [compoundName, compoundDoses] of Object.entries(grouped)) {
    let totalRemaining = 0;
    let totalDosed = 0;
    let lastDoseTime = 0;

    for (const dose of compoundDoses) {
      const remaining = calculateRemainingLevel(dose, currentTime);
      if (remaining > 0) {
        totalRemaining += remaining;
        totalDosed += dose.amount;
        const doseTime = new Date(dose.administeredAt).getTime();
        if (doseTime > lastDoseTime) lastDoseTime = doseTime;
      }
    }

    if (totalRemaining > 0) {
      summaries.push({
        compoundId: compoundDoses[0].compoundId,
        compoundName,
        category: compoundDoses[0].category,
        unit: compoundDoses[0].unit,
        color: compoundDoses[0].color || '#888',
        halfLifeHours: compoundDoses[0].halfLifeHours,
        totalRemaining: Math.round(totalRemaining * 1000) / 1000,
        totalDosed,
        percentRemaining: Math.round((totalRemaining / totalDosed) * 100 * 10) / 10,
        lastDoseTime,
        activeDoseCount: compoundDoses.filter(d => calculateRemainingLevel(d, currentTime) > 0).length
      });
    }
  }

  return summaries.sort((a, b) => b.lastDoseTime - a.lastDoseTime);
}
