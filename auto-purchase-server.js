import {
	sendEvent,
	eventPorts
} from "lib.events.js";

/**
 * @param {NS} ns 
 * **/
 export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();

	const homeServ = "home";
	var pRam = 8; // purchased ram
	const servPrefix = "pserv-";
	const RESERVE_FACTOR = 0.2; // 20% to Server purchase

	var maxRam = ns.getPurchasedServerMaxRam();
	var maxServers = ns.getPurchasedServerLimit();

	function canPurchaseServer() {
		return (ns.getServerMoneyAvailable(homeServ) * RESERVE_FACTOR) > ns.getPurchasedServerCost(pRam);
	}

	async function upgradeServer(server) {
		var sRam = ns.getServerMaxRam(server);
		if (sRam < pRam) {
			while (!canPurchaseServer()) {
				await ns.sleep(10000); // wait 10s
			}
			ns.killall(server);
			ns.deleteServer(server);
			ns.purchaseServer(server, pRam);
			sendEvent(ns, eventPorts.NEWTARGET, 'new-upgrade', {host : server});
		}
	}

	async function purchaseServer(server) {
		while (!canPurchaseServer()) {
			await ns.sleep(10000); // wait 10s
		}
		ns.purchaseServer(server, pRam);
		sendEvent(ns, eventPorts.NEWTARGET, 'new-purchase', {host : server});
	}

	async function autoUpgradeServers() {
		var i = 0;
		while (i < maxServers) {
			const cost = ns.getPurchasedServerCost(pRam);
			var server = servPrefix + i;
			if (ns.serverExists(server)) {
				ns.print(`Upgrading server ${server} to ${pRam} GB @ ${ns.nFormat(cost,'$0.0a')}`);
				await upgradeServer(server);
				++i;
			} else {
				ns.print(`Purchasing server ${server} to ${pRam} GB @ ${ns.nFormat(cost,'$0.0a')}`);
				await purchaseServer(server, pRam);
				++i;
			}
		}
	}

	// await autoUpgradeServers();
	while (true) {
		await autoUpgradeServers();
		ns.tprintf("SUCCESS Upgraded all servers to " + pRam + "GB");
		if (pRam === maxRam) {
			break;
		}
		// move up to next tier
		var newRam = pRam * 2;
		if (newRam > maxRam) {
			pRam = maxRam;
		} else {
			pRam = newRam;
		}
	}
	
}