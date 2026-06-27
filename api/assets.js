const { apiHandler, snapshots } = require("./_data.js");

module.exports = (req, res) =>
  apiHandler(req, res, async (state) => {
    const { assets } = snapshots(state);
    return {
      data: assets.items,
      totals: {
        realEstate: assets.realEstate,
        financial: assets.financial,
        manualFinancial: assets.manualFinancial,
        stockFinancial: assets.stockFinancial,
        vehicle: assets.vehicle,
        debt: assets.debt,
        grossAssets: assets.grossAssets,
        netWorth: assets.netWorth
      }
    };
  });
