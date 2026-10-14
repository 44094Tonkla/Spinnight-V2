import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import RoomCreated from './pages/RoomCreated';
import Lobby from './pages/Lobby';
import GameContainer from './pages/GameContainer';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/room-created" element={<RoomCreated />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<GameContainer />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
