import { NS } from "@ns";
import { init_script } from "./lib/utils";
import { NetworkPipe } from "./lib/pipe";

export async function main(ns: NS): Promise<void> {
    await init_script(ns)
    let server_conf
    try {
        server_conf = JSON.parse(ns.read('server_conf.txt'))
    }
    catch (err) {
        return
    }



    const pipe = new NetworkPipe(server_conf.port_num)
    let cmd = 'hack'
    for (; ;) {
        let new_cmd = pipe.peek()
        if (new_cmd == null)
            new_cmd = cmd
        cmd = new_cmd

        if (cmd == 'hack')
            await ns.hack(server_conf.hostname)
        else if (cmd == 'grow')
            await ns.grow(server_conf.hostname)
        else if (cmd == 'weak')
            await ns.weaken(server_conf.hostname)
        else if (cmd == 'quit')
            break
    }
}
