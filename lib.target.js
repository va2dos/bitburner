import {
	canHack,
	canPenetrate,
	crack_server
} from "lib.crack.js";

export const getPotentialTargets = function (ns, serverList) {
	const validServer = serverList.filter(
		server => {
			return canHack(ns, server)
				&& canPenetrate(ns, server)
				&& !server.includes("pserv")
		}
	);

	const servers = [];
	// Prepare the servers to have root access
	for (var target of validServer) {
		crack_server(ns, target);

		const server = getServerInfo(ns, target);
		if (server.maxMoney > 0)
			servers.push(server);
	}

	servers.sort(function (a, b) {
		return b.revYield - a.revYield; // DESC
	});

	return servers;
}

export const getServerInfo = function (ns, hostname) {
	const maxMoney = ns.getServerMaxMoney(hostname);
	const curMoney = ns.getServerMoneyAvailable(hostname);
	const reqHackLevel = ns.getServerRequiredHackingLevel(hostname);
	const security = ns.getServerSecurityLevel(hostname);
	const minSecurity = ns.getServerMinSecurityLevel(hostname);
	const moneyThresh = maxMoney * 0.80;
	const secThresh = minSecurity + 5;
	const reqPorts = ns.getServerNumPortsRequired(hostname);
	const hasRoot = ns.hasRootAccess(hostname);
	const maxRam = ns.getServerMaxRam(hostname);
	const server = ns.getServer(hostname);
	const player = ns.getPlayer();
	const hackChance = ns.formulas.hacking.hackChance(server, player);
	const revYield = maxMoney * hackChance;
	//const strategy = getStrategy(ns, hostname);

	return {
		hostname,
		server,
		maxMoney,
		maxRam,
		curMoney,
		reqHackLevel,
		security,
		minSecurity,
		secThresh,
		moneyThresh,
		reqPorts,
		hasRoot,
		hackChance,
		revYield
	};
}

/* LEGACY SCORE SYSTEM */

export const get_high_score = function (ns, serverList, verbose) { 
	const validServer = serverList.filter(
		server => {
			return canHack(ns, server)
				&& canPenetrate(ns, server)
				&& !server.includes("pserv")
		}
	);

	let highscore = 0;
	let besthost = null;

	for (let target of validServer) {
		crack_server(ns, target);
		const score = get_score(ns, target, verbose);
		if (score > highscore) {
			besthost = target;
			highscore = score;
		}
	}

	return { besthost, highscore };
}

/** @param {NS} ns **/
export function get_score(ns, server, verbose) {
	if (server == "home")
		return 0;

	const srvMoney = ns.getServerMaxMoney(server);
	if (srvMoney < 1)
		return -2;

	// Money per seconds
	const sucessRate = (100 - ns.getServerMinSecurityLevel(server)) / 100;

	const score = (srvMoney * sucessRate);

	if (verbose)
		ns.print(`[${server}] sucessRate:${sucessRate}  moneyEff:${moneyEff} score:${score}`);

	return score;
}