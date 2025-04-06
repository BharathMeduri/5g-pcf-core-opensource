
import React, { useEffect, useRef, useState } from "react";
import { NetworkLink, NetworkNode, NetworkTopology as NetworkTopologyType } from "@/utils/pcfTypes";
import CustomCard from "@/components/ui/CustomCard";
import { AlertCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NetworkTopologyProps {
  topology: NetworkTopologyType;
}

const NetworkTopology: React.FC<NetworkTopologyProps> = ({ topology }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState("0 0 800 500");
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Function to get node color based on type and status
  const getNodeColor = (node: NetworkNode) => {
    if (node.status === "inactive") return "#9e9e9e";
    if (node.status === "degraded") return "#ff9900";
    if (node.status === "failed") return "#e53935";
    
    // Active node - return color based on type
    switch (node.type) {
      case "PCF": return "#4e2a84";
      case "AMF": return "#4285f4";
      case "SMF": return "#34a853";
      case "UPF": return "#fbbc05";
      case "UDR": return "#795548";
      case "NEF": return "#ea4335";
      case "NWDAF": return "#9c27b0";
      default: return "#0056b3";
    }
  };

  // Function to get link color and style based on status
  const getLinkStyle = (link: NetworkLink) => {
    if (link.status === "inactive") {
      return {
        stroke: "#9e9e9e",
        strokeDasharray: "5,5",
        className: "network-link"
      };
    }
    return {
      stroke: "#0056b3",
      strokeDasharray: "none",
      className: "network-link active"
    };
  };

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        const height = width * 0.625; // 5:8 aspect ratio
        setDimensions({ width, height });
        setViewBox(`0 0 800 500`);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <CustomCard 
        title="Network Topology" 
        description="5G Core Network Function Interactions"
        headerExtra={
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">This diagram shows the network topology based on 3GPP Release 16 specifications. Click on a network function to see its details.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        }
      >
        <div className="relative">
          <svg 
            ref={svgRef}
            viewBox={viewBox} 
            className="w-full h-auto border border-gray-100 rounded-lg"
            style={{ minHeight: "400px" }}
          >
            {/* Links */}
            {topology.links.map((link) => {
              const source = topology.nodes.find(n => n.id === link.source);
              const target = topology.nodes.find(n => n.id === link.target);
              if (!source || !target) return null;
              
              const linkStyle = getLinkStyle(link);
              
              return (
                <g key={link.id}>
                  <line 
                    x1={source.x} 
                    y1={source.y} 
                    x2={target.x} 
                    y2={target.y} 
                    {...linkStyle}
                  />
                  {/* Reference point label */}
                  <text 
                    x={(source.x + target.x) / 2} 
                    y={(source.y + target.y) / 2}
                    dy="-8"
                    textAnchor="middle"
                    className="text-sm fill-gray-600 font-medium"
                    style={{ fontSize: "10px" }}
                  >
                    {link.referencePoint}
                  </text>
                </g>
              );
            })}
            
            {/* Nodes */}
            {topology.nodes.map((node) => (
              <g key={node.id} onClick={() => setSelectedNode(node)}>
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={node.type === "PCF" ? 40 : 30}
                  fill={getNodeColor(node)}
                  className="cursor-pointer transition-all duration-300 hover:opacity-90"
                  strokeWidth={selectedNode?.id === node.id ? 3 : 0}
                  stroke={selectedNode?.id === node.id ? "#000" : "none"}
                />
                <text 
                  x={node.x} 
                  y={node.y} 
                  textAnchor="middle" 
                  dy="0" 
                  className="text-white font-bold cursor-pointer select-none"
                  style={{ fontSize: node.type === "PCF" ? "16px" : "14px" }}
                >
                  {node.type}
                </text>
                {node.status !== "active" && (
                  <circle 
                    cx={node.x + (node.type === "PCF" ? 30 : 22)} 
                    cy={node.y - (node.type === "PCF" ? 30 : 22)} 
                    r={8}
                    fill={node.status === "degraded" ? "#ff9900" : "#e53935"}
                    className="stroke-white stroke-2"
                  >
                    <title>{node.status.toUpperCase()}</title>
                  </circle>
                )}
              </g>
            ))}
          </svg>
          
          {/* Selected Node Details */}
          {selectedNode && (
            <div className="absolute right-4 top-4 bg-white p-4 rounded-md shadow-md border border-gray-200 w-72">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{selectedNode.name} ({selectedNode.type})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => setSelectedNode(null)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize flex items-center">
                    {selectedNode.status === "active" && (
                      <span className="status-indicator status-active"></span>
                    )}
                    {selectedNode.status === "degraded" && (
                      <span className="status-indicator status-warning"></span>
                    )}
                    {selectedNode.status === "inactive" && (
                      <span className="status-indicator status-inactive"></span>
                    )}
                    {selectedNode.status === "failed" && (
                      <span className="status-indicator status-error"></span>
                    )}
                    {selectedNode.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections:</span>
                  <span className="font-medium">
                    {topology.links.filter(l => 
                      l.source === selectedNode.id || l.target === selectedNode.id
                    ).length}
                  </span>
                </div>
                {selectedNode.type === "PCF" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Policies:</span>
                      <span className="font-medium">48</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessions:</span>
                      <span className="font-medium">12,583</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-pcf mr-2"></div>
            <span className="text-xs">PCF</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-amf mr-2"></div>
            <span className="text-xs">AMF</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-smf mr-2"></div>
            <span className="text-xs">SMF</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-upf mr-2"></div>
            <span className="text-xs">UPF</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-udr mr-2"></div>
            <span className="text-xs">UDR</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-nrf mr-2"></div>
            <span className="text-xs">NEF</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-ausf mr-2"></div>
            <span className="text-xs">NWDAF</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-400 mr-2"></div>
            <span className="text-xs">Inactive</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-5g-warning mr-2"></div>
            <span className="text-xs">Degraded</span>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default NetworkTopology;
