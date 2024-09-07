import { Edge, Node, Position } from "@xyflow/react";

function getNodesConnectedToId(nodeId: string, edges: Edge[]): string[] {
    const connectedNodes: string[] = [];
    edges.forEach(edge => {
        if (edge.target === nodeId) {
            connectedNodes.push(edge.source);
        }
    });
    return connectedNodes;
}

function constructEdge(source: string, target: string, zIndex: number, type: string = 'step', ): Edge {
    return {
        id: `${source}-${type}-${target}`,
        source,
        target,
        data: { type: type},
        type: 'step',
        zIndex: zIndex
    };
}

export default function convertStepFunctionToReactFlow(stepFunction: any, positionsMap: Map<string, any>, zIndex: number=0, parent?: Node): { nodes: Node[], edges: Edge[] } {
    const nodes: Array<Node> = [];
    const edges: Array<Edge> = [];

    // Iterate through each state in the step function
    for (const stateName in stepFunction.States) {
        const state = stepFunction.States[stateName];

        // Create a node for the state
        const node: Node = {
            id: stateName,
            data: {
                label: stateName,
                stateType: state.Type,
                type: 'step',
                stepfunctionDefinition: state
            },
            position: { x: 0, y: 0 }, // Set the initial position of the node,
            zIndex: zIndex
        };

        // Check if the node has a saved position
        // And set the position, width, and height of the node
        if (positionsMap.has(stateName)) {
            const savedNode = positionsMap.get(stateName);
            node.position = savedNode.position;
            node.width = savedNode.width;
            node.height = savedNode.height;
        }

        if (parent) {
            node.parentId = parent.id;
            node.extent = 'parent';
            node.expandParent = true;
        }

        nodes.push(node);

        if (state.Catch) {
            // Create an edge from the current node to the catch state
            for (let i = 0; i < state.Catch.length; i++) {
                const edge = constructEdge(stateName, state.Catch[i].Next, zIndex, 'catch');
                edges.push(edge);
            }
        }

        // Check the type of the state
        switch (state.Type) {
            case 'Task':
            case 'Pass':
                // Create an edge from the current node to the next state
                edges.push(constructEdge(stateName, state.Next, zIndex, 'step'));
                break;
            case 'Choice':
                // Handle Choice state
                for (let i = 0; i < state.Choices.length; i++) {
                    edges.push(constructEdge(stateName, state.Choices[i].Next, zIndex, 'choice'));
                }
                edges.push(constructEdge(stateName, state.Default, zIndex, 'default'));
                break;
            case 'Parallel':
                // Handle Parallel state
                if (state.Branches && state.Branches.length > 0) {
                    // Iterate through each branch
                    for (let i = 0; i < state.Branches.length; i++) {
                        const branch = state.Branches[i];

                        //node.type = 'group';
                        node.resizing = true;

                        // Create edges and connect nodes within the branch
                        const branchNodes = convertStepFunctionToReactFlow(branch, positionsMap, zIndex + 1, node);
                        nodes.push(...branchNodes.nodes);
                        edges.push(...branchNodes.edges);

                        // Create an edge from the last node in the branch to the next state
                        //const lastNode = branchNodes.nodes[branchNodes.nodes.length - 1];
                        edges.push(constructEdge(node.id, state.Next, zIndex, 'step'));
                    }
                }
                break;
            case 'Map':
                // Handle Map state
                // Add logic to create edges and connect nodes based on Iterator and Next fields
                break;
            // Add logic to handle other state types (e.g., Succeed, Fail, Wait, etc.)
        }
    }

    return { nodes, edges };
}
