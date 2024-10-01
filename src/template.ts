import { NS } from "@ns";
import { delay, init_script, Schema } from "./lib/utils";
import { list_files, LocalFile, NetworkFile } from "./lib/file";
import { get_server_list } from "./lib/scan";

/** Stateful event.  Allows waiters through while set. */
class Event {
  is_set: boolean
  _promise: Promise<void>
  _resolver: ((v: void | PromiseLike<void>) => void)

  constructor() {
    this.is_set = false
    const { promise, resolve, reject } = Promise.withResolvers<void>()
    this._promise = promise
    this._resolver = resolve
  }
  set() {
    this.is_set = true
    this._resolver()
  }
  clear() {
    if (!this.is_set)
      return
    this.is_set = false
    const { promise, resolve, reject } = Promise.withResolvers<void>()
    this._promise = promise
    this._resolver = resolve
  }
  async wait(): Promise<void> {
    if (this.is_set)
      return Promise.resolve()
    await this._promise
  }
}

/** Edge-triggered event.  Only allows waiters through if they were waiting when set() was called. */
class MomentaryEvent {
  event: Event

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
class AsyncQueue<Type> {
  queue: Array<Type>
  maxsize: number = Infinity
  done_event: Event
  data_event: MomentaryEvent

  constructor() {
    this.queue = new Array<Type>()
    this.done_event = new Event()
    this.data_event = new MomentaryEvent()
  }
  empty() {
    return this.queue.length == 0
  }
  full() {
    return false
  }
  async get(): Promise<Type> {
    while (true) {
      var value = this.queue.shift()
      if (value !== undefined) {
        if (this.empty())
          this.done_event.set()
        return value
      }
      await this.data_event.wait()
    }
  }
  get_nowait(): Type | undefined {
    const value = this.queue.shift()
    if (this.empty())
      this.done_event.set()
    return value
  }
  async join() {
    await this.done_event.wait()
  }
  async put(item: Type) {
    this.put_nowait(item)
  }
  put_nowait(item: Type) {
    this.queue.push(item)
    this.done_event.clear()
    this.data_event.set()
  }
  qsize(): number {
    return this.queue.length
  }
}

async function test_event(ns: NS, event: Event) {
  for (let i = 0; i < 10; i++) {
    await event.wait()
    ns.tprint(`Iteration ${i}`)
  }
}

async function test_queue(ns: NS, queue: AsyncQueue<string>, name: string) {
  var command = ''
  do {
    command = await queue.get()
    ns.tprint(`${name} got command ${command}`)
  } while (command != "done")
}

async function test_manage_task(ns: NS, name: string, queue: AsyncQueue<NSJob>) {
  let job = { fn_name: 'ns.tprint', args: [`Fake manager for ${name} running`] }
  queue.put(job)
  for (let i = 0; i < 10; i++) {
    job = { fn_name: 'ns.hack', args: [name] }
    queue.put(job)
    await ns.asleep(1000)
  }
  job = { fn_name: 'ns.tprint', args: [`Fake manager for ${name} exiting`] }
  queue.put(job)
}

interface NSJob {
  fn_name: string;
  args: Array<string>;
}

export async function main(ns: NS): Promise<void> {
  var queue = new AsyncQueue<NSJob>()
  var task1 = test_manage_task(ns, 'n00dles', queue)
  var task2 = test_manage_task(ns, 'foodnstuff', queue)
  while (!queue.empty()) {
    let job = await queue.get()
    await eval(job.fn_name)(...job.args)
  }
  await Promise.all([task1, task2])
  return

  // var event = new Event()
  // var task1 = test_event(ns, event)
  // var task2 = test_event(ns, event)
  // ns.tprint(`Testing event...`)
  // for (let i = 0; i < 10; i++) {
  //   ns.tprint(`Setter iteration ${i}`)
  //   event.set()
  //   event.clear()
  //   await ns.asleep(1000)
  // }
  // await Promise.all([task1, task2])

  // var queue = new AsyncQueue<string>()
  // var task1 = test_queue(ns, queue, 'queue1')
  // var task2 = test_queue(ns, queue, 'queue2')
  // ns.tprint(`Testing queue...`)
  // for (let i = 0; i < 5; i++) {
  //   ns.tprint(`Setter iteration ${i}`)
  //   await queue.put(`test message ${i}`)
  //   await ns.asleep(1000)
  // }
  // await queue.put("done")
  // await queue.put("done")
  // await Promise.all([task1, task2])

  // ns.tprint(`Done.`)
  // return

  const arg_schema = [
    ['q', false], // List files
    ['c', false], // Scp files
    ['dest', 'home'],
    ['d', false], // Delete files
    ['y', false], //   Confirmation required
    ['r', '']     // Rename files
  ] as Schema
  const [flags, args] = init_script(ns, arg_schema)

  for (let server of get_server_list(ns)) {
    // ns.tprint(`Scanning server ${server}:`)
    for (let file of list_files(server, args[0]?.toString())) {
      if (!flags.q)
        ns.tprint(`  ${file.describe()}`)
      if (flags.c)
        file.network_copy(flags.dest)
      if (flags.d)
        if (flags.y)
          file.delete()
    }
  }
}
