import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import MainNav from "@/components/MainNav";
import Home from "@/pages/Home";
import Practice from "@/pages/Practice";
import Progress from "@/pages/Progress";
import MemoryCards from "@/pages/MemoryCards";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import ProfilePage from "@/pages/ProfilePage";

function Layout({ children, showNav = true }: { children: React.ReactNode; showNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      {showNav && (
        <header className="border-b">
          <div className="container mx-auto py-4">
            <MainNav />
          </div>
        </header>
      )}
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        {() => (
          <Layout showNav={false}>
            <AuthPage />
          </Layout>
        )}
      </Route>
      <Route>
        {() => (
          <Layout>
            <Switch>
              <ProtectedRoute path="/" component={Home} />
              <ProtectedRoute path="/practice" component={Practice} />
              <ProtectedRoute path="/progress" component={Progress} />
              <ProtectedRoute path="/memory-cards" component={MemoryCards} />
              <ProtectedRoute path="/profile" component={ProfilePage} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;