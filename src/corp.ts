import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false], // Monitor mode
        ['employee', false], // Employee function
        ['s', false], // Sell price function
        ['warehouse', false], // Warehouse function
        ['r', false], // Buy robots
        ['export', false], // Export material
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)


    if (flags.m) {
        ns.scp('/corp/tai2.js', 'hacknet-server-0')
        ns.exec('/corp/tai2.js', 'hacknet-server-0', { preventDuplicates: true }, ...args)
    }
    else if (flags.employee) {
        ns.scp('/corp/employees.js', 'hacknet-server-0')
        ns.exec('/corp/employees.js', 'hacknet-server-0', { preventDuplicates: true }, ...args)
    }
    else if (flags.s) {
        ns.scp('/corp/sell.js', 'hacknet-server-0')
        ns.exec('/corp/sell.js', 'hacknet-server-0', { preventDuplicates: true }, ...args)
    }
    else if (flags.warehouse) {
        ns.scp('/corp/warehouse.js', 'hacknet-server-0')
        ns.exec('/corp/warehouse.js', 'hacknet-server-0', { preventDuplicates: true }, ...args)
    }
    else if (flags.r) {
        ns.scp('/corp/materials.js', 'hacknet-server-0')
        ns.exec('/corp/materials.js', 'hacknet-server-0', { preventDuplicates: true }, ...args)
    }
    else if (flags.export) {
        ns.scp('/corp/export.js', 'hacknet-server-0')
        ns.exec('/corp/export.js', 'hacknet-server-0', { preventDuplicates: true }, ...args)
    }
    else {
        ns.scp('/corp/print_info.js', 'hacknet-server-0')
        ns.exec('/corp/print_info.js', 'hacknet-server-0')
        let money = ns.getPlayer().money
        let shares = args[0]
        const delta = shares / 10
        for (; ;) {
            ns.corporation.buyBackShares(shares)
            await ns.asleep(1000)
            const new_money = ns.getPlayer().money
            if (new_money > money)
                shares += delta
            else
                shares -= delta
            money = new_money
        }
    }
}


// ns.corporation.acceptInvestmentOffer
// ns.corporation.bribe
// ns.corporation.bulkPurchase
// ns.corporation.buyBackShares
// ns.corporation.buyMaterial
// ns.corporation.buyTea
// ns.corporation.canCreateCorporation
// ns.corporation.cancelExportMaterial
// ns.corporation.createCorporation
// ns.corporation.discontinueProduct
// ns.corporation.expandCity
// ns.corporation.expandIndustry
// ns.corporation.exportMaterial
// ns.corporation.getBonusTime
// ns.corporation.getConstants
// ns.corporation.getDivision
// ns.corporation.getHireAdVertCost
// ns.corporation.getHireAdVertCount
// ns.corporation.getIndustryData
// ns.corporation.getInvestmentOffer
// ns.corporation.getMaterial
// ns.corporation.getMaterialData
// ns.corporation.getOffice
// ns.corporation.getOfficeSizeUpgradeCost
// ns.corporation.getProduct
// ns.corporation.getResearchCost
// ns.corporation.getUnlockCost
// ns.corporation.getUpgradeLevel
// ns.corporation.getUpgradeLevelCost
// ns.corporation.getUpgradeWarehouseCost
// ns.corporation.getWarehouse
// ns.corporation.goPublic
// ns.corporation.hasCorporation
// ns.corporation.hasResearched
// ns.corporation.hasUnlock
// ns.corporation.hasWarehouse
// ns.corporation.hireAdVert
// ns.corporation.hireEmployee
// ns.corporation.issueDividends
// ns.corporation.issueNewShares
// ns.corporation.levelUpgrade
// ns.corporation.limitMaterialProduction
// ns.corporation.limitProductProduction
// ns.corporation.makeProduct
// ns.corporation.nextUpdate
// ns.corporation.purchaseUnlock
// ns.corporation.purchaseWarehouse
// ns.corporation.research
// ns.corporation.sellDivision
// ns.corporation.sellMaterial
// ns.corporation.sellProduct
// ns.corporation.sellShares
// ns.corporation.setAutoJobAssignment
// ns.corporation.setMaterialMarketTA1
// ns.corporation.setMaterialMarketTA2
// ns.corporation.setProductMarketTA1
// ns.corporation.setProductMarketTA2
// ns.corporation.setSmartSupply
// ns.corporation.setSmartSupplyOption
// ns.corporation.throwParty
// ns.corporation.upgradeOfficeSize
// ns.corporation.upgradeWarehouse
