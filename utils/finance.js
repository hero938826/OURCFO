(function () {
  const KRW = new Intl.NumberFormat("ko-KR");
  const LEVERAGED_TICKERS = new Set(["QLD", "TQQQ", "SOXL", "UPRO", "SSO", "TECL", "FNGU", "LABU", "YINN", "TMF"]);
  const ETF_TICKERS = new Set(["QQQ", "QQQM", "SPY", "SPYM", "VOO", "VTI", "SCHD", "DIA", "IWM", "QLD", "TQQQ", "SOXL", "UPRO", "SSO", "TECL", "FNGU", "TMF"]);

  function amount(value) {
    return Number(value) || 0;
  }

  function text(value) {
    return String(value || "");
  }

  function includesAny(value, words) {
    const haystack = text(value).toLowerCase();
    return words.some((word) => haystack.includes(text(word).toLowerCase()));
  }

  function won(value) {
    const number = amount(value);
    const abs = Math.abs(number);
    const sign = number < 0 ? "-" : "";
    if (abs >= 100000000) return `${sign}${(abs / 100000000).toFixed(1).replace(".0", "")}억원`;
    if (abs >= 10000) return `${sign}${Math.round(abs / 10000).toLocaleString("ko-KR")}만원`;
    return `${sign}${KRW.format(Math.round(abs))}원`;
  }

  function signedWon(value) {
    const number = amount(value);
    return `${number > 0 ? "+" : ""}${won(number)}`;
  }

  function pct(value, signed = false) {
    const number = Number.isFinite(Number(value)) ? Number(value) : 0;
    return `${signed && number > 0 ? "+" : ""}${number.toFixed(1)}%`;
  }

  function sum(items, selector = (item) => item.amount) {
    return (items || []).reduce((total, item) => total + amount(selector(item)), 0);
  }

  function latestCloseBefore(state, month) {
    const key = Object.keys(state.monthlyClosings || {}).filter((item) => item < month).sort().at(-1);
    return key ? state.monthlyClosings[key] : null;
  }

  function entryText(entry) {
    return [entry.type, entry.category, entry.payment, entry.memo].map(text).join(" ");
  }

  function splitCashflow(entries) {
    const income = sum(entries.filter((entry) => includesAny(entry.type, ["수입", "income"])));
    const saving = sum(entries.filter((entry) => includesAny(entry.type, ["저축", "saving"])));
    const fixed = sum(entries.filter((entry) => includesAny(entry.type, ["고정", "fixed"])));
    const variable = sum(entries.filter((entry) => includesAny(entry.type, ["변동", "variable"])));
    const investment = sum(entries.filter((entry) => {
      const value = entryText(entry);
      return includesAny(value, ["투자", "주식", "isa", "연금", "메리츠", "meritz"]);
    }));
    const expense = fixed + variable;
    return {
      income,
      fixed,
      variable,
      saving,
      investment,
      expense,
      remainder: income - expense - saving,
      savingRate: income ? (saving / income) * 100 : 0,
      spendRate: income ? (expense / income) * 100 : 0
    };
  }

  function classifyAssetName(item) {
    const value = `${item.category || ""} ${item.name || ""} ${item.account || ""}`.toLowerCase();
    if (includesAny(value, ["현금", "예금", "적금", "cma", "cash"])) return "cash";
    if (includesAny(value, ["연금", "pension"])) return "pension";
    if (includesAny(value, ["isa"])) return "isa";
    if (includesAny(value, ["메리츠", "meritzw"])) return "meritzW";
    return "financial";
  }

  function allocation(state, assets) {
    const manual = assets.current || [];
    const buckets = {
      realEstate: assets.realEstate,
      stock: assets.portfolio.valueKrw,
      cash: 0,
      pension: 0,
      isa: 0,
      meritzW: assets.portfolio.excludedValueKrw,
      vehicle: assets.vehicle,
      debt: assets.debt
    };

    manual.forEach((item) => {
      const type = state.inputOptions?.assetCategories?.find((category) => category.label === item.category)?.type;
      if (type !== "financial") return;
      const key = classifyAssetName(item);
      buckets[key] = (buckets[key] || 0) + amount(item.amount);
    });

    const positiveTotal = buckets.realEstate + buckets.stock + buckets.cash + buckets.pension + buckets.isa + buckets.meritzW + buckets.vehicle;
    return {
      total: positiveTotal,
      debt: buckets.debt,
      items: [
        ["Real Estate", buckets.realEstate, "real-estate"],
        ["Stocks", buckets.stock, "stock"],
        ["Cash", buckets.cash, "cash"],
        ["Pension", buckets.pension, "pension"],
        ["ISA", buckets.isa, "isa"],
        ["Meritz W", buckets.meritzW, "meritz"],
        ["Vehicle", buckets.vehicle, "vehicle"]
      ].filter(([, value]) => value > 0).map(([label, value, tone]) => ({
        label,
        value,
        tone,
        rate: positiveTotal ? (value / positiveTotal) * 100 : 0
      }))
    };
  }

  function investmentHealth(assets) {
    const holdings = assets.portfolio.holdings || [];
    const total = sum(holdings, (item) => item.valueKrw);
    const cost = sum(holdings, (item) => item.costKrw);
    const profit = total - cost;
    const leveraged = sum(holdings.filter((item) => LEVERAGED_TICKERS.has(text(item.ticker).toUpperCase())), (item) => item.valueKrw);
    const individual = sum(holdings.filter((item) => !ETF_TICKERS.has(text(item.ticker).toUpperCase())), (item) => item.valueKrw);
    const us = sum(holdings.filter((item) => item.country !== "KR"), (item) => item.valueKrw);
    const kr = sum(holdings.filter((item) => item.country === "KR"), (item) => item.valueKrw);
    const leverageRate = total ? (leveraged / total) * 100 : 0;
    return {
      total,
      profit,
      returnRate: cost ? (profit / cost) * 100 : 0,
      leverageRate,
      leverageStatus: leverageRate >= 60 ? "red" : leverageRate >= 40 ? "yellow" : "green",
      individualRate: total ? (individual / total) * 100 : 0,
      cashRate: 0,
      usRate: total ? (us / total) * 100 : 0,
      krRate: total ? (kr / total) * 100 : 0
    };
  }

  function buildAlerts({ assets, cashflow, budget, previousClose, currentClose, health }) {
    const alerts = [];
    if (health.leverageRate >= 60) {
      alerts.push({ id: "leverage-red", tone: "red", title: "Leveraged ETF Risk", body: `Leveraged ETF exposure is ${pct(health.leverageRate)}. Review your rebalancing rule.` });
    } else if (health.leverageRate >= 40) {
      alerts.push({ id: "leverage-yellow", tone: "yellow", title: "Leverage Check", body: `Leveraged ETF exposure is ${pct(health.leverageRate)}. Prepare for volatility.` });
    }
    if (cashflow.savingRate >= 40) {
      alerts.push({ id: "saving-rate-strong", tone: "green", title: "Goal Beat", body: `This month's saving rate is ${pct(cashflow.savingRate)}. Cash discipline is strong.` });
    }
    if (budget && cashflow.variable > budget) {
      alerts.push({ id: "variable-budget-over", tone: "red", title: "Variable Spend Over Budget", body: `Variable spending used ${pct((cashflow.variable / budget) * 100)} of budget.` });
    }
    if (previousClose && currentClose && amount(currentClose.netWorth) >= amount(previousClose.netWorth)) {
      alerts.push({ id: "net-worth-up", tone: "green", title: "Net Worth Improved", body: `Net worth changed by ${signedWon(amount(currentClose.netWorth) - amount(previousClose.netWorth))} vs last close.` });
    }
    if (previousClose && currentClose && amount(currentClose.debt) < amount(previousClose.debt)) {
      alerts.push({ id: "debt-down", tone: "green", title: "Debt Improved", body: "Debt is lower than the previous close. Keep the repayment rhythm." });
    }
    if (!alerts.length && (assets.current || []).length) {
      alerts.push({ id: "data-ready", tone: "green", title: "Data Ready", body: "Assets, cashflow, and investment data are being summarized." });
    }
    return alerts;
  }

  function formatMonth(value) {
    return /^\d{4}-\d{2}$/.test(text(value)) ? text(value).replace("-", ".") : "Not set";
  }

  function estimateGoal({ title, current, target, monthlySaving, startMonth, endMonth }) {
    const progress = target ? Math.min((current / target) * 100, 999) : 0;
    const remaining = Math.max(target - current, 0);
    const months = monthlySaving > 0 && remaining > 0 ? Math.ceil(remaining / monthlySaving) : null;
    const date = months === null ? null : new Date(new Date().getFullYear(), new Date().getMonth() + months, 1);
    return {
      title,
      current,
      target,
      startMonth,
      endMonth,
      progress,
      eta: months === null ? `Target date ${formatMonth(endMonth)}` : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
      dateRange: `${formatMonth(startMonth)} - ${formatMonth(endMonth)}`
    };
  }

  function futureValue(principal, monthly, annualExtra, annualRate, years) {
    const monthlyRate = annualRate / 12;
    let value = principal;
    for (let month = 1; month <= years * 12; month += 1) {
      value = value * (1 + monthlyRate) + monthly;
      if (month % 12 === 0) value += annualExtra;
    }
    return value;
  }

  function meritzModel(state, assets, entries, annualRate) {
    const principal = assets.portfolio.excludedValueKrw;
    const account = text(state.excludedStockAccount || "메리츠W").toLowerCase();
    const monthly = sum(entries.filter((entry) => entryText(entry).toLowerCase().includes(account) || includesAny(entryText(entry), ["메리츠", "meritz"])));
    const year = new Date().getFullYear();
    const annualExtra = sum((state.stockTransactions || []).filter((trade) => {
      return text(trade.account).toLowerCase().includes(account) && text(trade.date).startsWith(String(year));
    }), (trade) => trade.amountKrw);
    return {
      principal,
      monthly,
      annualExtra,
      annualRate,
      scenarios: [10, 15, 20].map((years) => ({
        years,
        value: futureValue(principal, monthly, annualExtra, annualRate, years)
      }))
    };
  }

  function monthlyReport(delta, cashflow, budget, health) {
    if (!cashflow.income && !health.total) return "Input this month's ledger and investment data to generate an automatic CFO report.";
    const budgetText = budget ? `Variable spending used ${pct((cashflow.variable / budget) * 100)} of budget.` : "Variable spending budget is not set yet.";
    const deltaText = delta === null ? "Month-over-month comparison appears after a monthly close." : `Net worth changed by ${signedWon(delta)} vs the previous close.`;
    return `${deltaText} Saving rate is ${pct(cashflow.savingRate)}. ${budgetText} Investment return is ${pct(health.returnRate, true)}.`;
  }

  function buildHomeModel({ state, assets, period, entries, currentClose }) {
    const previousClose = latestCloseBefore(state, period);
    const cashflow = splitCashflow(entries);
    const budget = amount(state.variableBudgets?.[period]);
    const health = investmentHealth(assets);
    const delta = previousClose ? amount(currentClose.netWorth) - amount(previousClose.netWorth) : null;
    const deltaRate = previousClose?.netWorth ? (delta / previousClose.netWorth) * 100 : null;
    const meritzRate = amount(state.uiConfig?.meritzScenario) || 0.1;
    const goals = state.uiConfig?.v2Goals || {};
    const meritz = meritzModel(state, assets, entries, meritzRate);
    return {
      period,
      previousClose,
      delta,
      deltaRate,
      cashflow,
      budget,
      health,
      allocation: allocation(state, assets),
      alerts: buildAlerts({ assets, cashflow, budget, previousClose, currentClose, health }),
      goals: [
        estimateGoal({ title: "Financial Assets", current: assets.financial, target: amount(goals.financialAssets?.target) || 500000000, monthlySaving: cashflow.saving || cashflow.investment, startMonth: goals.financialAssets?.startMonth, endMonth: goals.financialAssets?.endMonth }),
        estimateGoal({ title: "Net Worth", current: assets.netWorth, target: amount(goals.netWorth?.target) || 1000000000, monthlySaving: cashflow.saving || cashflow.investment, startMonth: goals.netWorth?.startMonth, endMonth: goals.netWorth?.endMonth }),
        estimateGoal({ title: "Junwon Account", current: assets.portfolio.excludedValueKrw, target: amount(goals.meritzW?.target) || 100000000, monthlySaving: meritz.monthly, startMonth: goals.meritzW?.startMonth, endMonth: goals.meritzW?.endMonth })
      ],
      meritz,
      report: monthlyReport(delta, cashflow, budget, health)
    };
  }

  window.OurCfoFinance = {
    buildHomeModel,
    won,
    signedWon,
    pct
  };
})();
