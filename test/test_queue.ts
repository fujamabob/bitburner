import { NS } from "@ns";


async function test_event(ns: NS, event: Event) {
    for (let i = 0; i < 10; i++) {
        await event.wait()
        ns.tprint(`Iteration ${i}`)
    }
}

async function test_queue(ns: NS, queue: AsyncQueue<string>, name: string) {
    let command = ''
    do {
        command = await queue.get()
        ns.tprint(`${name} got command ${command}`)
    } while (command != "done")
}

async function test_manage_task(ns: NS, name: string, queue: AsyncQueue<NSJob>) {
    let job = { fn_name: 'ns.tprint', args: [`Fake manager for ${name} running`] }
    queue.put(job)
    for (let i = 0; i < 10; i++) {
        job = { fn_name: 'ns.tprint', args: [`${name} says ${i}`] }
        queue.put(job)
        await ns.asleep(0)
    }
    job = { fn_name: 'ns.tprint', args: [`Fake manager for ${name} exiting`] }
    queue.put(job)
}

interface NSJob {
    fn_name: string;
    args: Array<string>;
}

export async function main(ns: NS): Promise<void> {
    const queue = new AsyncQueue<NSJob>()
    let task1 = test_manage_task(ns, 'n00dles', queue)
    let task2 = test_manage_task(ns, 'foodnstuff', queue)
    while (!queue.empty()) {
        const job = await queue.get()
        await eval(job.fn_name)(...job.args)
        await ns.asleep(0)
    }
    await Promise.all([task1, task2])

    const event = new Event()
    task1 = test_event(ns, event)
    task2 = test_event(ns, event)
    ns.tprint(`Testing event...`)
    for (let i = 0; i < 10; i++) {
        ns.tprint(`Setter iteration ${i}`)
        event.set()
        event.clear()
        await ns.asleep(1000)
    }
    await Promise.all([task1, task2])

    const msg_queue = new AsyncQueue<string>()
    task1 = test_queue(ns, msg_queue, 'queue1')
    task2 = test_queue(ns, msg_queue, 'queue2')
    ns.tprint(`Testing queue...`)
    for (let i = 0; i < 5; i++) {
        ns.tprint(`Setter iteration ${i}`)
        await msg_queue.put(`test message ${i}`)
        await ns.asleep(1000)
    }
    await msg_queue.put("done")
    await msg_queue.put("done")
    await Promise.all([task1, task2])

    ns.tprint(`Done.`)
    return
}
