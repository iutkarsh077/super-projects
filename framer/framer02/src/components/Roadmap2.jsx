import React from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

const nodes = [
  {
    id: "1",
    data: { label: "Learn HTML" },
    position: { x: 0, y: 0 }
  },
  {
    id: "2",
    data: { label: "Learn CSS" },
    position: { x: 200, y: 0 }
  },
  {
    id: "3",
    data: { label: "Learn JavaScript" },
    position: { x: 400, y: 0 }
  }
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" }
];

export default function Roadmap() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
      />
    </div>
  );
}