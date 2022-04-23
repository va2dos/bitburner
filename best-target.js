import {
	flat_server_map
} from "lib.discovery.js";

import {
	get_high_score
} from "lib.target.js";

/** @param {NS} ns */
export function main(ns) {
	let serverList = flat_server_map(ns);
	let best = get_high_score(ns, serverList, true);
	ns.tprint(`Best Hosts '${best.besthost}'  Score:${best.highscore}`);
}
