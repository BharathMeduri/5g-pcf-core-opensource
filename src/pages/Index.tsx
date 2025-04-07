
import React from "react";
import { Link } from "react-router-dom";
import SmPolicyControl from "@/components/policy/SmPolicyControl";
import PolicyRules from "@/components/policy/PolicyRules";
import { mockPolicyRules } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { Code, Terminal } from "lucide-react";

interface IndexProps {
  activeTab?: string;
}

const Index: React.FC<IndexProps> = ({ activeTab = "default" }) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">5G Core Network - Policy Control Function (PCF)</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/sm-policy">
              SM Policy Control
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sm-policy-api">
              <Code className="mr-2 h-4 w-4" />
              API Demo
            </Link>
          </Button>
        </div>
      </div>
      
      {activeTab === "sm-policy" ? (
        <SmPolicyControl />
      ) : (
        <PolicyRules policies={mockPolicyRules} />
      )}
    </div>
  );
};

export default Index;
