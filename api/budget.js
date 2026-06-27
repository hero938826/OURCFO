const { apiHandler, budgetSummary } = require("./_data.js");

module.exports = (req, res) =>
  apiHandler(req, res, async (state, request) => {
    const month = request.query?.month || new URL(request.url, "http://localhost").searchParams.get("month") || undefined;
    const summary = budgetSummary(state, month);
    return {
      data: summary.entries,
      totals: summary.totals,
      month: summary.month
    };
  });
