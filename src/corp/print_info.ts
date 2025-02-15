import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const corp = ns.corporation.getCorporation()
    ns.tprint(`${corp.name}`)
    ns.tprint('================')
    ns.tprint(`  Dividend earnings: ${corp.dividendEarnings}`)
    ns.tprint(`  Dividend rate    : ${corp.dividendRate}`)
    ns.tprint(`  Dividend tax     : ${corp.dividendTax}`)
    ns.tprint(`  Divisions:`)
    for (const name of corp.divisions)
        ns.tprint(`    ${name}`)
    ns.tprint(`  Revenue          : ${ns.formatNumber(corp.revenue)}`)
    ns.tprint(`  Expenses         : ${ns.formatNumber(corp.expenses)}`)
    ns.tprint(`  Funds            : ${ns.formatNumber(corp.funds)}`)
    ns.tprint(`  Number of Shares : ${corp.numShares}`)
    ns.tprint(`  Investor Shares  : ${corp.investorShares}`)
    ns.tprint(`  Issued Shares    : ${corp.issuedShares}`)
    ns.tprint(`  Total Shares     : ${corp.totalShares}`)
    ns.tprint(`  Public?          : ${corp.public}`)
    ns.tprint(`  Share Price      : ${corp.sharePrice}`)
    ns.tprint(`  Valuation        : ${ns.formatNumber(corp.valuation)}`)
}
