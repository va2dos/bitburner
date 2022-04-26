import {
	flat_server_map
} from "lib.discovery.js";

import {
	canHack,
	canPenetrate,
} from "lib.crack.js";

const getServerInfo = function (ns, hostname) {
	const maxMoney = ns.getServerMaxMoney(hostname);
	const maxRam = ns.getServerMaxRam(hostname);
	const curMoney = ns.getServerMoneyAvailable(hostname);
	const reqHackLevel = ns.getServerRequiredHackingLevel(hostname);
	const security = ns.getServerSecurityLevel(hostname);
	const minSecurity = ns.getServerMinSecurityLevel(hostname);
	const moneyThresh = maxMoney * 0.85;
	const secThresh = minSecurity + 5;
	const moneyPerSec = maxMoney / ns.getHackTime(hostname);
	const hackChance = (100 - ns.getServerMinSecurityLevel(hostname));
	const revYield = maxMoney * (hackChance/100);

	return {
		server : hostname,
		maxMoney,
		maxRam,
		curMoney,
		reqHackLevel,
		security,
		minSecurity,
		secThresh,
		moneyThresh,
		moneyPerSec,
		hackChance,
		revYield
	};
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	const waitTime = 5000;
	const serverList = flat_server_map(ns);

	while (true) {
		ns.clearLog();
		ns.print(`money Thresh \t sec \t luck \t revYield \t server`);

		const validServer = serverList.filter(
			server => {
				return canHack(ns, server)
					&& canPenetrate(ns, server)
					&& !server.includes("pserv")
					&& ns.getServerMaxMoney(server) > 0
			}
		)
	
		const servers = validServer.map((target) => {
			return getServerInfo(ns, target);
		}).sort(function(a,b){
			return (b.revYield) - (a.revYield);
		});

		servers.forEach((serverInfo) => {
			const moneyPerc = Math.floor((serverInfo.moneyThresh == 0 ? 0 : serverInfo.curMoney / serverInfo.moneyThresh)*100);
			const secOffset = Math.floor(serverInfo.security - (serverInfo.secThresh));
			ns.print(`${ns.nFormat(serverInfo.maxMoney,'$0.0a')} (${moneyPerc}%)\t${secOffset}\t ${serverInfo.hackChance}\t${ns.nFormat(serverInfo.revYield,'$0.0a')}\t\t${serverInfo.server}`);
		});

		await ns.sleep(waitTime);
	}
}