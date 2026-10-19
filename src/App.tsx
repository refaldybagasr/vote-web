import { Routes, Route, Navigate } from 'react-router';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/vote" element={<Placeholder title="Vote" />} />
      <Route path="/admin/users" element={<Placeholder title="Admin · Users" />} />
      <Route path="/admin/results" element={<Placeholder title="Admin · Results" />} />
    </Routes>
  );
}
