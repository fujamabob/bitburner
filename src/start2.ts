import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    await run_script(ns, 'crack.js', '-c')
    // ns.run('crack.js', { preventDuplicates: true }, '-m')
}

async function run_script(ns: NS, name: string, ...args: string[]) {
    const pid = ns.run(name, { preventDuplicates: true }, ...args)
    let done = false
    while (!done) {
        await ns.asleep(100)
        done = true
        for (const proc of ns.ps()) {
            if (proc.pid == pid) {
                done = false
                break
            }
        }
    }
}

