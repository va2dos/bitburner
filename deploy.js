import {
	flat_server_map
} from "lib.discovery.js";

import {
	deploy_hack
} from "lib.deploy.js";


/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length < 2) {
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT TARGET `);
		ns.tprint(`> run ${ns.getScriptName()} bhack.js n00dles`);
		return;
	}

	const HACK_SCRIPT = ns.args[0];
	const HACK_TARGET = ns.args[1];
	ns.tprint(`Updating script '${HACK_SCRIPT}' on all servers to target: ${HACK_TARGET}`);

	let serverList = flat_server_map(ns);
	await deploy_hack(ns, serverList, HACK_TARGET, HACK_SCRIPT);
}
