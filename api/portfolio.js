const { apiHandler, snapshots } = require("./_data.js");

module.exports = (req, res) =>
  apiHandler(req, res, async (state) => {
    const { portfolio } = snapshots(state);
    return {
      data: {
        totals: {
          valueKrw: portfolio.valueKrw,
          costKrw: portfolio.costKrw,
          profitKrw: portfolio.profitKrw
        },
        allocation: {
          accounts: portfolio.accounts,
          tickers: portfolio.tickers
        },
        holdings: portfolio.included
      }
    };
  });
