
import { useState } from "react";
import { TestCase, TestCategory, TestSeverity, TestStatus, filterTestCases, getTestCaseStatistics, pcfN7TestCases } from "@/utils/pcfTestCases";
import CustomCard from "@/components/ui/CustomCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, FileText, ClipboardCheck, AlertTriangle, Clock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PcfReferencePoint } from "@/utils/pcfTypes";
import { Progress } from "@/components/ui/progress";

interface TestCaseViewerProps {
  referencePoint?: PcfReferencePoint;
}

const TestCaseViewer: React.FC<TestCaseViewerProps> = ({ 
  referencePoint = PcfReferencePoint.N7 
}) => {
  // Filter to show only tests for the specified reference point
  const availableTestCases = pcfN7TestCases.filter(
    test => test.referencePoint === referencePoint
  );
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<TestCategory | "">("");
  const [severityFilter, setSeverityFilter] = useState<TestSeverity | "">("");
  const [expandedTestCase, setExpandedTestCase] = useState<string | null>(null);
  
  // Apply filters
  const filteredTestCases = filterTestCases(
    availableTestCases,
    {
      category: categoryFilter || undefined,
      severity: severityFilter || undefined,
      status: 
        activeTab === "all" 
          ? undefined 
          : activeTab === "passed" 
            ? TestStatus.PASSED 
            : activeTab === "failed" 
              ? TestStatus.FAILED 
              : activeTab === "pending" 
                ? TestStatus.NOT_EXECUTED 
                : undefined,
    }
  ).filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get statistics
  const statistics = getTestCaseStatistics(availableTestCases);
  
  // Get status badge style
  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case TestStatus.PASSED:
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case TestStatus.FAILED:
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case TestStatus.BLOCKED:
        return <Badge className="bg-orange-100 text-orange-800">Blocked</Badge>;
      case TestStatus.IN_PROGRESS:
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Executed</Badge>;
    }
  };
  
  // Get severity badge style
  const getSeverityBadge = (severity: TestSeverity) => {
    switch (severity) {
      case TestSeverity.CRITICAL:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>;
      case TestSeverity.HIGH:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case TestSeverity.MEDIUM:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case TestSeverity.LOW:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
    }
  };
  
  return (
    <CustomCard
      title={`Test Cases - ${referencePoint} Interface`}
      description="PCF Interface Test Cases based on 3GPP Release 16"
      headerExtra={
        <Button size="sm" variant="outline" className="flex items-center">
          <PlusCircle className="mr-1 h-4 w-4" />
          New Test Case
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Overview/Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-500">Total Tests</div>
            <div className="text-2xl font-semibold">{statistics.total}</div>
            <Progress value={(statistics.passed / statistics.total) * 100} className="h-1.5 mt-2" />
          </div>
          <div className="bg-green-50 rounded-md p-3">
            <div className="text-sm text-green-600">Passed</div>
            <div className="text-2xl font-semibold">{statistics.passed}</div>
            <div className="text-xs text-gray-500 mt-1">{Math.round((statistics.passed / statistics.total) * 100)}%</div>
          </div>
          <div className="bg-red-50 rounded-md p-3">
            <div className="text-sm text-red-600">Failed</div>
            <div className="text-2xl font-semibold">{statistics.failed}</div>
            <div className="text-xs text-gray-500 mt-1">{Math.round((statistics.failed / statistics.total) * 100)}%</div>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-500">Not Executed</div>
            <div className="text-2xl font-semibold">{statistics.notExecuted}</div>
            <div className="text-xs text-gray-500 mt-1">{Math.round((statistics.notExecuted / statistics.total) * 100)}%</div>
          </div>
        </div>
      
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by ID or title..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TestCategory | "")}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {Object.values(TestCategory).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as TestSeverity | "")}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Severities</SelectItem>
              {Object.values(TestSeverity).map((severity) => (
                <SelectItem key={severity} value={severity}>{severity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="pending">Not Executed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Test Case List */}
        <div className="rounded-md border bg-white">
          {filteredTestCases.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No test cases match your criteria.
            </div>
          ) : (
            <div className="divide-y">
              {filteredTestCases.map((testCase) => (
                <Collapsible
                  key={testCase.id}
                  open={expandedTestCase === testCase.id}
                  onOpenChange={() => {
                    if (expandedTestCase === testCase.id) {
                      setExpandedTestCase(null);
                    } else {
                      setExpandedTestCase(testCase.id);
                    }
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center p-3 cursor-pointer hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">{testCase.id}</span>
                          <span className="font-medium">{testCase.title}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {testCase.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getSeverityBadge(testCase.severity)}
                        <Badge variant="outline">{testCase.category}</Badge>
                        {getStatusBadge(testCase.status)}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 bg-gray-50 text-sm space-y-3">
                      <div>
                        <h4 className="font-medium">Description</h4>
                        <p>{testCase.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Preconditions</h4>
                        <ul className="list-disc pl-5 mt-1">
                          {testCase.preconditions.map((precondition, index) => (
                            <li key={index}>{precondition}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Steps</h4>
                        <ol className="list-decimal pl-5 mt-1">
                          {testCase.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Expected Results</h4>
                        <ul className="list-disc pl-5 mt-1">
                          {testCase.expectedResults.map((result, index) => (
                            <li key={index}>{result}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="flex items-center">
                          <FileText className="mr-1 h-4 w-4" />
                          View Report
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center">
                          <ClipboardCheck className="mr-1 h-4 w-4" />
                          Run Test
                        </Button>
                        {testCase.status !== TestStatus.PASSED && (
                          <Button size="sm" variant="default" className="flex items-center">
                            {testCase.status === TestStatus.FAILED ? (
                              <>
                                <AlertTriangle className="mr-1 h-4 w-4" />
                                Report Bug
                              </>
                            ) : (
                              <>
                                <Clock className="mr-1 h-4 w-4" />
                                Schedule
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomCard>
  );
};

export default TestCaseViewer;
