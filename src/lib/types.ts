import { NS } from "@ns";

export let ns: NS

export function set_global_ns(value: NS) {
    ns = value
}

export class Recommendation {
    recommend: boolean
    rationale: string
    operation: string
    server: string

    constructor(recommend: boolean, rationale: string, operation: string, server: string) {
        this.recommend = recommend
        this.rationale = rationale
        this.operation = operation
        this.server = server
    }

    describe(): string {
        return `[${this.recommend ? "YES" : " NO"}] to ${this.operation} on ${this.server}: ${this.rationale}`
    }
}


/* Hacking utilities

brutessh(host) 	Runs BruteSSH.exe on a server.
ftpcrack(host) 	Runs FTPCrack.exe on a server.
httpworm(host) 	Runs HTTPWorm.exe on a server.
nuke(host) 	Runs NUKE.exe on a server.
relaysmtp(host) 	Runs relaySMTP.exe on a server.
sqlinject(host) 	Runs SQLInject.exe on a server.

getGrowTime(host) 	Get the execution time of a grow() call.
getHackTime(host) 	Get the execution time of a hack() call.
getWeakenTime(host) 	Get the execution time of a weaken() call.

growthAnalyze(host, multiplier, cores) 	Calculate the number of grow threads needed for a given multiplicative growth factor.
growthAnalyzeSecurity(threads, hostname, cores) 	Calculate the security increase for a number of grow threads.
hackAnalyze(host) 	Get the part of money stolen with a single thread.
hackAnalyzeChance(host) 	Get the chance of successfully hacking a server.
hackAnalyzeSecurity(threads, hostname) 	Get the security increase for a number of threads.
hackAnalyzeThreads(host, hackAmount) 	Calculate the decimal number of threads needed to hack a specified amount of money from a target host.
weakenAnalyze(threads, cores) 	Predict the effect of weaken.

grow(host, opts) 	Spoof money in a server's bank account, increasing the amount available.
hack(host, opts) 	Steal a server's money.
weaken(host, opts) 	Reduce a server's security level.

getHackingLevel() 	Returns the player’s current hacking level.
getHackingMultipliers() 	Get hacking related multipliers.
*/

/* Hacknet utilities
getHacknetMultipliers() 	Get hacknet related multipliers.
See also ns.hacknet
*/

/* Miscellaneous
asleep(millis) 	Suspends the script for n milliseconds. Doesn't block with concurrent calls.
sleep(millis) 	Suspends the script for n milliseconds.

atExit(f, id) 	Add callback function when the script dies
exit() 	Terminates the current script immediately.

getBitNodeMultipliers(n, lvl) 	Get the current Bitnode multipliers.
getFavorToDonate() 	Returns the amount of Faction favor required to be able to donate to a faction.
getMoneySources() 	Get information about the sources of income for this run.
getPlayer() 	Get information about the player.
getSharePower() 	Share Power has a multiplicative effect on rep/second while doing work for a faction. Share Power increases incrementally for every thread of share running on your server network, but at a sharply decreasing rate.
getTimeSinceLastAug() 	Returns the amount of time in milliseconds that have passed since you last installed Augmentations.
getResetInfo() 	Get information about resets.
hasTorRouter() 	Returns whether the player has access to the darkweb.

share() 	Share the server's ram with your factions.

sprintf(format, args) 	Format a string.
vsprintf(format, args) 	Format a string with an array of arguments.

ns.ui.getGameInfo()
*/

/* Personal Servers
deleteServer(host) 	Delete a purchased server.
getPurchasedServerCost(ram) 	Get cost of purchasing a server.
getPurchasedServerLimit() 	Returns the maximum number of servers you can purchase.
getPurchasedServerMaxRam() 	Returns the maximum RAM that a purchased server can have.
getPurchasedServers() 	Returns an array with the hostnames of all of the servers you have purchased.
getPurchasedServerUpgradeCost(hostname, ram) 	Get cost of upgrading a purchased server to the given ram.
purchaseServer(hostname, ram) 	Purchase a server.
renamePurchasedServer(hostname, newName) 	Rename a purchased server.
upgradePurchasedServer(hostname, ram) 	Upgrade a purchased server's RAM.
*/

/* Scripts Management
exec(script, hostname, threadOrOptions, args) 	Start another script on any server.
getRunningScript(filename, hostname, args) 	Get general info about a running script.
getScriptExpGain(script, host, args) 	Get the exp gain of a script.
getScriptIncome(script, host, args) 	Get the income of a script.
getScriptLogs(fn, host, args) 	Get all the logs of a script.
getScriptName() 	Returns the current script name.
getScriptRam(script, host) 	Get the ram cost of a script.
getFunctionRamCost(name) 	Get the ram cost of a netscript function.
getRecentScripts() 	Get an array of recently killed scripts across all servers.
getTotalScriptExpGain() 	Get the exp gain of all scripts.
getTotalScriptIncome() 	Get the income of all scripts.
isRunning(script, host, args) 	Check if a script is running.
kill(pid) 	Terminate the script with the provided PID.
kill(filename, hostname, args) 	Terminate the script(s) with the provided filename, hostname, and script arguments.
ramOverride(ram) 	Change the current static RAM allocation of the script.
run(script, threadOrOptions, args) 	Start another script on the current server.
scriptKill(script, host) 	Kill all scripts with a filename.
scriptRunning(script, host) 	Check if any script with a filename is running.
spawn(script, threadOrOptions, args) 	Terminate current script and start another in a defined number of milliseconds.
*/

/* Server Managemnt (Network Management?)
getServer(host) 	Returns a server object for the given server. Defaults to the running script's server if host is not specified.
getServerBaseSecurityLevel(host) 	Get the base security level of a server.
getServerGrowth(host) 	Get a server growth parameter.
getServerMaxMoney(host) 	Get the maximum money available on a server.
getServerMaxRam(host) 	Get the maximum amount of RAM on a server.
getServerMinSecurityLevel(host) 	Returns the minimum security level of the target server.
getServerMoneyAvailable(host) 	Get money available on a server.
getServerNumPortsRequired(host) 	Returns the number of open ports required to successfully run NUKE.exe on the specified server.
getServerRequiredHackingLevel(host) 	Returns the required hacking level of the target server.
getServerSecurityLevel(host) 	Get server security level.
getServerUsedRam(host) 	Get the used RAM on a server.
getHostname() 	Returns a string with the hostname of the server that the script is running on.
hasRootAccess(host) 	Check if you have root access on a server.
killall(host, safetyguard) 	Terminate all scripts on a server.
ps(host) 	List running scripts on a server.
scan(host) 	Get the list of servers connected to a server.
serverExists(host) 	Returns a boolean denoting whether or not the specified server exists.
*/
