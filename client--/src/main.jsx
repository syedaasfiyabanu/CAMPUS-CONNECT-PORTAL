import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Mounts React specifically to the #auth-root div inside the static index.html
// Theory: createRoot targets a single DOM element, letting React "hydrate" just
// that portion of the page without taking over the entire document.
createRoot(document.getElementById('auth-root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
