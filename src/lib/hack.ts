import { HackingFormulas } from "@ns";
import { hack } from "./root";
import { ns, Recommendation } from "/lib/types"

export class ServerHackInfo {
    name: string;
    hack_time: number;
    hack_chance: number;
    money_available: number;
    money_max: number;
    grow_time: number;
    weak_time: number;
    threads_to_hack_all: number;
    security_level: number;
    security_min: number;

    get_value(): number {
        return this.money_max
    }

    constructor(server: string) {
        this.name = server
        this.hack_time = ns.getHackTime(server)
        this.hack_chance = ns.hackAnalyzeChance(server)
        this.money_available = ns.getServerMoneyAvailable(server)
        this.money_max = ns.getServerMaxMoney(server)
        this.grow_time = ns.getGrowTime(server)
        this.weak_time = ns.getWeakenTime(server)
        this.threads_to_hack_all = ns.hackAnalyzeThreads(server, this.money_available)
        this.security_min = ns.getServerMinSecurityLevel(server)
        this.security_level = ns.getServerSecurityLevel(server)
    }

    print() {
        ns.tprint(`  Hacking chance of success: ${ns.formatPercent(this.hack_chance)}`)
        ns.tprint(`  Hack time: ${this.hack_time}ms`)
        ns.tprint(`  The server currently has $${ns.formatNumber(this.money_available)} (${ns.formatPercent(this.money_available / this.money_max)}) of $${ns.formatNumber(this.money_max)}`)
        ns.tprint(`  Threads to hack all money = ${this.threads_to_hack_all}`)
        ns.tprint(`  Grow time: ${this.grow_time}ms`)
        ns.tprint(`  Weak time: ${this.weak_time}ms`)
    }
}

class HackInfo extends ServerHackInfo {
    hack_security: number;
    hack_security_per_s: number;
    money_percent: number;
    money_per_hack: number;
    max_money_per_hack: number;
    money_per_s: number;
    max_money_per_s: number;
    expected_money_per_s: number;
    max_expected_money_per_s: number;
    grow_security: number;
    grow_security_per_s: number;
    weak_security: number;
    weak_security_per_s: number;
    delta_security_per_s: number;
    total_threads: number;
    total_ram: number;
    expected_money_per_ram: number;
    max_expected_money_per_ram: number;

    get_value(): number {
        return this.max_expected_money_per_ram
    }

    constructor(server: string, hack_threads: number, grow_threads: number, weak_threads: number) {
        super(server)
        this.hack_security = ns.hackAnalyzeSecurity(hack_threads, server)
        this.hack_security_per_s = this.hack_security / this.hack_time * 1000
        this.money_percent = ns.hackAnalyze(server) * hack_threads
        this.money_per_hack = this.money_percent * this.money_available
        this.max_money_per_hack = this.money_percent * this.money_max
        this.money_per_s = this.money_per_hack / this.hack_time * 1000
        this.max_money_per_s = this.max_money_per_hack / this.hack_time * 1000
        this.expected_money_per_s = this.money_per_s * this.hack_chance
        this.max_expected_money_per_s = this.max_money_per_s * this.hack_chance
        this.grow_security = ns.growthAnalyzeSecurity(grow_threads, server)
        this.grow_security_per_s = this.grow_security / this.grow_time * 1000
        this.weak_security = ns.weakenAnalyze(weak_threads)
        this.weak_security_per_s = this.weak_security / this.weak_time * 1000
        this.total_threads = hack_threads + grow_threads + weak_threads
        this.total_ram = this.total_threads * 2
        this.expected_money_per_ram = this.expected_money_per_s / this.total_ram
        this.max_expected_money_per_ram = this.max_expected_money_per_s / this.total_ram
        this.delta_security_per_s = this.hack_security_per_s + this.grow_security_per_s - this.weak_security_per_s
    }

    print() {
        ns.tprint(`  Security increase for hack threads: ${this.hack_security}`)
        ns.tprint(`  Hack security penalty per s: ${this.hack_security_per_s}`)

        ns.tprint("")
        ns.tprint(`  Hack threads will steal ${ns.formatPercent(this.money_percent)} of their money`)
        ns.tprint(`  Money stolen by hack threads: $${ns.formatNumber(this.money_per_hack)}`)
        ns.tprint(`  Money per second on success: $${ns.formatNumber(this.money_per_s)}/s`)
        ns.tprint(`  Expected money per second: $${ns.formatNumber(this.expected_money_per_s)}/s`)

        ns.tprint("")
        // ns.tprint(`  Grow threads to grow ${ns.formatPercent(this.money_percent)} = ${grow_threads}`)
        ns.tprint(`  Security increase for grow threads: ${this.grow_security}`)
        ns.tprint(`  Grow security penalty per s: ${this.grow_security_per_s}`)

        ns.tprint("")
        ns.tprint(`  Security decrease per weak thread: ${this.weak_security}`)
        // ns.tprint(`  Weak threads to overcome the security penalty: ${weak_threads}`)
        ns.tprint(`  Weak security bonus per s: ${this.weak_security_per_s}`)

        ns.tprint("")
        ns.tprint(`  Required total threads: ${this.total_threads}`)
        ns.tprint(`  Required total RAM: ${this.total_ram}GB`)
        ns.tprint(`  Expected $/s/GB = $${ns.formatNumber(this.expected_money_per_s / this.total_ram)}`)
        ns.tprint(`  Security delta per s: ${ns.formatNumber(this.delta_security_per_s)}`)
    }
}

export interface HackStrategy {
    needed_ram(): number;
    execute(run_server: string): void;
}

class BaseHackStrategy implements HackStrategy {
    target_server: string;
    grow_threads: number = 0;
    hack_threads: number = 0;
    weak_threads: number = 0;

    constructor(target_server: string) {
        this.target_server = target_server
    }

    get_info(): HackInfo {
        return new HackInfo(this.target_server, this.hack_threads, this.grow_threads, this.weak_threads)
    }

    needed_ram(): number {
        return (
            ns.getScriptRam("grow.js") * this.grow_threads +
            ns.getScriptRam("weak.js") * this.weak_threads +
            ns.getScriptRam("hack.js") * this.hack_threads
        )
    }

    execute(run_server: string) {
        // ns.print(`'Attempting to execute BaseHackStrategy on ${this.target_server} from ${run_server}`)
        ns.scp(["grow.js", "hack.js", "weak.js"], run_server, "home")
        if (this.grow_threads > 0)
            ns.exec("grow.js", run_server, { threads: this.grow_threads }, this.target_server)
        if (this.hack_threads > 0)
            ns.exec("hack.js", run_server, { threads: this.hack_threads }, this.target_server)
        if (this.weak_threads > 0)
            ns.exec("weak.js", run_server, { threads: this.weak_threads }, this.target_server)
    }
}

export class ParasiteHackStrategy extends BaseHackStrategy {
    constructor(target_server: string, ram: number) {
        super(target_server)
        this.hack_threads = Math.floor(ram / ns.getScriptRam("hack.js"))
    }

    is_valid(): boolean {
        return this.hack_threads > 0
    }
}

export class SimpleHackStrategy implements HackStrategy {
    target_server: string;
    threads: number = 1;
    hack_iter: number = 1;
    grow_iter: number = 1;
    weak_iter: number = 1;
    found_errors: boolean = false;

    constructor(target_server: string, ram: number) {
        this.target_server = target_server
        this.threads = Math.floor(ram / ns.getScriptRam("small.js"))
    }

    needed_ram(): number {
        return ns.getScriptRam("small.js") * this.threads;
    }

    execute(run_server: string) {
        // ns.print(`'Attempting to execute SimpleHackStrategy on ${this.target_server} from ${run_server}`)
        ns.scp("small.js", run_server, "home")
        if (this.threads > 0)
            ns.exec("small.js", run_server, { threads: this.threads }, this.target_server, this.hack_iter, this.grow_iter, this.weak_iter)
    }

    is_valid(): boolean {
        return !this.found_errors
    }
}

export class SmallHackStrategy extends SimpleHackStrategy {
    extra_weak: number

    constructor(target_server: string, ram: number, extra_weak: number = 0) {
        super(target_server, ram)
        this.extra_weak = extra_weak
        const server_info = new ServerHackInfo(target_server)
        if (server_info.money_available < server_info.money_max * 0.1) {
            this.found_errors = true
            return
        }
        this.threads = Math.floor(ram / ns.getScriptRam("small.js"))
        const ratios = this.estimate_ratios(server_info, this.threads)
        this.hack_iter = ratios[0]
        this.grow_iter = ratios[1]
        this.weak_iter = ratios[2]
    }

    estimate_ratios(server_info: ServerHackInfo, threads: number) {
        const hack = ns.hackAnalyzeSecurity(threads, server_info.name)
        const money_percent = ns.hackAnalyze(server_info.name) * threads
        var grow_iter = Math.ceil(ns.growthAnalyze(server_info.name, 1 + money_percent) / threads)
        const grow = ns.growthAnalyzeSecurity(threads, server_info.name) * grow_iter
        const weak_iter = Math.ceil((hack + grow) / ns.weakenAnalyze(threads)) + this.extra_weak
        return [1, grow_iter, weak_iter]
    }

}

export class SustainableHackStrategy extends BaseHackStrategy {
    found_solution: boolean = false;

    constructor(target_server: string, ram: number) {
        super(target_server)
        const server_info = new ServerHackInfo(target_server)
        if (server_info.money_available < server_info.money_max * 0.5)
            return

        var threads = this.estimate_threads(server_info, 1)
        this.hack_threads = 1
        this.grow_threads = threads[0]
        this.weak_threads = threads[1]
        if (this.needed_ram() > ram || ram <= 0) {
            return
        }
        this.hack_threads = Math.floor(ram / this.needed_ram())
        threads = this.estimate_threads(server_info, this.hack_threads)
        this.grow_threads = threads[0]
        this.weak_threads = threads[1]
        if (this.needed_ram() > ram) {
            return
        }
        this.found_solution = true
    }

    estimate_threads(server_info: ServerHackInfo, hack_threads: number) {
        const hack = ns.hackAnalyzeSecurity(hack_threads, server_info.name)
        const hack_per_s = hack / server_info.hack_time * 1000
        const money_percent = ns.hackAnalyze(server_info.name) * hack_threads

        var grow_threads = Math.ceil(ns.growthAnalyze(server_info.name, 1 + money_percent))
        const grow = ns.growthAnalyzeSecurity(grow_threads, server_info.name)
        const grow_per_s = grow / server_info.grow_time * 1000
        const weak_per_thread = ns.weakenAnalyze(1)
        const weak_per_thread_per_s = weak_per_thread / server_info.weak_time * 1000
        var weak_threads = Math.ceil((hack_per_s + grow_per_s) / weak_per_thread_per_s)
        return [grow_threads, weak_threads]
    }

    is_valid(): boolean {
        return this.found_solution
    }
}

export class FixHackStrategy extends BaseHackStrategy {
    found_solution: boolean = false;

    constructor(target_server: string, ram: number) {
        super(target_server)
        const server_info = new ServerHackInfo(target_server)
        this.hack_threads = 0
        this.grow_threads = 0
        this.weak_threads = 0

        const should_grow = recommend_grow(target_server, 0.9)
        const should_weak = recommend_weak(target_server, 5)
        while (true) {
            if (should_grow.recommend)
                this.grow_threads += 1
            if (this.needed_ram() > ram) {
                this.grow_threads -= 2
                break
            }
            if (should_weak.recommend)
                this.weak_threads += 1
            if (this.needed_ram() > ram) {
                this.weak_threads -= 2
                break
            }
        }
        if (this.grow_threads > 0 && this.weak_threads > 0) {
            this.found_solution = true
            ns.print(`FixHack Solution found for ${target_server}: g${this.grow_threads}, w${this.weak_threads}`)
            ns.print(`Needed ram: ${this.needed_ram()}`)
        }
        return

        if (server_info.money_max == 0)
            return
        if (server_info.security_level > server_info.security_min + 5) {
            this.hack_threads = 0
            this.grow_threads = 0
            this.weak_threads = 1
            if (this.needed_ram() > ram || ram <= 0) {
                return
            }
            this.weak_threads = Math.floor(ram / this.needed_ram())
            if (this.needed_ram() > ram || ram <= 0) {
                return
            }
            this.found_solution = true
        }
        else if (server_info.money_available < server_info.money_max * 0.9) {
            this.hack_threads = 0
            this.grow_threads = 1
            this.weak_threads = this.estimate_threads(server_info, 1)
            if (this.needed_ram() > ram || ram <= 0) {
                return
            }
            var threads = Math.floor(ram / this.needed_ram())
            this.grow_threads = threads
            this.weak_threads = this.estimate_threads(server_info, threads)
            if (this.needed_ram() > ram) {
                return
            }
            this.found_solution = true
        }
    }

    estimate_threads(server_info: ServerHackInfo, grow_threads: number) {
        const grow = ns.growthAnalyzeSecurity(grow_threads, server_info.name)
        const grow_per_s = grow / server_info.grow_time * 1000
        const weak_per_thread = ns.weakenAnalyze(1)
        const weak_per_thread_per_s = weak_per_thread / server_info.weak_time * 1000
        var weak_threads = Math.ceil(grow_per_s / weak_per_thread_per_s)
        return weak_threads
    }

    is_valid(): boolean {
        return this.found_solution
    }

    execute(run_server: string) {
        ns.scp(["grow.js", "weak.js"], run_server, "home")
        ns.scp(ns.ls("home", "/lib"), run_server, "home")
        if (this.grow_threads > 0)
            ns.exec("grow.js", run_server, { threads: this.grow_threads }, this.target_server, "-i", 10)
        if (this.weak_threads > 0)
            ns.exec("weak.js", run_server, { threads: this.weak_threads }, this.target_server, "-i", 10)
    }
}


export function print_hack_strategy(server: string, ram: number) {
    var strategy = new SmallHackStrategy(server, ram)
    if (strategy.is_valid())
        return strategy
    return null
}
///////////////////////////////////////////////////////////////////////////////

export function recommend_grow(server: string, threshold: number): Recommendation {
    const money = ns.getServerMoneyAvailable(server)
    const max_money = ns.getServerMaxMoney(server)

    return new Recommendation(
        money < max_money * threshold,
        `${server} has $${ns.formatNumber(money)} of $${ns.formatNumber(max_money)}`,
        "growing", server
    )
}

export function recommend_weak(server: string, threshold: number): Recommendation {
    const security = ns.getServerBaseSecurityLevel(server)
    const min_security = ns.getServerMinSecurityLevel(server)

    return new Recommendation(
        security > min_security + threshold,
        `${server} has security ${ns.formatNumber(security)} of ${ns.formatNumber(min_security)}`,
        "weakening", server
    )
}

export function recommend_hack(server: string, threshold: number): Recommendation {
    const money = ns.getServerMoneyAvailable(server)
    const max_money = ns.getServerMaxMoney(server)

    return new Recommendation(
        money > max_money * threshold,
        `${server} has $${ns.formatNumber(money)} of $${ns.formatNumber(max_money)}`,
        "hacking", server
    )
}