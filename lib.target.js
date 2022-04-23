import {
	can_hack
} from "lib.crack.js";


/** @param {NS} ns **/
export const get_high_score = function (ns, serverList, verbose) {
	const validServer = serverList.filter((x) => ns.hasRootAccess(x));
	const nbrCores = validServer.length;
	let nbrThreads = 0;
	validServer.forEach(function (x) {
		nbrThreads += ns.getServerMaxRam(x)
	});

	if (verbose)
		ns.tprint(`nbrThreads:${nbrThreads}  nbrCores:${nbrCores}`);

	let highscore = 0;
	let besthost = null;

	for (var i = 0; i < serverList.length; i++) {
		const node = serverList[i];
		const c = get_score(ns, node, verbose, nbrCores, nbrThreads);
		if (c > highscore) {
			besthost = node;
			highscore = c;
		}
	}

	return { besthost, highscore };
}

/** @param {NS} ns **/
export function get_score(ns, server, verbose, nbrCores, nbrThreads) {
	if (server == "home")
		return 0;

	const isRoot = ns.hasRootAccess(server);
	if (!isRoot && !can_hack(ns, server, 1000)) {
		return -1;
	}

	const float_skill_hack = ns.getHackingLevel();
	const reqHack = ns.getServerRequiredHackingLevel(server);
	if (float_skill_hack < reqHack)
		return -1;

	const srvMoney = ns.getServerMaxMoney(server);
	if (srvMoney < 1)
		return -2;

	// v1
	if (false) {
		const secLevel = ns.getServerMinSecurityLevel(server);
		const srvMoney = ns.getServerMaxMoney(server);
		const srvGrowth = ns.getServerGrowth(server);
		const srvDifficutly = (float_skill_hack - reqHack) / float_skill_hack;
		const scores = [srvMoney, srvGrowth, srvDifficutly];
		const n = scores.length;
		const mean = scores.reduce((a, b) => a + b) / n;
		const dev = Math.sqrt(scores.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n) * (secLevel / 100);

		if (verbose)
			ns.tprint(`Server '${server}'  srvMoney:${srvMoney}  srvGrowth:${srvGrowth}  srvDifficutly:${srvDifficutly}  score:${dev}`);
		return dev;
	}

	//Calculate Growth Efficiency.
	const srvGrowthTime = ns.getGrowTime(server);
	const srvGrowthEff = ns.growthAnalyze(server, (srvMoney / 20), nbrCores) / srvGrowthTime;

	//Calculate Security Efficiency.
	const srvWeakenTime = ns.getWeakenTime(server);
	const srvSecEff = ns.growthAnalyzeSecurity(nbrThreads, server, nbrCores) / srvWeakenTime;

	//Hack Efficiency rate
	const moneyEff = srvMoney / ns.getHackTime(server);
	const sucessRate = (100 - ns.getServerMinSecurityLevel(server));

	const score = (srvGrowthEff * srvSecEff * sucessRate * moneyEff);

	if (verbose)
		ns.tprint(`[${server}] srvGrowthEff:${srvGrowthEff}  srvSecEff:${srvSecEff}  sucessRate:${sucessRate}  srvMoney:${srvMoney}  score:${score}`);

	return score;
}