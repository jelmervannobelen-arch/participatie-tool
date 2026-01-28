import { Route, Routes, Link } from "react-router-dom";
import { AdminProjectNew } from "./pages/AdminProjectNew";
import { AdminProjectDetail } from "./pages/AdminProjectDetail";
import { PublicProject } from "./pages/PublicProject";
import { AdminAnalysis } from "./pages/AdminAnalysis";

const Home = () => (
  <div className="mx-auto max-w-3xl space-y-4 p-8">
    <h1 className="text-3xl font-bold">Participatie-ontwerptool openbare ruimte</h1>
    <p className="text-slate-600">
      Start een project als ontwerper of open een publieke participatiepagina via QR.
    </p>
    <div className="flex flex-wrap gap-3">
      <Link
        to="/admin/projects/new"
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Nieuw project
      </Link>
      <Link
        to="/p/demo"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
      >
        Demo publieke pagina
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-800">
            Participatie-ontwerptool
          </Link>
          <nav className="flex gap-4 text-sm text-slate-500">
            <Link to="/admin/projects/new" className="hover:text-slate-800">
              Admin
            </Link>
            <Link to="/p/demo" className="hover:text-slate-800">
              Publiek
            </Link>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/projects/new" element={<AdminProjectNew />} />
        <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />
        <Route path="/admin/projects/:id/analysis" element={<AdminAnalysis />} />
        <Route path="/p/:projectId" element={<PublicProject />} />
      </Routes>
    </div>
  );
}
