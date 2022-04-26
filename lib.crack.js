import { formatNumberShort, formatDuration, formatMoney, } from 'lib.helpers.js'

const HOME_SERVER = "home";

/** @param {NS} ns **/
export const get_crack_list = function (ns) {
	return {
		"BruteSSH.exe": ns.brutessh,
		"FTPCrack.exe": ns.ftpcrack,
		"relaySMTP.exe": ns.relaysmtp,
		"HTTPWorm.exe": ns.httpworm,
		"SQLInject.exe": ns.sqlinject
	};
}

export const get_num_cracks = function (ns) {
	return Object.keys(get_crack_list(ns)).filter(function (file) {
		return ns.fileExists(file, HOME_SERVER)
	}).length;
};

export const getThresholds = function (ns, server) {
	let moneyThresh = ns.getServerMaxMoney(server) * 0.80;
	let secThresh = ns.getServerMinSecurityLevel(server) + 5;
	return {
		moneyThresh,
		secThresh
	}
}

export const canHack = function (ns, server) {
	let pHackLvl = ns.getHackingLevel(); // player
	let sHackLvl = ns.getServerRequiredHackingLevel(server);
	return pHackLvl >= sHackLvl;
}

export const canPenetrate = function (ns, server) {
	let numCracks = get_num_cracks(ns);
	let reqPorts = ns.getServerNumPortsRequired(server);
	return numCracks >= reqPorts;
}

/** @param {NS} ns **/
export const hasRam = function (ns, server, scriptRam, useMax = false) {
	let maxRam = ns.getServerMaxRam(server);
	let usedRam = ns.getServerUsedRam(server);
	let ramAvail = useMax ? maxRam : maxRam - usedRam;
	return ramAvail > scriptRam;
}

export const can_hack = function (ns, server, virusRam) {
	const ramAvail = ns.getServerMaxRam(server);
	//ns.tprint(`ramAvail ${ramAvail}  reqPorts ${reqPorts}  numCracks ${numCracks}  server ${server}`);
	return canHack(ns, server) && canPenetrate(ns, server) && ramAvail > virusRam;
};

export const crack_server = function (ns, server) {
	if (ns.hasRootAccess(server))
		return false;

	const CRACK_LIST = get_crack_list(ns);
	for (let file of Object.keys(CRACK_LIST)) {
		if (ns.fileExists(file, HOME_SERVER)) {
			let runScript = CRACK_LIST[file];
			runScript(server);
		}
	}

	ns.nuke(server);
	return true;
};

export const getStrategy = function (ns, target, debug = false) {
	const moneyBuffer = 0.80;
	const secBuffer = 5;

	const moneyMax = ns.getServerMaxMoney(target);
	const secMin = ns.getServerMinSecurityLevel(target);
	const secLevel = ns.getServerSecurityLevel(target);

	const player = ns.getPlayer();
	const server = ns.getServer(target);
	const curMoney = ns.getServerMoneyAvailable(target) > 0 ? ns.getServerMoneyAvailable(target) : 1;

	// Grow Calculaiton : grow() increases the amount of money
	const gTime = ns.formulas.hacking.growTime(server, player);
	const growMul = moneyMax / curMoney;
	const growThreads = Math.round(ns.growthAnalyze(target, growMul < 1 ? 1 : growMul));
	const secIncraseGrow100 = ns.growthAnalyzeSecurity(growThreads);

	// Weaken calculation : Keep security level low
	const wTime = ns.formulas.hacking.weakenTime(server, player);
	const weakenEffect = ns.weakenAnalyze(1);
	const secDept = secLevel - secMin;
	const weekenDeptThreads = Math.ceil(secDept / weakenEffect);

	const weekenGrowEffect = (secIncraseGrow100 + secDept);
	const weakenThreads = Math.ceil(weekenGrowEffect / weakenEffect);

	// Hack calculation : Steel money, but not to much!
	const hTime = ns.formulas.hacking.hackTime(server, player);
	const hackEffect = ns.hackAnalyze(target);
	const hackThreads = Math.round(moneyBuffer / hackEffect);
	const secIncrease = ns.hackAnalyzeSecurity(hackThreads);

	const weakenThreads2 = Math.ceil(secIncrease / weakenEffect);

	const longestTime = Math.ceil(Math.max(wTime, hTime, gTime));
	const lag = 100;
	const delay = [
		Math.ceil(longestTime - gTime),
		Math.ceil(longestTime - wTime + lag),
		Math.ceil(longestTime - hTime + (lag * 2)),
		Math.ceil(longestTime - wTime + (lag * 3)),
	];

	if (debug) {
		ns.tprint(`Money\tCurrent: ${curMoney} \t Max:${moneyMax}`);
		ns.tprint(`Security\t Current: ${secLevel}\t Min: ${secMin}`);
		const gain = moneyBuffer * moneyMax;
		const gainPerSeconds = (gain / (longestTime + (lag * 3)) * 1000);
		ns.tprint(`Gain : ${formatMoney(gain)} @ ${formatMoney(gainPerSeconds)}/s\n`);
		ns.tprint(`Grow: T:${growThreads} +sec:${secIncraseGrow100} @ ${formatDuration(gTime)}`);
		ns.tprint(`Weakken T: ${weakenThreads} -sec:${formatNumberShort(weekenGrowEffect)} @ ${formatDuration(wTime)}`);
		ns.tprint(`Hack T:${hackThreads} \t${formatNumberShort(hackEffect)} \t +sec:${secIncrease} @ ${formatDuration(hTime)}`);
		ns.tprint(`Weakken T: ${weakenThreads2} -sec:${formatNumberShort(secIncrease)} \n\n`);
	}

	if (secDept >= secBuffer) {
		return [{ cmd: 'w', tread: weekenDeptThreads, delay: 0, pid: 0, time: wTime }];
	}

	return [
		{ cmd: 'g', tread: growThreads, delay: delay[0], pid: 0, time: longestTime },
		{ cmd: 'w', tread: weakenThreads, delay: delay[1], pid: 1, time: (longestTime+ lag) },
		{ cmd: 'h', tread: hackThreads, delay: delay[2], pid: 2, time: (longestTime+ (lag * 2)) },
		{ cmd: 'w', tread: weakenThreads2, delay: delay[3], pid: 3, time: (longestTime+ (lag * 3)) }
	];
}