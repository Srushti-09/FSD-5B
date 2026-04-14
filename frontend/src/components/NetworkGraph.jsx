import React, { useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

const NetworkGraph = ({ users }) => {
  const fgRef = useRef();

  // Generate graph data from users
  const graphData = {
    nodes: [],
    links: []
  };

  // Add the central "Server/Database" node
  graphData.nodes.push({
    id: 'db-core',
    name: 'MongoDB Cluster',
    val: 50,
    color: '#00f3ff'
  });

  users.forEach((user, i) => {
    // Add user nodes
    graphData.nodes.push({
      id: user.userId || `u-${i}`,
      name: user.name,
      val: 20,
      color: '#9d00ff'
    });

    // Link user to DB
    graphData.links.push({
      source: user.userId || `u-${i}`,
      target: 'db-core',
      color: 'rgba(0, 243, 255, 0.3)'
    });

    // If they have hobbies, create hobby nodes and link them
    if (user.hobbies && user.hobbies.length > 0) {
      user.hobbies.forEach(hobby => {
        const hobbyNodeId = `hobby-${hobby}`;
        if (!graphData.nodes.find(n => n.id === hobbyNodeId)) {
          graphData.nodes.push({
            id: hobbyNodeId,
            name: hobby,
            val: 10,
            color: '#0055ff'
          });
        }
        graphData.links.push({
          source: user.userId || `u-${i}`,
          target: hobbyNodeId,
          color: 'rgba(157, 0, 255, 0.3)'
        });
      });
    }
  });

  useEffect(() => {
    // Add rotation to the camera
    let angle = 0;
    const interval = setInterval(() => {
      if (fgRef.current) {
        fgRef.current.cameraPosition({
          x: 200 * Math.sin(angle),
          z: 200 * Math.cos(angle)
        });
        angle += Math.PI / 600;
      }
    }, 10);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', cursor: 'crosshair' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        linkColor="color"
        nodeRelSize={1}
        nodeResolution={16}
        linkWidth={1.5}
        backgroundColor="#00000000" // transparent to let index.css through
        enableNodeDrag={true}
        nodeThreeObject={node => {
          // Custom glowing nodes
          const material = new THREE.MeshLambertMaterial({
            color: node.color,
            transparent: true,
            opacity: 0.8,
            emissive: node.color,
            emissiveIntensity: 0.8
          });
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(Math.cbrt(node.val) * 2, 16, 16),
            material
          );
          return sphere;
        }}
      />
    </div>
  );
};

export default NetworkGraph;
