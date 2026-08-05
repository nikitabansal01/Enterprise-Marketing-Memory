import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { AiConversationProvider } from './lib/aiConversation'
import CampaignIntelligence from './pages/CampaignIntelligence'
import CampaignStudio from './pages/CampaignStudio'
import CampaignWorkflowRedirect from './pages/CampaignWorkflowRedirect'
import Dashboard from './pages/Dashboard'
import Export from './pages/Export'
import LearnBrand from './pages/LearnBrand'
import Settings from './pages/Settings'
import Validate from './pages/Validate'

export default function App() {
  return (
    <BrowserRouter>
      <AiConversationProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/p0" replace />} />

        <Route element={<AppLayout />}>
          <Route path="p0">
            <Route index element={<Dashboard />} />
            <Route path="learn-brand" element={<LearnBrand />} />
            <Route
              path="create-campaign"
              element={<CampaignWorkflowRedirect step="drafts" />}
            />
            <Route path="validate" element={<Validate />} />
            <Route path="export" element={<Export />} />
            <Route path="operationalize" element={<Navigate to="/p1" replace />} />
            <Route
              path="campaign-intelligence"
              element={<Navigate to="/p2" replace />}
            />
            <Route path="analytics" element={<Navigate to="/p2" replace />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="p1">
            <Route index element={<CampaignStudio />} />
            <Route path="canvas" element={<Navigate to="/p1" replace />} />
            <Route path="workflow" element={<CampaignStudio />} />
            <Route path="approvals" element={<CampaignStudio />} />
            <Route path="connectors" element={<CampaignStudio />} />
            <Route path="governance" element={<CampaignStudio />} />
            <Route path="*" element={<Navigate to="/p1" replace />} />
          </Route>

          <Route path="p2">
            <Route index element={<CampaignIntelligence />} />
            <Route
              path="campaign-intelligence"
              element={<Navigate to="/p2" replace />}
            />
            <Route path="*" element={<Navigate to="/p2" replace />} />
          </Route>
        </Route>

        <Route path="/learn-brand" element={<Navigate to="/p0/learn-brand" replace />} />
        <Route
          path="/create-campaign"
          element={<Navigate to="/p0/create-campaign" replace />}
        />
        <Route path="/validate" element={<Navigate to="/p0/validate" replace />} />
        <Route path="/export" element={<Navigate to="/p0/export" replace />} />
        <Route path="/operationalize" element={<Navigate to="/p1" replace />} />
        <Route path="/campaign-intelligence" element={<Navigate to="/p2" replace />} />
        <Route path="/settings" element={<Navigate to="/p0/settings" replace />} />

        <Route path="*" element={<Navigate to="/p0" replace />} />
      </Routes>
      </AiConversationProvider>
    </BrowserRouter>
  )
}
