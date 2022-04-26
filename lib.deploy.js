import {
	can_hack
} from "lib.crack.js";

/** @param {NS} ns **/
export const deploy_hack = async function (ns, serverList, target, virus) {
	for (var i = 0; i < serverList.length; i++) {
		const node = serverList[i];
		await copy_and_run_script(ns, node, target, virus)
	}
}

export const can_deploy = function (ns, server, virus) {
	if (server == "home")
		return false;

	const isRoot = ns.hasRootAccess(server);
	const virusRam = ns.getScriptRam(virus);
	if (!isRoot && !can_hack(ns, server, virusRam)) {
		// ns.tprint(`Requirements not meet for ${server}`);
		return false;
	}

	return true;
}

/** @param {NS} ns **/
export const copy_and_run_script = async function (ns, server, target, virus) {
	if (!can_deploy(ns, server, virus))
		return -1;

	const virusRam = ns.getScriptRam(virus);
	const threads = Math.floor(ns.getServerMaxRam(server) / virusRam);

	if(threads < 1) {
		ns.tprint(`ERROR Trying to launching script '${virus}' on server '${server}' with ${threads} threads! on ${target}`);
		return -1;
	}

	ns.print(`Launching script '${virus}' on server '${server}' with ${threads} threads and the following arguments: ${target}`);

	await ns.scp(virus, ns.getHostname(), server);

	if (ns.scriptRunning(virus, server)) {
		ns.scriptKill(virus, server);
	}

	ns.exec(virus, server, threads, target);
}