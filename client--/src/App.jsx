import { useState, useEffect } from 'react';
import AuthModule from './components/AuthModule.jsx';

/**
 * App – root React component.
 *
 * Responsibility:
 *  - Listens to URL hash changes (#login / #register) triggered by the
 *    static navbar anchors in index.html.
 *  - Derives `activeTab` from hash and passes it down as `initialMode`
 *    to <AuthModule>.
 *  - Handles smooth scroll into the auth section when a nav link is clicked.
 *
 * Theory (Side Effects & useEffect):
 *  Subscribing to window events is a side effect. useEffect runs after render
 *  and its cleanup function removes the listener before the component unmounts,
 *  preventing memory leaks.
 */
function getTabFromHash(hash) {
    if (hash === '#register') return 'register';
    return 'login'; // default
}

export default function App() {
    const [activeTab, setActiveTab] = useState(() =>
        getTabFromHash(window.location.hash)
    );

    useEffect(() => {
        // Listen to hash changes produced by navbar <a> clicks
        const handleHashChange = () => {
            const tab = getTabFromHash(window.location.hash);
            setActiveTab(tab);

            // Smooth scroll to auth section
            const section = document.getElementById('auth-section');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        // If the page loads with a hash already set, scroll immediately
        if (window.location.hash === '#login' || window.location.hash === '#register') {
            document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return <AuthModule initialMode={activeTab} />;
}
