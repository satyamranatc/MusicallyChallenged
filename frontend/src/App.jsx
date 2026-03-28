import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Piano from './pages/Piano'
import Guitar from './pages/Guitar'
import Metronome from './pages/Metronome'
import Drums from './pages/Drums'
import AiComposer from './pages/AiComposer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Piano />} />
          <Route path="guitar" element={<Guitar />} />
          <Route path="metronome" element={<Metronome />} />
          <Route path="drums" element={<Drums />} />
          <Route path="ai" element={<AiComposer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App