import { Division, NS, Office, Product } from "@ns";
import { init_script, Schema } from "../lib/utils";

const CITIES = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)

    // ns.disableLog('ALL')
    ns.tail()
    ns.clearLog()

    const corp = ns.corporation.getCorporation()
    for (const div_name of corp.divisions) {
        const division = ns.corporation.getDivision(div_name)
        ns.print(`Division: ${division.name}`)
        if (division.makesProducts) {
            ns.print(`  Products: ${division.products}`)
            await optimize(ns, division)
        }
        for (const city_name of division.cities) {
            ns.print(`  Office: ${city_name}`)
            const office = ns.corporation.getOffice(div_name, city_name)
            if (office.avgEnergy < 100.0)
                ns.print(`    Energy = ${office.avgEnergy}`)
            if (office.avgMorale < 100.0)
                ns.print(`    Morale = ${office.avgMorale}`)
            const warehouse = ns.corporation.getWarehouse(div_name, city_name)
            if (warehouse.sizeUsed > warehouse.size * .9)
                ns.print(`    Warehouse: ${warehouse.sizeUsed}`)
        }
    }
}

async function optimize(ns: NS, division: Division) {
    const low_map = new Map<string, number>()
    const mult_map = new Map<string, number>()
    const high_map = new Map<string, number>()

    for (const product_name of division.products) {
        low_map.set(product_name, 100)
        mult_map.set(product_name, 100)
        ns.corporation.sellProduct(division.name, 'Aevum', product_name, 'MAX', `MP`, true)
        ns.print(`Set ${product_name} to MP`)
    }

    for (; ;) {
        await wait_for_start(ns)
        ns.clearLog()
        let working = division.products.length
        for (const product_name of division.products) {
            const product = ns.corporation.getProduct(division.name, 'Aevum', product_name)
            if (product.developmentProgress < 100)
                continue

            const current = mult_map.get(product_name) as number
            const low = low_map.get(product_name) as number
            if (product.actualSellAmount >= product.productionAmount) {
                low_map.set(product_name, current)
                if (high_map.has(product_name)) {
                    const delta = high_map.get(product_name) - current
                    if (delta < 0.05) {
                        working -= 1
                        continue
                    }
                    mult_map.set(product_name, delta / 2 + current)
                }
                else {
                    mult_map.set(product_name, current * 2)
                }
            }
            else {
                mult_map.set(product_name, (current - low) / 2 + low)
                high_map.set(product_name, current)
            }

            const mult = mult_map.get(product_name) / 100
            const selling_price = `MP*${mult}`
            ns.print(`Optimal price of ${product_name} = ${selling_price}`)
            ns.corporation.sellProduct(division.name, 'Aevum', product_name, 'MAX', `${selling_price}`, false)
        }
        if (working == 0)
            break
    }
}

async function wait_for_start(ns: NS): Promise<void> {
    await wait_for_phase(ns, 'START')
}

async function wait_for_phase(ns: NS, phase: string): Promise<void> {
    // START -> PURCHASE -> PRODUCTION -> EXPORT -> SALE
    let state = ""
    while (state != phase) {
        state = await ns.corporation.nextUpdate()
    }
}

// Taken from Documentation -> Corporation -> Optimal selling price
// Market price and markup limit

function calc_product_market_price(product: Product): number {
    const product_market_price_mult = 5
    return product.productionCost * product_market_price_mult // production cost -is- the est market price???
}

function calc_material_markup_limit(material_quality: number, material_markup: number): number {
    return material_quality / material_markup
}

function calc_product_markup_limit(product_effective_rating: number, product_markup: number): number {
    return Math.max(0.001, product_effective_rating) / product_markup
}

// Maximize sales volume

function calc_expected_sales_volume(produced_units: number): number {
    return produced_units / 10
}

function calc_material_multiplier(material): number {
    return material.quality + 0.001
}

function calc_product_multiplier(product: Product): number {
    return 0.5 * Math.pow(product.effectiveRating, 0.65)
}

function calc_business_factor(office: Office): number {
    const business_production = 1 + office.employeeProductionByJob['Business']
    return Math.pow(business_production, 0.26) + (business_production * 0.001)
}

function calc_awareness_factor(awareness: number, industry_advertising_factor: number): number {
    return Math.pow(awareness + 1, industry_advertising_factor)
}

function calc_popularity_factor(popularity: number, industry_advertising_factor: number): number {
    return Math.pow(popularity + 1, industry_advertising_factor)
}

function calc_ratio_factor(popularity: number, awareness: number): number {
    if (awareness == 0)
        return 0.01
    return Math.max(0.01, (popularity + 0.001) / awareness)
}

function calc_advert_factor(awareness: number, popularity: number, industry_advertising_factor: number): number {
    return Math.pow(calc_awareness_factor(awareness, industry_advertising_factor) * calc_popularity_factor(popularity, industry_advertising_factor) * calc_ratio_factor(popularity, awareness), 0.85)
}

function calc_market_factor(demand: number, competition: number): number {
    return Math.max(0.1, demand * (100 - competition) * 0.01)
}

function calc_upgrade_bonus(ns: NS): number {
    const bot_count = ns.corporation.getUpgradeLevel('ABC SalesBots')
    return bot_count * 0.01
}

function calc_research_bonus(): number {
    return 1 // Currently unused
}

function calc_markup_multiplier(selling_price: number, market_price: number, markup_limit: number): number {
    if (selling_price < 0)
        return Math.pow(10, 12)
    if (selling_price <= market_price)
        return market_price / selling_price

    return Math.pow(markup_limit / (selling_price - market_price), 2)
}

function calc_M(ns: NS, division: Division, office: Office, product: Product): number {
    const industry = ns.corporation.getIndustryData(division.type)
    return (
        calc_product_multiplier(product) *
        calc_business_factor(office) *
        calc_advert_factor(division.awareness, division.popularity, industry.advertisingFactor ?? 0) *
        calc_market_factor(product.demand ?? 0, product.competition ?? 0) *
        calc_upgrade_bonus(ns) *
        calc_research_bonus()
    )
}

function calc_sell_price(ns: NS, division: Division, office: Office, product: Product, product_markup: number): number {
    const markup_limit = calc_product_markup_limit(product.effectiveRating, product_markup)
    ns.print(`  markup limit = ${markup_limit}`)
    const M = calc_M(ns, division, office, product)
    ns.print(`  M            = ${M}`)
    const sales = calc_expected_sales_volume(product.productionAmount)
    ns.print(`  sales volume = ${sales}`)
    // const market_price = calc_product_market_price(product)
    // ns.print(`  market price = ${market_price}, ${product.productionCost}`)
    const sell_factor = markup_limit * Math.sqrt(M) / Math.sqrt(sales)
    ns.print(`  Sell factor = ${sell_factor}`)
    return sell_factor + product.productionCost
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
// ns.corporation.expandCity('Ag-1', 'Aevum')
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
