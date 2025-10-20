import { useState } from "react";
import { ApolloProvider } from './services/apolloClient';
import { apolloClient } from './services/apolloClient';
import { DashboardProvider } from "./contexts/DashboardContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { TracesPage } from "./pages/TracesPage";
import { TraceDetailPage } from "./pages/TraceDetailPage";
import { FunctionsPage } from "./pages/FunctionsPage";
import { FunctionDetailPage } from "./pages/FunctionDetailPage";
import { ErrorsPage } from "./pages/ErrorsPage";

type View = "dashboard" | "traces" | "functions" | "errors";

function AppContent() {
  const [currentView, setCurrentView] =
    useState<View>("dashboard");
  const [selectedTraceId, setSelectedTraceId] = useState<
    string | null
  >(null);
  const [selectedFunctionId, setSelectedFunctionId] = useState<
    string | null
  >(null);

  const handleViewChange = (view: string) => {
    setCurrentView(view as View);
    setSelectedTraceId(null);
    setSelectedFunctionId(null);
  };

  const handleTraceClick = (traceId: string) => {
    setSelectedTraceId(traceId);
  };

  const handleFunctionClick = (functionId: string) => {
    setSelectedFunctionId(functionId);
  };

  const handleBackToTraces = () => {
    setSelectedTraceId(null);
  };

  const handleBackToFunctions = () => {
    setSelectedFunctionId(null);
  };

  const renderContent = () => {
    // Trace detail view
    if (selectedTraceId) {
      return (
        <TraceDetailPage
          traceId={selectedTraceId}
          onBack={handleBackToTraces}
        />
      );
    }

    // Function detail view
    if (selectedFunctionId) {
      return (
        <FunctionDetailPage
          functionId={selectedFunctionId}
          onBack={handleBackToFunctions}
        />
      );
    }

    // Main views
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "traces":
        return <TracesPage onTraceClick={handleTraceClick} />;
      case "functions":
        return (
          <FunctionsPage
            onFunctionClick={handleFunctionClick}
          />
        );
      case "errors":
        return <ErrorsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentView={currentView}
            onViewChange={handleViewChange}
          />

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppContent />
    </ApolloProvider>
  );
}
