/*
getCacheUpgradeCost(index, n) 	Calculate the cost of upgrading hacknet node cache.
getCoreUpgradeCost(index, n) 	Calculate the cost of upgrading hacknet node cores.
getHashUpgradeLevel(upgName) 	Get the level of a hash upgrade.
getHashUpgrades() 	Get the list of hash upgrades
getLevelUpgradeCost(index, n) 	Calculate the cost of upgrading hacknet node levels.
getNodeStats(index) 	Get the stats of a hacknet node.
getPurchaseNodeCost() 	Get the price of the next hacknet node.
getRamUpgradeCost(index, n) 	Calculate the cost of upgrading hacknet node RAM.
getStudyMult() 	Get the multiplier to study.
getTrainingMult() 	Get the multiplier to training.
hashCapacity() 	Get the maximum number of hashes you can store.
hashCost(upgName, count) 	Get the cost of a hash upgrade.
maxNumNodes() 	Get the maximum number of hacknet nodes.
numHashes() 	Get the total number of hashes stored.
numNodes() 	Get the number of hacknet nodes you own.
purchaseNode() 	Purchase a new hacknet node.
spendHashes(upgName, upgTarget, count) 	Purchase a hash upgrade.
upgradeCache(index, n) 	Upgrade the cache of a hacknet node.
upgradeCore(index, n) 	Upgrade the core of a hacknet node.
upgradeLevel(index, n) 	Upgrade the level of a hacknet node.
upgradeRam(index, n) 	Upgrade the RAM of a hacknet node.
*/

import { NS } from "@ns";

export async function manage(ns: NS, spend_factor: number, profit_factor: number): Promise<void> {
    if (ns.hacknet.numNodes() == 0)
        if (ns.hacknet.purchaseNode() == -1)
            return

    for (; ;) {
        await ns.asleep(1000);
        ns.clearLog()
        print_stats(ns, ns.print)

        if (ns.fileExists("/lock/hacknet.txt")) {
            await ns.asleep(1000);
            continue;
        }
        const money = ns.getMoneySources()
        const roi = (money.sinceInstall.hacknet + money.sinceInstall.hacknet_expenses) / -money.sinceInstall.hacknet_expenses
        if (roi < profit_factor)
            continue

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            let budget = ns.getPlayer().money * spend_factor;

            while (ns.hacknet.upgradeRam(i))
                ns.print("Upgraded RAM on machine ", i);

            let cost = ns.hacknet.getCoreUpgradeCost(i)
            if (cost < budget) {
                if (ns.hacknet.upgradeCore(i)) {
                    ns.print("Upgraded core on machine ", i);
                    budget -= cost
                }
            }

            cost = ns.hacknet.getLevelUpgradeCost(i, 10)
            if (cost < budget) {
                if (ns.hacknet.upgradeLevel(i, 10)) {
                    ns.print("Upgraded level on machine ", i);
                    budget -= cost
                }
            }
        }

        const last_node = ns.hacknet.getNodeStats(ns.hacknet.numNodes() - 1);
        if (last_node.ram == 64) {
            if (ns.hacknet.getPurchaseNodeCost() < (ns.getPlayer().money * spend_factor)) {
                ns.hacknet.purchaseNode();
            }
        }
    }
}

export function print_stats(ns: NS, printer = ns.tprint) {
    const money = ns.getMoneySources().sinceInstall
    printer('Hacknet Information:')
    printer(`  Spent  : ${ns.formatNumber(money.hacknet_expenses)}`)
    printer(`  Earned : ${ns.formatNumber(money.hacknet)}`)
    printer(`  ROI    : ${ns.formatPercent((money.hacknet + money.hacknet_expenses) / -money.hacknet_expenses)}`)
}