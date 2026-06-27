const { apiHandler, budgetSummary, snapshots } = require("./_data.js");

module.exports = (req, res) =>
  apiHandler(req, res, async (state) => {
    const snapshot = snapshots(state);
    const budget = budgetSummary(state);
    return {
      data: {
        headline: {
          netWorth: snapshot.assets.netWorth,
          grossAssets: snapshot.assets.grossAssets,
          debt: snapshot.assets.debt,
          portfolioValueKrw: snapshot.portfolio.valueKrw
        },
        monthly: budget.totals,
        counts: {
          assets: state.assetItems.length,
          ledgerEntries: state.ledgerEntries.length,
          stockHoldings: state.stockHoldings.length,
          stockTransactions: state.stockTransactions.length
        }
      }
    };
  });
