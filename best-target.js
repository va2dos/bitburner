import {
	flat_server_map
} from "lib.discovery.js";

import {
	getPotentialTargets
} from "lib.target.js";

/** @param {NS} ns */
export function main(ns) {
	const serverList = flat_server_map(ns);
	const bests = getPotentialTargets(ns, serverList);
	const node = JSON.stringify(bests[0]);
	ns.tprint(`** ${bests[0].server.hostname} **`);
	ns.tprint(`${node}'\n`);
}