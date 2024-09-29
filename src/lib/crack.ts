import { ns } from "/lib/types";
import { is_locked } from "lib/lock";
import { get_server_list } from "lib/scan";
import * as root from "/lib/root";

export async function manage(): Promise<void> {
    while (true) {
        if (!is_locked(ns, "crack"))
            for (let name of get_server_list(ns, "home", root.is_hackable)) {
                if (!root.has_root(ns, name))
                    if (root.hack(ns, name))
                        ns.toast(`Successfully hacked ${name}`)
            }
        await ns.asleep(1000);
    }
}