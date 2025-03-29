import './App.css';
import Home from './pages/home';
import { WidgetApiProvider } from "@matrix-widget-toolkit/react";
import MatrixClientProvider from './components/MatrixClientProvider'; // Import the MatrixClientProvider

function App() {

  return (
    <MatrixClientProvider> {/* Wrap Home with MatrixClientProvider */}
      <Home />
    </MatrixClientProvider>
  );
}

export default App;