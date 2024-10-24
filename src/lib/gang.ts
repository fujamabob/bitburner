import { NS } from "@ns";
import { delay } from "./utils";
import { is_locked } from "./lock";

export async function manage(ns: NS) {
    // var my_gang = new Gang();

    // while (true) {
    //     var member = my_gang.recruit()
    //     member?.task("Train Combat")
    //     await delay(10000)
    // }

    const wanted_threshold = 0.99
    let index = 0
    // const tasks = ["Train Combat", "Train Hacking", "Train Charisma", "Territory Warfare"]//, "Terrorism", "Ascend"]
    const tasks = ["Train Combat", "Train Hacking", "Train Charisma", "Ascend"]
    // const tasks = ["Train Combat", "Vigilante", "Traffick Illegal Arms", "Ascend"]
    const timeout = 10 * 60 * 1000  // 10 minutes
    while (!is_locked(ns, "gang")) {
        let timeout_mod = 1
        // Recruit members
        while (ns.gang.recruitMember(`x${ns.gang.getMemberNames().length + 1}`)) {
            // Let it roll
        }
        // while (my_gang.recruit());
        // Assign task rotation (v1 - feed forward)
        const current_task = tasks[index]
        ns.print(`Current task: ${current_task}`)
        if (current_task == "Ascend") {
            for (const name of ns.gang.getMemberNames()) {
                ns.gang.ascendMember(name)
            }
            timeout_mod = 0
        }
        else if (current_task == "Terrorism") {
            for (const name of ns.gang.getMemberNames()) {
                ns.gang.setMemberTask(name, "Terrorism")
            }
            await delay(2000)
            for (const name of ns.gang.getMemberNames()) {
                if (ns.gang.getGangInformation().wantedLevelGainRate <= 0) {
                    break
                }
                ns.gang.setMemberTask(name, "Vigilante Justice")
                await delay(2000)
            }
        }
        else if (current_task == "Vigilante") {
            for (const name of ns.gang.getMemberNames()) {
                ns.gang.setMemberTask(name, "Vigilante Justice")
            }
            while (ns.gang.getGangInformation().wantedPenalty < wanted_threshold && ns.gang.getGangInformation().wantedLevel > 1)
                await delay(2000)
            timeout_mod = 0
        }
        else {
            for (const name of ns.gang.getMemberNames()) {
                ns.gang.setMemberTask(name, current_task)
            }
            await delay(2000)
            for (const name of ns.gang.getMemberNames()) {
                if (ns.gang.getGangInformation().wantedLevelGainRate <= 0) {
                    break
                }
                ns.gang.setMemberTask(name, "Vigilante Justice")
                await delay(2000)
            }
        }

        index = (index + 1) % tasks.length
        await delay(timeout * timeout_mod)
    }
    // // The functions to be investigated are:

    // // Gang management
    // ns.gang.getOtherGangInformation

    // // ???
    // ns.gang.getBonusTime

    // // Clash with other gangs
    // ns.gang.getChanceToWinClash
    // ns.gang.setTerritoryWarfare

    // // Equipment
    // ns.gang.getEquipmentCost
    // ns.gang.getEquipmentNames
    // ns.gang.getEquipmentStats
    // ns.gang.getEquipmentType
    // ns.gang.purchaseEquipment

    // // Installs? 
    // ns.gang.getInstallResult

    // // Wait until new info
    // ns.gang.nextUpdate
}

export class Gang {
    // info: GangGenInfo
    members: Array<Member>
    ns: NS

    constructor(ns: NS) {
        // if (!ns.gang.inGang())
        //     ns.gang.createGang('CyberSec')
        // this.info = ns.gang.getGangInformation()
        this.ns = ns
        this.members = new Array<Member>()
        for (const name of ns.gang.getMemberNames())
            this.members.push(new Member(ns, name))
    }

    public get recruit_available(): boolean {
        return this.ns.gang.canRecruitMember()
    }

    recruit(): boolean {
        if (this.recruit_available) {
            const name = `member-${this.members.length}`
            if (this.ns.gang.recruitMember(name)) {
                const member = new Member(this.ns, name)
                this.members.push(member)
                return true
            }
        }
        return false
    }

}

// export class Tasks {
//     tasks: Array<GangTaskStats>

//     constructor() {
//         this.tasks = new Array<GangTaskStats>();
//         for (let name of ns.gang.getTaskNames()) {
//             this.tasks.push(ns.gang.getTaskStats(name))
//         }
//     }

// }

export class Member {
    name: string
    ns: NS

    //  // Member management
    //  ns.gang.getAscensionResult
    //  ns.gang.getMemberInformation
    //  ns.gang.getRecruitsAvailable
    //  ns.gang.respectForNextRecruit

    // ascend() {
    //     return ns.gang.ascendMember(this.name);
    // }

    task(task: string): boolean {
        return this.ns.gang.setMemberTask(this.name, task)
    }

    // rename(name: string) {
    //     if (ns.gang.renameMember(this.name, name))
    //         this.name = name
    //     return this.name == name
    // }

    constructor(ns: NS, name: string) {
        this.name = name
        this.ns = ns
    }

    describe(): string {
        return `Member: ${this.name}`
    }
}