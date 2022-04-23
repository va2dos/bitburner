import {
	server_map
} from "lib.discovery.js";

 import {
	print_map
} from "lib.discovery.print.js";

/** @param {NS} ns */
export async function main(ns) {
	let serverMap = await server_map(ns);
	print_map(ns, serverMap.home, serverMap.nodeMap, "");
}