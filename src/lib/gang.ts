import { GangGenInfo, GangTaskStats } from "@ns";
import { ns } from "./types";
import { delay } from "./utils";
import { is_locked } from "./lock";

export async function manage() {
    // var my_gang = new Gang();

    // while (true) {
    //     var member = my_gang.recruit()
    //     member?.task("Train Combat")
    //     await delay(10000)
    // }

    const wanted_threshold = 500
    var index = 0
    const tasks = ["Train Combat", "Train Hacking", "Train Charisma", "Territory Warfare"]//, "Terrorism", "Ascend"]
    const timeout = 10 * 60 * 1000  // 10 minutes
    while (!is_locked(ns, "gang")) {
        var timeout_mod = 1
        // Recruit members
        // while (my_gang.recruit());
        // Assign task rotation (v1 - feed forward)
        var current_task = tasks[index]
        ns.print(`Current task: ${current_task}`)
        if (current_task == "Ascend") {
            for (let name of ns.gang.getMemberNames()) {
                ns.gang.ascendMember(name)
            }
            timeout_mod = 0
        }
        else if (current_task == "Terrorism") {
            for (let name of ns.gang.getMemberNames()) {
                ns.gang.setMemberTask(name, "Terrorism")
            }
            await delay(2000)
            for (let name of ns.gang.getMemberNames()) {
                if (ns.gang.getGangInformation().wantedLevelGainRate <= 0) {
                    break
                }
                ns.gang.setMemberTask(name, "Vigilante Justice")
                await delay(2000)
            }
        }
        else if (current_task == "Vigilante") {
            for (let name of ns.gang.getMemberNames()) {
                ns.gang.setMemberTask(name, "Vigilante Justice")
            }
            while (ns.gang.getGangInformation().wantedLevel > wanted_threshold)
                await delay(2000)
            timeout_mod = 0
        }
        else {
            for (let name of ns.gang.getMemberNames()) {
                ns.gang.setMemberTask(name, current_task)
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

    constructor() {
        // if (!ns.gang.inGang())
        //     ns.gang.createGang('CyberSec')
        // this.info = ns.gang.getGangInformation()

        this.members = new Array<Member>()
        for (let name of ns.gang.getMemberNames())
            this.members.push(new Member(name))
    }

    public get recruit_available(): boolean {
        return ns.gang.canRecruitMember()
    }

    recruit(): boolean {
        if (this.recruit_available) {
            const name = `member-${this.members.length}`
            if (ns.gang.recruitMember(name)) {
                const member = new Member(name)
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

    //  // Member management
    //  ns.gang.getAscensionResult
    //  ns.gang.getMemberInformation
    //  ns.gang.getRecruitsAvailable
    //  ns.gang.respectForNextRecruit

    // ascend() {
    //     return ns.gang.ascendMember(this.name);
    // }

    task(task: string): boolean {
        return ns.gang.setMemberTask(this.name, task)
    }

    // rename(name: string) {
    //     if (ns.gang.renameMember(this.name, name))
    //         this.name = name
    //     return this.name == name
    // }

    constructor(name: string) {
        this.name = name
    }

    describe(): string {
        return `Member: ${this.name}`
    }
}