/** @param {NS} ns */
export async function main(ns) {
	let mem = 8;
	const maxMem = ns.getPurchasedServerMaxRam()
	const maxServers = ns.getPurchasedServerLimit();
	const currentMoney = ns.getServerMoneyAvailable('home') ;

	while (mem < maxMem) {
		
		const memCost = ns.getPurchasedServerCost(mem);
		const totalCost = maxServers * memCost;
		const canPurchase = currentMoney > totalCost;
		ns.tprint(`Memory ${mem} \t\t ${ns.nFormat(memCost,'0a')} \t ${ns.nFormat(totalCost,'0a')}\t${canPurchase}`)
		mem = mem * 2;
	}
}