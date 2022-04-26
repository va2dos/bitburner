/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	const delay = ns.args[1];
	const pid = ns.args[2];

	ns.print(pid);
	await ns.sleep(delay);
	await ns.weaken(target);
	//await ns.grow(target);
	//await ns.hack(target);
}