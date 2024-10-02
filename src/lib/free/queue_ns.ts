import { NetscriptPort, NS } from "@ns";

export namespace asyncio {

    namespace PortNumberRegistry {
        const start_port = 1024
        const used_ports = new Map<number, null>
        const registry = new FinalizationRegistry((port_num: number) => {
            used_ports.delete(port_num)
        })

        function next_port_number(): number {
            if (used_ports.size == 0)
                return start_port
            return Math.max(...used_ports.keys()) + 1
        }

        export function get_port_number(obj: any): number {
            const next = next_port_number()
            used_ports.set(next, null)
            registry.register(obj, next)
            return next
        }
    }


    /** Stateful event.  Allows waiters through while set. */
    export class Event {
        private _is_set: boolean
        private port: NetscriptPort

        constructor(ns: NS) {
            this._is_set = false
            const port_num = PortNumberRegistry.get_port_number(this)
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
        private event: Event

        constructor(ns: NS) {
            this.event = new Event(ns)
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

    /** Asynchronous queue.  FIXME: join() / task_done() semantics differ. */
    export class AsyncQueue<Type> {
        private queue: NetscriptPort
        private done_event: Event
        private next_read: MomentaryEvent
        private count: number

        constructor(ns: NS) {
            this.queue = ns.getPortHandle(PortNumberRegistry.get_port_number(this))
            this.done_event = new Event(ns)
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
}
