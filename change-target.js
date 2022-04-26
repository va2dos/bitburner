import {
	sendEvent,
	eventPorts
} from "lib.events.js";

/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	sendEvent(ns, eventPorts.NEWTARGET, 'new-target', {target});
}