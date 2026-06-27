const { apiHandler, budgetSummary, snapshots } = require("./_data.js");

module.exports = (req, res) =>
  apiHandler(req, res, async (state) => {
    const snapshot = snapshots(state);
    const budget = budgetSummary(state);
    return {
      data: {
        netWorth: snapshot.assets.netWorth,
        grossAssets: snapshot.assets.grossAssets,
        debt: snapshot.assets.debt,
        monthlyIncome: budget.totals.income,
        monthlyExpense: budget.totals.expense,
        monthlySaving: budget.totals.saving,
        savingRate: budget.totals.savingRate,
        portfolioValueKrw: snapshot.portfolio.valueKrw
      },
      assets: snapshot.assets,
      budget: budget.totals,
      portfolio: {
        valueKrw: snapshot.portfolio.valueKrw,
        costKrw: snapshot.portfolio.costKrw,
        profitKrw: snapshot.portfolio.profitKrw
      }
    };
  });
