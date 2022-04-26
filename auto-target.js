import {
	flat_server_map
} from "lib.discovery.js";

import {
	deploy_hack,
	can_deploy
} from "lib.deploy.js";

import {
	eventPorts,
	takeEvent
} from "lib.events.js";


const SLEEP_PERIOD = 1000;

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();

	if (ns.args.length != 2) {
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT TARGET`);
		ns.tprint(`> run ${ns.getScriptName()} bhack.js n00dles`);
		return;
	}

	const targetChanged = true;
	const HACK_SCRIPT = ns.args[0];
	let HACK_TARGET = ns.args[1];
	ns.print(`running '${HACK_SCRIPT}' '${HACK_TARGET}' on all servers`);

	const serverList = flat_server_map(ns).filter((host) => can_deploy(ns, host, HACK_SCRIPT));

	while (true) {
		if (targetChanged) {
			await deploy_hack(ns, serverList, HACK_TARGET, HACK_SCRIPT);
			targetChanged = false;
		}

		const event = takeEvent(ns, eventPorts.NEWTARGET);
		if (event !== false) {
			if (event.event = 'new-target') {
				HACK_TARGET = event.data.target;
				targetChanged = true;
			}
			else {
				await deploy_hack(ns, [event.data.host], HACK_TARGET, HACK_SCRIPT);
				ns.print(`deploying '${HACK_SCRIPT}' '${HACK_TARGET}' on ${event.data.host}`);
			}
		}

		await ns.sleep(SLEEP_PERIOD);
	}
}