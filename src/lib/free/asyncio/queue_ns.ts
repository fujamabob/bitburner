import { NetscriptPort, NS } from "@ns";
import { MomentaryEvent, StatefulEvent } from "./events";
import { get_port_number } from "./port_registry";


/** Asynchronous queue.  FIXME: join() / task_done() semantics differ. */
export class AsyncQueue<Type> {
    private queue: NetscriptPort
    private done_event: StatefulEvent
    private next_read: MomentaryEvent
    private count: number

    constructor(ns: NS) {
        this.queue = ns.getPortHandle(get_port_number(this))
        this.done_event = new StatefulEvent(ns)
        this.count = 0
        this.next_read = new MomentaryEvent(ns)
    }
    empty() {
        return this.queue.empty()
    }
    full() {
        return this.queue.full()
    }
    async get(): Promise<Type> {
        let value = this.get_nowait()
        while (value === undefined) {
            await this.queue.nextWrite()
            value = this.get_nowait()
        }
        return value
    }
    get_nowait(): Type | undefined {
        const value = this.queue.read()
        if (value == "NULL PORT DATA")
            return undefined
        this.count--
        if (this.empty())
            this.done_event.set()
        return value

    }
    async join() {
        await this.done_event.wait()
    }
    async put(item: Type) {
        let success = this.put_nowait(item)
        while (!success) {
            await this.next_read.wait()
            success = this.put_nowait(item)
        }
    }
    put_nowait(item: Type): boolean {
        const success = this.queue.tryWrite(item)
        if (success) {
            this.count++
            this.done_event.clear()
        }
        return success
    }
    qsize(): number {
        return this.count
    }
}
