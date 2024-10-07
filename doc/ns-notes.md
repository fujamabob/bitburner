Notes on the NS API
===================

API Documentation:
- https://github.com/bitburner-official/bitburner-src/blob/stable/markdown/bitburner.ns.md


Free NS functions
=================

Method 	Description

asleep(millis) 	Suspends the script for n milliseconds. Doesn't block with concurrent calls.
sleep(millis) 	Suspends the script for n milliseconds.
atExit(f, id) 	Add callback function when the script dies
exit() 	Terminates the current script immediately.
ramOverride(ram) 	Change the current static RAM allocation of the script.

clearLog() 	Clears the script’s logs.
print(args) 	Prints one or more values or variables to the script’s logs.
printf(format, args) 	Prints a formatted string to the script’s logs.
printRaw(node) 	Prints a ReactNode to the script logs.

closeTail(pid) 	Close the tail window of a script.
moveTail(x, y, pid) 	Move a tail window.
tail(fn, host, args) 	Open the tail window of a script.
resizeTail(width, height, pid) 	Resize a tail window.
setTitle(title, pid) 	Set the title of the tail window of a script.

disableLog(fn) 	Disables logging for the given NS function.
enableLog(fn) 	Enables logging for the given NS function.
isLogEnabled(fn) 	Checks the status of the logging for the given NS function.

flags(schema) 	Parse command line flags.


getFunctionRamCost(name) 	Get the ram cost of a netscript function.
getScriptLogs(fn, host, args) 	Get all the logs of a script.
getScriptName() 	Returns the current script name.

renamePurchasedServer(hostname, newName) 	Rename a purchased server.

tprint(args) 	Prints one or more values or variables to the Terminal.
tprintf(format, values) 	Prints a raw value or a variable to the Terminal.
tprintRaw(node) 	Prints a ReactNode to the terminal.

NS C-like functions
===================

Method 	Description
brutessh(host) 	Runs BruteSSH.exe on a server.
deleteServer(host) 	Delete a purchased server.
exec(script, hostname, threadOrOptions, args) 	Start another script on any server.
ftpcrack(host) 	Runs FTPCrack.exe on a server.
getBitNodeMultipliers(n, lvl) 	Get the current Bitnode multipliers.
getFavorToDonate() 	Returns the amount of Faction favor required to be able to donate to a faction.
getGrowTime(host) 	Get the execution time of a grow() call.
getHackingLevel() 	Returns the player’s current hacking level.
getHackingMultipliers() 	Get hacking related multipliers.
getHacknetMultipliers() 	Get hacknet related multipliers.
getHackTime(host) 	Get the execution time of a hack() call.
script is running on.
getMoneySources() 	Get information about the sources of income for this run.
getPlayer() 	Get information about the player.
getPurchasedServerCost(ram) 	Get cost of purchasing a server.
getPurchasedServerLimit() 	Returns the maximum number of servers you can purchase.
getPurchasedServerMaxRam() 	Returns the maximum RAM that a purchased server can have.
getPurchasedServers() 	Returns an array with the hostnames of all of the servers you have purchased.
getPurchasedServerUpgradeCost(hostname, ram) 	Get cost of upgrading a purchased server to the given ram.
getRecentScripts() 	Get an array of recently killed scripts across all servers.
getResetInfo() 	Get information about resets.
getRunningScript(filename, hostname, args) 	Get general info about a running script.
getScriptExpGain(script, host, args) 	Get the exp gain of a script.
getScriptIncome(script, host, args) 	Get the income of a script.
getScriptRam(script, host) 	Get the ram cost of a script.
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
getSharePower() 	Share Power has a multiplicative effect on rep/second while doing work for a faction. Share Power increases incrementally for every thread of share running on your server network, but at a sharply decreasing rate.
getTimeSinceLastAug() 	Returns the amount of time in milliseconds that have passed since you last installed Augmentations.
getTotalScriptExpGain() 	Get the exp gain of all scripts.
getTotalScriptIncome() 	Get the income of all scripts.
getWeakenTime(host) 	Get the execution time of a weaken() call.
grow(host, opts) 	Spoof money in a server's bank account, increasing the amount available.
growthAnalyze(host, multiplier, cores) 	Calculate the number of grow threads needed for a given multiplicative growth factor.
growthAnalyzeSecurity(threads, hostname, cores) 	Calculate the security increase for a number of grow threads.
hack(host, opts) 	Steal a server's money.
hackAnalyze(host) 	Get the part of money stolen with a single thread.
hackAnalyzeChance(host) 	Get the chance of successfully hacking a server.
hackAnalyzeSecurity(threads, hostname) 	Get the security increase for a number of threads.
hackAnalyzeThreads(host, hackAmount) 	Calculate the decimal number of threads needed to hack a specified amount of money from a target host.
hasRootAccess(host) 	Check if you have root access on a server.
hasTorRouter() 	Returns whether the player has access to the darkweb.
httpworm(host) 	Runs HTTPWorm.exe on a server.
isRunning(script, host, args) 	Check if a script is running.
kill(pid) 	Terminate the script with the provided PID.
kill(filename, hostname, args) 	Terminate the script(s) with the provided filename, hostname, and script arguments.
killall(host, safetyguard) 	Terminate all scripts on a server.
nuke(host) 	Runs NUKE.exe on a server.
ps(host) 	List running scripts on a server.
purchaseServer(hostname, ram) 	Purchase a server.
relaysmtp(host) 	Runs relaySMTP.exe on a server.
run(script, threadOrOptions, args) 	Start another script on the current server.
scan(host) 	Get the list of servers connected to a server.
scriptKill(script, host) 	Kill all scripts with a filename.
scriptRunning(script, host) 	Check if any script with a filename is running.
serverExists(host) 	Returns a boolean denoting whether or not the specified server exists.
share() 	Share the server's ram with your factions.
spawn(script, threadOrOptions, args) 	Terminate current script and start another in a defined number of milliseconds.
sqlinject(host) 	Runs SQLInject.exe on a server.
upgradePurchasedServer(hostname, ram) 	Upgrade a purchased server's RAM.
weaken(host, opts) 	Reduce a server's security level.
weakenAnalyze(threads, cores) 	Predict the effect of weaken.

NS Attributes
=============

Free
----
  readonly codingcontract: CodingContract;
  readonly go: Go;
  readonly stock: TIX;
  readonly formulas: Formulas;
  readonly infiltration: Infiltration;
  readonly ui: UserInterface;

Expensive
---------
  readonly hacknet: Hacknet; // 4 GB

Spoilers
--------
  readonly bladeburner: Bladeburner;
  readonly gang: Gang;               // SF-2
  readonly sleeve: Sleeve;           // SF-10
  readonly stanek: Stanek;
  readonly corporation: Corporation; // SF -3
  readonly singularity: Singularity;
  readonly grafting: Grafting;


Language Definitions
====================

- Free      : Requires 0GB to use.
- Cheap     : Will theoretically allow running a script in 2.0GB or less.
- Expensive : Any scripts will need more than 2.0GB to run.


File API
========

Dependencies
- getHostname() 	Returns a string with the hostname of the server that the script is running on.

Free
- clear(handle) 	Clear data from a file.
- mv(host, source, destination) 	Move a file on the target server.
- read(filename) 	Read content of a file.
- wget(url, target, host) 	Download a file from the internet.
- write(filename, data, mode) 	Write data to a file.
Cheap
- fileExists(filename, host) 	Check if a file exists.
- ls(host, substring) 	List files on a server.
Expensive
- rm(name, host) 	Delete a file.
- scp(files, destination, source) 	Copy file between servers.


Pipe API
========

Free
- getPortHandle(portNumber) 	Get a handle to a NetScript port
- clearPort(portNumber) 	Clear data from a port.
- nextPortWrite(port) 	Listen for a port write.
- peek(portNumber) 	Get a copy of the data from a port without popping it.
- readPort(portNumber) 	Read data from a port.
- tryWritePort(portNumber, data) 	Attempt to write to a port.
- writePort(portNumber, data) 	Write data to a port.

export interface NetscriptPort {
  write(value: any): any;
  tryWrite(value: any): boolean;
  nextWrite(): Promise<void>;
  read(): any;
  peek(): any;
  full(): boolean;
  empty(): boolean;
  clear(): void;
}

Question: Do the ns functions cause collisions? (Probably.)
Question: Do the NetscriptPort methods cause collisions?
- File stuff?  Yes.
- Pipe stuff?  Yes.
- NetscriptPort? No!

UI Elements
===========

Input
-----
- prompt(txt, options) 	Prompt the player with an input modal.

Output
------
- alert(msg) 	Open up a message box.
- toast(msg, variant, duration) 	Queue a toast (bottom-right notification).

String Formatting
-----------------
- formatNumber(n, fractionalDigits, suffixStart, isInteger) 	Format a number.
- formatPercent(n, fractionalDigits, suffixStart) 	Format a number as a percentage.
- formatRam(n, fractionalDigits) 	Format a number as an amount of ram.
- tFormat(milliseconds, milliPrecision) 	Format time to a readable string.
- sprintf(format, args) 	Format a string.
- vsprintf(format, args) 	Format a string with an array of arguments.
