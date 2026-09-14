/**
 * Enterprise Workflow Diagram Component
 * Interactive flowchart and process visualization
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { WorkflowDiagram as WorkflowDiagramType, WorkflowNode } from '../../types/process';

export interface WorkflowDiagramProps {
  workflow: WorkflowDiagramType;
  interactive?: boolean;
  className?: string;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  workflow,
  interactive = true,
  className,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeStyle = (node: WorkflowNode) => {
    const baseStyle = {
      padding: '16px',
      borderRadius: '12px',
      minWidth: '180px',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
    };

    const typeStyles = {
      start: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: '2px solid #10b981',
      },
      process: {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: '2px solid #6366f1',
      },
      decision: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        border: '2px solid #f59e0b',
        transform: 'rotate(45deg)',
      },
      end: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        border: '2px solid #ef4444',
      },
      milestone: {
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        border: '2px solid #06b6d4',
      },
    };

    return {
      ...baseStyle,
      ...typeStyles[node.type],
      ...(node.style || {}),
      ...(hoveredNode === node.id ? { transform: 'scale(1.05)', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' } : {}),
      ...(selectedNode === node.id ? { transform: 'scale(1.1)', boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)' } : {}),
    };
  };

  const renderNode = (node: WorkflowNode) => (
    <motion.div
      key={node.id}
      style={getNodeStyle(node)}
      className="absolute text-white font-semibold text-center shadow-lg"
      style={{
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
        ...getNodeStyle(node),
      }}
      onMouseEnter={() => interactive && setHoveredNode(node.id)}
      onMouseLeave={() => interactive && setHoveredNode(null)}
      onClick={() => interactive && setSelectedNode(node.id)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: selectedNode === node.id ? 1.1 : hoveredNode === node.id ? 1.05 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-2">
        {node.icon && <span className="text-2xl">{node.icon}</span>}
        <span className="text-sm">{node.label}</span>
      </div>
    </motion.div>
  );

  const renderConnection = (connection: any) => {
    const fromNode = workflow.nodes.find(n => n.id === connection.from);
    const toNode = workflow.nodes.find(n => n.id === connection.to);

    if (!fromNode || !toNode) return null;

    const x1 = fromNode.position.x;
    const y1 = fromNode.position.y;
    const x2 = toNode.position.x;
    const y2 = toNode.position.y;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
      <g key={connection.id}>
        <motion.path
          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
          stroke="rgba(99, 102, 241, 0.5)"
          strokeWidth="2"
          fill="none"
          strokeDasharray={connection.type === 'dashed' ? '5,5' : connection.type === 'dotted' ? '2,2' : '0'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        {connection.animated && (
          <motion.circle
            r="4"
            fill="#6366f1"
            initial={{ offset: 0 }}
            animate={{ offset: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ offsetPath: `path('M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}')` }}
          />
        )}
        {connection.label && (
          <text
            x={midX}
            y={midY - 10}
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="12"
            textAnchor="middle"
          >
            {connection.label}
          </text>
        )}
      </g>
    );
  };

  const renderFlowchart = () => (
    <div className="relative w-full h-[600px] bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {workflow.connections.map(renderConnection)}
      </svg>
      {workflow.nodes.map(renderNode)}
      
      {selectedNode && (
        <motion.div
          className="absolute bottom-4 left-4 right-4 bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {(() => {
            const node = workflow.nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            return (
              <div>
                <h4 className="text-white font-bold mb-1">{node.label}</h4>
                {node.description && <p className="text-gray-400 text-sm">{node.description}</p>}
                {node.condition && (
                  <span className="inline-block mt-2 px-2 py-1 bg-indigo-500/20 rounded text-indigo-400 text-xs">
                    {node.condition}
                  </span>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );

  const renderPipeline = () => (
    <div className="flex items-center gap-4 overflow-x-auto pb-4">
      {workflow.nodes.map((node, index) => (
        <React.Fragment key={node.id}>
          <motion.div
            className="flex-shrink-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-6 text-center min-w-[200px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {node.icon && <span className="text-3xl mb-2 block">{node.icon}</span>}
            <h4 className="text-white font-semibold mb-1">{node.label}</h4>
            {node.description && <p className="text-gray-400 text-xs">{node.description}</p>}
          </motion.div>
          
          {index < workflow.nodes.length - 1 && (
            <motion.div
              className="flex-shrink-0 text-indigo-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderRoadmap = () => (
    <div className="space-y-6">
      {workflow.nodes.map((node, index) => (
        <motion.div
          key={node.id}
          className="relative pr-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="absolute right-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {index + 1}
          </div>
          <div className="absolute right-5 top-10 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent last:hidden" />
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              {node.icon && <span className="text-2xl">{node.icon}</span>}
              <h4 className="text-white font-bold">{node.label}</h4>
            </div>
            {node.description && <p className="text-gray-400 text-sm">{node.description}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCircular = () => (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {workflow.nodes.map((node, index) => {
          const angle = (index / workflow.nodes.length) * 2 * Math.PI - Math.PI / 2;
          const x = 200 + 150 * Math.cos(angle);
          const y = 200 + 150 * Math.sin(angle);
          
          return (
            <g key={node.id}>
              <motion.circle
                cx={x}
                cy={y}
                r="40"
                fill="url(#gradient)"
                stroke="#6366f1"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10">
                {node.label}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  switch (workflow.type) {
    case 'flowchart':
      return renderFlowchart();
    case 'pipeline':
      return renderPipeline();
    case 'roadmap':
      return renderRoadmap();
    case 'circular':
      return renderCircular();
    default:
      return renderFlowchart();
  }
};
