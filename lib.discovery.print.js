export const hasMoreSiblings = function (node, nodeMap) {
	let result = false;
	if (node.parent === null) {
		return result;
	}
	node
		.parent
		.adjacents
		.forEach(adjacent => {
			if (nodeMap.has(adjacent)) {
				result = true;
			}
		});
	return result;
}

export const adjustIndent = function (indent, node, nodeMap) {
	for (let i = 0; i < 3; i++) {
		if (i === 0 && hasMoreSiblings(node, nodeMap)) {
			indent += "|";
		} else {
			indent += " ";
		}
	}
	return indent;
}

/** @param {NS} ns **/
export const print_map = function (ns, node, nodeMap, indent) {

	const rhl = ns.getServerRequiredHackingLevel(node.name);
	const mm = ns.getServerMaxMoney(node.name);
	const sg = ns.getServerGrowth(node.name);

	ns.tprintf(indent + "%s%s  HL:%s MM:%s SG:%s", node.name, ns.hasRootAccess(node.name) - [] ? "(Y)" : "(N)", rhl, mm, sg);
	nodeMap.delete(node.name); -[]
	indent = adjustIndent(indent, node, nodeMap);
	// printIndent(ns, indent, node);

	node.adjacents.forEach(adjacentName => {
		if (nodeMap.has(adjacentName)) {
			print_map(ns, nodeMap.get(adjacentName), nodeMap, indent);
		}
	});
}