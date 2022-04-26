import {
	flat_server_map
} from "lib.discovery.js";

import {
	canPenetrate,
	crack_server,
	hasRam,
	getStrategy
} from "lib.crack.js";

import {
	getPotentialTargets
} from "lib.target.js";

import {
	eventPorts,
	takeEvent
} from "lib.events.js";

const HOME_SERVER = "home"; // ns.getHostname();
const SIMULATION = false;
const activeSwarms = {};
const virus = ["hack-grow.js", "hack-weaken.js", "hack-hack.js"];
const actions = {
	g: 0,
	w: 1,
	h: 2
}

function getZombies(ns, serverList, virusRam, useMaxRam = false) {
	var zombies = serverList.filter(zombi => {
		if (zombi === HOME_SERVER) {
			return false;
		}
		return (canPenetrate(ns, zombi) && hasRam(ns, zombi, virusRam, useMaxRam));
	});

	return zombies;
}

async function prepareZombie(ns, zombies, virus) {
	for (let zombi of zombies) {
		// Prepare the servers
		crack_server(ns, zombi);
		await ns.scp(virus[0], zombi);
		await ns.scp(virus[1], zombi);
		await ns.scp(virus[2], zombi);
	}
}

const distributeThreadOnZombies = function (ns, strategy, zombies, virusRam, targetHost) {
	const seq = strategy;

	// allocates tasks to servers with the largest ram first
	const sortedZombies = Object.keys(zombies).sort((a, b) => zombies[b] - zombies[a]);
	const swarms = [];
	let maxExecTime = 0;

	for (let i = 0; i < seq.length; i++) {
		// seq : { cmd: 'g', tread: growThreads, delay: delay[0], pid: 0 }
		const sym = seq[i].cmd;
		const maxThreads = seq[i].tread;
		const delay = seq[i].delay;
		const pid = seq[i].pid;
		const execTime = seq[i].time;
		const swarm = {
			id: (sym + Date.now()),
			action: sym,
			zombies: [],
			targetHost
		}

		let usedThreads = 0;
		for (let serv of sortedZombies) {
			if (usedThreads >= maxThreads) {
				continue;
			}

			const zombiThreadCapacity = zombies[serv];
			if (zombiThreadCapacity <= 1) {
				continue;
			}

			const newUsedThreads = usedThreads + zombiThreadCapacity;

			let threads = zombiThreadCapacity;
			if (newUsedThreads > maxThreads) {
				threads = maxThreads - usedThreads; // only use subset
			}

			usedThreads += threads;

			zombies[serv] -= threads;
			swarm.zombies.push({
				serv,
				threads,
				delay,
				pid,
				zombiFull: zombies[serv] <= 1
			});
		}
		if (usedThreads > 0) {
			swarms.push(swarm);
			if (maxExecTime < execTime)
				maxExecTime = execTime;
		}
	}
	return { swarms, maxExecTime };
}


function getNextTargets(ns, serverList) {
	const now = Date.now();
	//Force Zombies with Thread left (,false)
	const targets = getPotentialTargets(ns, serverList, false);
	const next = targets.find((x) => {
		// Unused target or target w/o zombie in march
		return activeSwarms[x.hostname] == undefined || activeSwarms[x.hostname] < now;
	});
	// ns.print(`getNextTargets: ${next.hostname}`);
	return next;
}

function setTargetSwarmed(ns, targetHost, maxExecTime) {
	// ns.print(`setTargetSwarmed: ${targetHost} ${maxExecTime}`);
	activeSwarms[targetHost] = maxExecTime + Date.now();
}

async function dispatchZombie(ns, targetHost, zombies, virusRam) {
	const strategy = getStrategy(ns, targetHost);
	if(SIMULATION) ns.print('\n' + JSON.stringify(strategy) + '\n');
	const { swarms, maxExecTime } = distributeThreadOnZombies(ns, strategy, zombies, virusRam, targetHost);

	ns.print(`Launching Swarm of zombies on [${targetHost}]`);
	for (let swarm of swarms) {
		const action = swarm.action;
		const virusScript = virus[actions[action]];
		if (swarm.zombies.length > 0) {
			for (let zombi of swarm.zombies) {
				ns.print(`ns.exec(${virusScript}, ${zombi.serv}, ${zombi.threads}, ${targetHost}, ${zombi.delay}, ${zombi.pid});`)

				if (!SIMULATION) {
					while (ns.exec(virusScript, zombi.serv, zombi.threads, targetHost, zombi.delay, zombi.pid) == 0) {
						//await for the PID to be successfuly created
						await ns.sleep(5);
					};
				}
			}
			setTargetSwarmed(ns, targetHost, maxExecTime);
		}
	}
}

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();
	ns.tail("auto-zombi-v2.js");

	const SLEEP_PERIOD = 1000;
	const virusRam = ns.getScriptRam(virus[0]);
	const serverList = flat_server_map(ns);
	const potentialZombies = getZombies(ns, serverList, virusRam, true);
	await prepareZombie(ns, potentialZombies, virus)

	while (true) {
		const event = takeEvent(ns, eventPorts.NEWTARGET);
		if (event !== false) {
			await prepareZombie(ns, [event.data.host], virus)
		}

		const zombies = {};
		for (let zombi of (getZombies(ns, serverList, virusRam, false))) {
			const freeRam = ns.getServerMaxRam(zombi) - ns.getServerUsedRam(zombi);
			if (freeRam > (virusRam * 3))
				zombies[zombi] = Math.floor(freeRam / virusRam);
		}

		const nbrZombies = Object.keys(zombies).length;
		if(SIMULATION) ns.print(`zombies founds : ${nbrZombies} with Ram left`);
		if (nbrZombies > 1) {
			const target = getNextTargets(ns, serverList);
			if (target !== undefined) {
				ns.print(`zombies targetting : ${target.hostname}`);
				await dispatchZombie(ns, target.hostname, zombies, virusRam);
			}
			else {
				if(SIMULATION) ns.print(`no target left`);
			}
		}

		await ns.sleep(SLEEP_PERIOD);
	}
}