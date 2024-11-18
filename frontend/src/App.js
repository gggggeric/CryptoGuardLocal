import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EncryptionTool from './components/EncryptionTool';
import Login from './components/Login';
import Register from './components/Register';
import Help from './components/Help';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
    const [encryptionKey, setEncryptionKey] = useState(''); // Encryption key state
    const [fontSize, setFontSize] = useState(16); // Default font size for the app

    useEffect(() => {
        // Update the CSS custom property whenever the font size changes
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    }, [fontSize]);

    return (
        <Router>
            <div style={{ backgroundColor: '#3C3D37', minHeight: '100vh', padding: '20px', color: 'white' }}>
                {/* Pass necessary props to Navbar including fontSize */}
                <Navbar 
                    isAuthenticated={isAuthenticated} 
                    setIsAuthenticated={setIsAuthenticated} 
                    encryptionKey={encryptionKey} 
                    fontSize={fontSize} 
                    setFontSize={setFontSize} // Passing the setFontSize function to Navbar
                />
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <EncryptionTool 
                                isAuthenticated={isAuthenticated} 
                                setEncryptionKey={setEncryptionKey}
                            />
                        }
                    />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/help" element={<Help />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
