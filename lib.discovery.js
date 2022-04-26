/** @param {NS} ns **/
export const server_map = async function (ns) {

	/** @param {NS} ns **/
	function discover(ns, node, nodeMap) {
		node.adjacents.forEach(nodeName => {
			if (nodeMap.has(nodeName)) {
				return;
			}
			let newNode = {};
			newNode.name = nodeName;
			newNode.parent = node;
			newNode.adjacents = ns.scan(newNode.name); -[]
			nodeMap.set(newNode.name, newNode);
			discover(ns, newNode, nodeMap);
		});
	}

	let home = {};
	let nodeMap = new Map();
	home.name = ns.getHostname();
	home.parent = null;
	home.adjacents = ns.scan(home.name); -[]
	nodeMap.set(home.name, home);
	discover(ns, home, nodeMap);
	// printMap(ns, home, nodeMap, "");
	return { home, nodeMap };
};

export const flat_server_map = function (ns) {
	//ns.print("Retrieving all nodes in the network");
	var visited = {};
	var stack = [];
	var origin = ns.getHostname();
	stack.push(origin);

	while (stack.length > 0) {
		var node = stack.pop();
		if (!visited[node]) {
			visited[node] = node;
			var neighbours = ns.scan(node);
			for (var i = 0; i < neighbours.length; i++) {
				var child = neighbours[i];
				if (visited[child]) {
					continue;
				}
				stack.push(child);
			}
		}
	}
	const hosts = Object.keys(visited);
	// const hostCount = hosts.length;
	//ns.print(`${hostCount} nodes in the network`);
	return hosts;
}