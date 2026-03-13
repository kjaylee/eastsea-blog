(function (root) {
  function roundTo(value, digits) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function tokenize(raw) {
    return String(raw || '')
      .split(/[\s,;|]+/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  function parseResponses(raw) {
    const tokens = tokenize(raw);
    const scores = [];
    const invalidTokens = [];

    for (const token of tokens) {
      if (!/^-?\d+$/.test(token)) {
        invalidTokens.push(token);
        continue;
      }

      const value = Number(token);
      if (!Number.isInteger(value) || value < 0 || value > 10) {
        invalidTokens.push(token);
        continue;
      }

      scores.push(value);
    }

    return {
      tokens,
      scores,
      invalidTokens
    };
  }

  function validate(raw) {
    if (!String(raw || '').trim()) {
      return '응답 점수를 입력하세요. 0~10 점수를 쉼표, 공백, 줄바꿈으로 붙여넣을 수 있습니다.';
    }

    const parsed = parseResponses(raw);
    if (parsed.scores.length === 0) {
      return '유효한 응답이 없습니다. 0부터 10 사이의 정수 점수만 사용할 수 있습니다.';
    }

    return '';
  }

  function buildHistogram(scores) {
    const histogram = {};
    for (let score = 0; score <= 10; score += 1) histogram[score] = 0;
    for (const score of scores) histogram[score] += 1;
    return histogram;
  }

  function calculateFromScores(scores, invalidTokens) {
    const totalResponses = scores.length;
    const promoters = scores.filter((score) => score >= 9).length;
    const passives = scores.filter((score) => score >= 7 && score <= 8).length;
    const detractors = scores.filter((score) => score <= 6).length;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const averageScore = totalResponses > 0 ? sum / totalResponses : 0;
    const promoterPercent = totalResponses > 0 ? (promoters / totalResponses) * 100 : 0;
    const passivePercent = totalResponses > 0 ? (passives / totalResponses) * 100 : 0;
    const detractorPercent = totalResponses > 0 ? (detractors / totalResponses) * 100 : 0;
    const npsScore = Math.round(promoterPercent - detractorPercent);
    const histogram = buildHistogram(scores);

    return {
      totalResponses,
      validCount: totalResponses,
      invalidCount: invalidTokens.length,
      invalidTokens,
      promoters,
      passives,
      detractors,
      promoterPercent: roundTo(promoterPercent, 1),
      passivePercent: roundTo(passivePercent, 1),
      detractorPercent: roundTo(detractorPercent, 1),
      averageScore: roundTo(averageScore, 2),
      npsScore,
      histogram,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores)
    };
  }

  function buildSummary(result) {
    return [
      '[NPS Response Analyzer 요약]',
      `Responses: ${result.totalResponses}`,
      `NPS: ${result.npsScore}`,
      `Promoters: ${result.promoters} (${result.promoterPercent}%)`,
      `Passives: ${result.passives} (${result.passivePercent}%)`,
      `Detractors: ${result.detractors} (${result.detractorPercent}%)`,
      `Average score: ${result.averageScore}`,
      `Invalid tokens: ${result.invalidCount}`
    ].join('\n');
  }

  function analyze(raw) {
    const error = validate(raw);
    if (error) {
      return {
        result: null,
        error,
        parsed: parseResponses(raw)
      };
    }

    const parsed = parseResponses(raw);
    const result = calculateFromScores(parsed.scores, parsed.invalidTokens);
    result.summary = buildSummary(result);

    return {
      result,
      error: '',
      parsed
    };
  }

  const api = {
    tokenize,
    parseResponses,
    validate,
    buildHistogram,
    calculateFromScores,
    buildSummary,
    analyze
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.NpsResponseAnalyzer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
