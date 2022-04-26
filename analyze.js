import {
	getStrategy
} from 'lib.crack.js'


/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	const target = ns.args[0];

	const cmds = (await getStrategy(ns, target, true)).sort(function (a, b) {
		return a.pid - b.pid;
	});

	for (let cmd of cmds) {
		ns.tprint(`run hack-${cmd.cmd}.js -t ${cmd.tread} ${target} ${cmd.delay} ${cmd.pid}; -- ${cmd.time}`)
	}
}