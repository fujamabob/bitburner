import { NS } from "@ns";
import { init_script } from "./lib/utils";
import { NetworkPipe } from "./lib/pipe";

export async function main(ns: NS): Promise<void> {
    await init_script(ns)
    const server_conf = JSON.parse(ns.read('server_conf.txt'))


    const pipe = new NetworkPipe(server_conf.port_num)
    for (; ;) {
        const cmd = pipe.peek()

        if (cmd == 'quit')
            break
        await ns.hack(server_conf.hostname)
    }
}
