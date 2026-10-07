import { useState } from "react";

import {
  AppShell,
  type PageId,
} from "@/components/AppShell";

import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { ProfileSetupPage } from "@/pages/ProfileSetupPage";
import { ResumeIntelligencePage } from "@/pages/ResumeIntelligencePage";
import { SkillGapAnalysisPage } from "@/pages/SkillGapAnalysisPage";
import { PlacementHubPage } from "@/pages/PlacementHubPage";
import { StudyVaultPage } from "@/pages/StudyVaultPage";
import { AdaptiveQuizPage } from "@/pages/AdaptiveQuizPage";
import { ReadinessEnginePage } from "@/pages/ReadinessEnginePage";
import { SkillPassportPage } from "@/pages/SkillPassportPage";
import { StudentDashboardPage } from "@/pages/StudentDashboardPage";
import { DepartmentDashboardPage } from "@/pages/DepartmentDashboardPage";
import { AdminConsolePage } from "@/pages/AdminConsolePage";
import { SettingsPage } from "@/pages/SettingsPage";

/* Mock Interview uses default export */
import MockInterviewPage from "@/pages/MockInterviewPage";

function App() {
  const [page, setPage] = useState<PageId>("landing");

  function renderPage() {
    switch (page) {
      case "landing":
        return (
          <LandingPage
            onNavigate={setPage}
          />
        );

      case "auth":
        return (
          <AuthPage
            onNavigate={setPage}
          />
        );

      case "profile":
        return (
          <ProfileSetupPage
            onNavigate={setPage}
          />
        );

      case "resume":
        return (
          <ResumeIntelligencePage
            onNavigate={setPage}
          />
        );

      case "gap":
        return (
          <SkillGapAnalysisPage
            onNavigate={setPage}
          />
        );

      case "hub":
        return (
          <PlacementHubPage
            onNavigate={setPage}
          />
        );

      case "vault":
        return (
          <StudyVaultPage
            onNavigate={setPage}
          />
        );

      case "quiz":
        return (
          <AdaptiveQuizPage
            onNavigate={setPage}
          />
        );

      case "interview":
        return (
          <MockInterviewPage
            onNavigate={setPage}
          />
        );

      case "readiness":
        return (
          <ReadinessEnginePage
            onNavigate={setPage}
          />
        );

      case "passport":
        return (
          <SkillPassportPage
            onNavigate={setPage}
          />
        );

      case "student-dashboard":
        return (
          <StudentDashboardPage
            onNavigate={setPage}
          />
        );

      case "department":
        return <DepartmentDashboardPage />;

      case "admin":
        return <AdminConsolePage />;

      case "settings":
        return (
          <SettingsPage
            onNavigate={setPage}
          />
        );

      default:
        return (
          <LandingPage
            onNavigate={setPage}
          />
        );
    }
  }

  return (
    <AppShell
      page={page}
      onNavigate={setPage}
    >
      {renderPage()}
    </AppShell>
  );
}

export default App;