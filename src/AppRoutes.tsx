
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChapterPage from "./pages/ChapterPage";
import ResourcesPage from "./pages/ResourcesPage";
import AuthPage from "./pages/AuthPage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/chapter/:id" element={<ChapterPage />} />
    <Route path="/resources" element={<ResourcesPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/journal" element={<JournalPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
