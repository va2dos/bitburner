const HOME_SERVER = "home";

/** @param {NS} ns **/
export const get_crack_list = function (ns) {
	return {
		"BruteSSH.exe": ns.brutessh,
		"FTPCrack.exe": ns.ftpcrack,
		"relaySMTP.exe": ns.relaysmtp,
		"HTTPWorm.exe": ns.httpworm,
		"SQLInject.exe": ns.sqlinject
	};
}

export const get_num_cracks = function (ns) {
	return Object.keys(get_crack_list(ns)).filter(function (file) {
		return ns.fileExists(file, HOME_SERVER)
	}).length;
};

export const can_hack = function (ns, server, virusRam) {
	var numCracks = get_num_cracks(ns);
	var reqPorts = ns.getServerNumPortsRequired(server);
	var ramAvail = ns.getServerMaxRam(server);
	//ns.tprint(`ramAvail ${ramAvail}  reqPorts ${reqPorts}  numCracks ${numCracks}  server ${server}`);
	return numCracks >= reqPorts && ramAvail > virusRam;
};

export const crack_server = function (ns, server) {
	const CRACK_LIST = get_crack_list(ns);
	ns.print(`Cracking server ${server}`)
	for (var file of Object.keys(CRACK_LIST)) {
		if (ns.fileExists(file, HOME_SERVER)) {
			var runScript = CRACK_LIST[file];
			runScript(server);
		}
	}
};