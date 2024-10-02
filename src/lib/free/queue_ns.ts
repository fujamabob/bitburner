import { NetscriptPort, NS } from "@ns";

export namespace asyncio {

    namespace PortNumberRegistry {
        const start_port = 1024
        const used_ports = new Map<number, any>
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
            used_ports.set(next, obj)
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
            this.port.write("event")
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
        private queue: Array<Type>
        private maxsize: number
        private done_event: Event
        private get_event: MomentaryEvent
        private put_event: MomentaryEvent

        constructor(ns: NS, maxsize = Infinity) {
            this.queue = new Array<Type>()
            this.done_event = new Event(ns)
            this.get_event = new MomentaryEvent(ns)
            this.put_event = new MomentaryEvent(ns)
            this.maxsize = maxsize
        }
        empty() {
            return this.queue.length == 0
        }
        full() {
            return this.queue.length == this.maxsize
        }
        async get(): Promise<Type> {
            let value = this.get_nowait()
            while (value === undefined) {
                await this.put_event.wait()
                value = this.get_nowait()
            }
            return value
        }
        get_nowait(): Type | undefined {
            const value = this.queue.shift()
            if (value !== undefined) {
                this.get_event.set()
                if (this.empty())
                    this.done_event.set()
            }
            return value
        }
        async join() {
            await this.done_event.wait()
        }
        async put(item: Type) {
            this.put_nowait(item)
        }
        put_nowait(item: Type): boolean {
            if (this.full())
                return false
            this.queue.push(item)
            this.done_event.clear()
            this.put_event.set()
            return true
        }
        qsize(): number {
            return this.queue.length
        }
    }
}
