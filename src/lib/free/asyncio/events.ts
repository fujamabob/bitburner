import { NetscriptPort, NS } from "@ns"
import { get_port_number } from "./port_registry"

/** Stateful event.  Allows waiters through while set. */
export class StatefulEvent {
    private _is_set: boolean
    private port: NetscriptPort

    constructor(ns: NS) {
        this._is_set = false
        const port_num = get_port_number(this)
        this.port = ns.getPortHandle(port_num)
    }
    set() {
        this._is_set = true
        this.port.write("Event")
        this.port.clear()
    }
    clear() {
        this._is_set = false
    }
    async wait(): Promise<void> {
        if (this.is_set)
            return Promise.resolve()
        await this.port.nextWrite()
    }
    public get is_set(): boolean {
        return this._is_set;
    }
}

/** Edge-triggered event.  Only allows waiters through if they were waiting when set() was called. */
export class MomentaryEvent {
    private event: StatefulEvent

    constructor(ns: NS) {
        this.event = new StatefulEvent(ns)
    }
    public get is_set(): boolean {
        return this.event.is_set;
    }
    set() {
        this.event.set()
        this.event.clear()
    }
    async wait(): Promise<void> {
        await this.event.wait()
    }
}

