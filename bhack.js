/** @param {NS} ns */
export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hostname = args._[0];
	const minSrvLevel = ns.getServerMinSecurityLevel(hostname) + 5;
    const maxSrvMoney = ns.getServerMaxMoney(hostname) * 0.85;
    //ns.tprint(`[${hostname}] ServerMinSecurityLevel: ${minSrvLevel}, ServerMaxMoney: ${maxSrvMoney}`);

    while (true) {
        let curSrvSecurityLevel = ns.getServerSecurityLevel(hostname);
        let curSrvMoneyAvailable = ns.getServerMoneyAvailable(hostname);

        if (curSrvSecurityLevel > minSrvLevel) {
            // ns.tprint(`[${hostname}] CurrentSecurityLevel: ${curSrvSecurityLevel}, run weaken`);
            await ns.weaken(hostname);
        } else if (curSrvMoneyAvailable < maxSrvMoney) {
            // ns.tprint(`[${hostname}] CurrentMoneyAvailable: ${curSrvMoneyAvailable}, run grow`);
            await ns.grow(hostname);
        } else {
            await ns.hack(hostname);
        }
    }
}