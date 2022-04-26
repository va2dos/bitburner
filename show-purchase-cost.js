/** @param {NS} ns */
export async function main(ns) {
	let mem = 8;
	const maxMem = ns.getPurchasedServerMaxRam()
	const maxServers = ns.getPurchasedServerLimit();
	const currentMoney = ns.getServerMoneyAvailable('home') ;
	const virusRam = ns.getScriptRam("hack-grow.js");

	while (mem < maxMem) {
		
		const memCost = ns.getPurchasedServerCost(mem);
		const totalCost = maxServers * memCost;
		const canPurchase = currentMoney > totalCost;
		const tread = Math.floor(memCost / virusRam);
		ns.tprint(`Memory ${mem} \t\t ${ns.nFormat(memCost,'0a')} \t ${ns.nFormat(totalCost,'0a')}\t${canPurchase}\t${tread}`)
		mem = mem * 2;
	}
}