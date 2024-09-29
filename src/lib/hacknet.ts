import { ns } from "/lib/types"

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

export async function manage(spend_factor: number = 0.1): Promise<void> {
    if (ns.hacknet.numNodes() == 0)
        if (ns.hacknet.purchaseNode() == -1)
            return

    while (true) {
        if (ns.fileExists("/lock/hacknet.txt")) {
            await ns.asleep(1000);
            continue;
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            var budget = ns.getPlayer().money * spend_factor;

            while (ns.hacknet.upgradeRam(i))
                ns.print("Upgraded RAM on machine ", i);

            if (ns.hacknet.getCoreUpgradeCost(i) < budget) {
                if (ns.hacknet.upgradeCore(i))
                    ns.print("Upgraded core on machine ", i);
            }

            if (ns.hacknet.getLevelUpgradeCost(i, 10) < budget) {
                if (ns.hacknet.upgradeLevel(i, 10))
                    ns.print("Upgraded level on machine ", i);
            }
        }

        var last_node = ns.hacknet.getNodeStats(ns.hacknet.numNodes() - 1);
        if (last_node.ram == 64) {
            if (ns.hacknet.getPurchaseNodeCost() < (ns.getPlayer().money * 0.1)) {
                ns.hacknet.purchaseNode();
            }
        }

        await ns.asleep(1000);
    }
}