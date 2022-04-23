import {
	flat_server_map
} from "lib.discovery.js";

import {
	deploy_hack,
	can_deploy
} from "lib.deploy.js";

import {
	get_high_score
} from "lib.target.js";

const SLEEP_PERIOD = 15 * 1000;

// https://github.com/chrisrabe/bitburner-automation/blob/main/_stable/auto-starter.js

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	if (ns.args.length != 1) {
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT `);
		ns.tprint(`> run ${ns.getScriptName()} bhack.js`);
		return;
	}

	const HACK_SCRIPT = ns.args[0];
	ns.tprint(`Auto Targeting script '${HACK_SCRIPT}' on all servers`);

	let serverCount = 0;
	let targetHost = null;
	let targetScore = null;

	while (true) {
		let serverList = flat_server_map(ns).filter((host) => can_deploy(ns, host, HACK_SCRIPT));
		let bestTarget = get_high_score(ns, serverList, false);

		if (bestTarget.highscore > targetScore || serverCount < serverList.length) {
			targetHost = bestTarget.besthost;
			targetScore = bestTarget.highscore;
			serverCount = serverList.length;

			await deploy_hack(ns, serverList, targetHost, HACK_SCRIPT);
			ns.tprint(`Target Updated! '${targetHost}' on all servers (${serverCount}) with score ${targetScore}`);
		}

		await ns.sleep(SLEEP_PERIOD);
	}
}
