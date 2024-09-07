import { Node, Panel } from "@xyflow/react";
import ReactJson from '@microlink/react-json-view'

export default function NodeInfoPanel(props: any) {

    if (props.node == null) {
        return null;
    }

    return (
        <Panel className="nowheel">
            <div className="nowheel" style={{width: 600, background: 'white', overflow: 'auto'}}>
                <ReactJson src={props.node.data.stepfunctionDefinition} />
            </div>
        </Panel>
    );
}