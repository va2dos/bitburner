import {
	sendEvent,
	eventPorts
} from "lib.events.js";

import {
	flat_server_map
} from "lib.discovery.js";

import {
	canHack,
	canPenetrate,
	crack_server
} from "lib.crack.js";

const SLEEP_PERIOD = 15 * 1000;

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();
	ns.print(`Awaiting for new unrooted targets...`);

	while (true) {
		const validServer = flat_server_map(ns).filter(
			server => {
				return canHack(ns, server)
					&& canPenetrate(ns, server)
					&& !server.includes("pserv")
			}
		);

		for (var target of validServer) {
			const cracked = crack_server(ns, target);
			if (cracked) {
				ns.print(`[${target}] now Rooted!`);
				sendEvent(ns, eventPorts.NEWTARGET, 'new-root', {host : target});
			}
		}

		await ns.sleep(SLEEP_PERIOD);
	}
}