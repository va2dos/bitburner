export const eventPorts = {
	NEWTARGET : 11
}

/** @param {NS} ns */
export const sendEvent = function(ns, port, event, data) {
	const handler = ns.getPortHandle(port);

	if (handler.full()) {
		ns.print("ERROR\tUnable to push data. Port is full!");
		return;
	}

	const dataStr = JSON.stringify({
		event,
		data
	});

	handler.write(dataStr);
}

/** @param {NS} ns */
export const takeEvent = function(ns, port) {
	const portHandle = ns.getPortHandle(port);
	if (!portHandle.empty()) {
		const msg = portHandle.read();
		const data = JSON.parse(msg);
		return data;
	}
	return false;
}