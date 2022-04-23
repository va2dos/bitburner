/** @param {NS} ns */
export async function main(ns) {
	let ram = 8;
	let i = 24;

	let cc = ns.getServerMoneyAvailable("home");
	let serverCost = ns.getPurchasedServerCost(ram);
	ns.tprint(`Next server cost: ${serverCost} : ${cc}`);

	while (i <= ns.getPurchasedServerLimit()) {
		if (cc > serverCost) {
			ns.tprint(`PurchaseServer: ${i}, Ram: ${ram} > "pserv-${i}"`);
			var hostname = ns.purchaseServer("pserv-" + i, ram);
			await ns.scp("bhack-sigma.js", hostname);
			ns.exec("bhack-sigma.js", hostname, 3);
			++i;
			serverCost = ns.getPurchasedServerCost(ram);
		    cc = ns.getServerMoneyAvailable("home");
			ns.tprint(`Next server cost: ${serverCost} : ${cc}`);
		}

		await ns.sleep(1000);
		cc = ns.getServerMoneyAvailable("home");
	}
}