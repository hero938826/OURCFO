const { apiHandler, snapshots } = require("./_data.js");

module.exports = (req, res) =>
  apiHandler(req, res, async (state) => {
    const { portfolio } = snapshots(state);
    return {
      data: portfolio.holdings,
      transactions: state.stockTransactions,
      totals: {
        valueKrw: portfolio.valueKrw,
        costKrw: portfolio.costKrw,
        profitKrw: portfolio.profitKrw,
        byAccount: portfolio.accounts,
        byTicker: portfolio.tickers
      }
    };
  });
