import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['ticker', 'JGN'], // Ticker symbol to manipulate
        ['b', false],      // Buy
        ['s', false],      // Sell
        ['amount', 100],   // Number of shares to work with
        ['h', false],      // Hack
        ['g', false],      // Grow
        ['n', 4096],       // Number of threads
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    const hostname_map = {
        'JGN': 'joesguns',
    }

    const ticker = flags.ticker as string
    if (flags.b) {
        const price = ns.stock.buyStock(ticker, flags.amount)
        ns.tprint(`Bought ${flags.amount} of ${ticker} for ${price}`)
    }
    else if (flags.s) {
        const price = ns.stock.sellStock(ticker, flags.amount)
        ns.tprint(`Bought ${flags.amount} of ${ticker} for ${price}`)
    }
    else if (flags.h) {
        const hostname = hostname_map[ticker]
        await ns.hack(hostname, { stock: true, threads: flags.n })
    }
    else if (flags.g) {
        const hostname = hostname_map[ticker]
        await ns.grow(hostname, { stock: true, threads: flags.n })
    }

    ns.tprint(`${ticker} has a price of ${ns.stock.getPrice(ticker)}`)
}
