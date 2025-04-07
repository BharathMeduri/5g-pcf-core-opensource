
import React from "react";
import SmPolicyControl from "@/components/policy/SmPolicyControl";
import PolicyRules from "@/components/policy/PolicyRules";
import { mockPolicyRules } from "@/utils/mockData";

interface IndexProps {
  activeTab?: string;
}

const Index: React.FC<IndexProps> = ({ activeTab = "default" }) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">5G Core Network - Policy Control Function (PCF)</h1>
      
      {activeTab === "sm-policy" ? (
        <SmPolicyControl />
      ) : (
        <PolicyRules policies={mockPolicyRules} />
      )}
    </div>
  );
};

export default Index;
