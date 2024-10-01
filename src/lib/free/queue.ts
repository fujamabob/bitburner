export namespace asyncio {
    /** Stateful event.  Allows waiters through while set. */
    export class Event {
        private _is_set: boolean
        private _promise: Promise<void>
        private _resolver: ((v: void | PromiseLike<void>) => void)

        constructor() {
            this._is_set = false
            const { promise, resolve, } = Promise.withResolvers<void>()
            this._promise = promise
            this._resolver = resolve
        }
        set() {
            this._is_set = true
            this._resolver()
        }
        clear() {
            if (!this.is_set)
                return
            this._is_set = false
            const { promise, resolve, } = Promise.withResolvers<void>()
            this._promise = promise
            this._resolver = resolve
        }
        async wait(): Promise<void> {
            if (this.is_set)
                return Promise.resolve()
            await this._promise
        }
        public get is_set(): boolean {
            return this._is_set;
        }
    }

    /** Edge-triggered event.  Only allows waiters through if they were waiting when set() was called. */
    export class MomentaryEvent {
        private event: Event

        constructor() {
            this.event = new Event()
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

        constructor(maxsize = Infinity) {
            this.queue = new Array<Type>()
            this.done_event = new Event()
            this.get_event = new MomentaryEvent()
            this.put_event = new MomentaryEvent()
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
