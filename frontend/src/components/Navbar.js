import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserPlus, faSignInAlt, faSignOutAlt, faBell, faQuestionCircle, faCog } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import logo from '../assets/images/logo1.png';

const Navbar = ({ isAuthenticated, setIsAuthenticated, encryptionKey }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [logoutModal, setLogoutModal] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [fontSize, setFontSize] = useState(16); // Default font size
    const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
    }, [setIsAuthenticated]);

    useEffect(() => {
        if (encryptionKey) {
            setNotifications((prev) => [...prev, `Your encryption key: ${encryptionKey}`]);
        }
    }, [encryptionKey]);

    // Set font size based on current route
    useEffect(() => {
        const path = location.pathname;
        let newFontSize = 16; // Default font size

        if (path.includes('help')) {
            newFontSize = 18; // Example for help page
        } else if (path.includes('login')) {
            newFontSize = 14; // Example for login page
        } else if (path.includes('register')) {
            newFontSize = 20; // Example for register page
        }
        
        setFontSize(newFontSize);
        document.documentElement.style.setProperty('--base-font-size', `${newFontSize}px`);
    }, [location]);

    const handleLogoutClick = () => {
        setConfirmLogout(true);
    };

    const handleLogoutConfirm = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        setConfirmLogout(false);
        setLogoutModal(true);
        setTimeout(() => {
            setLogoutModal(false);
            navigate('/');
        }, 2000);
    };

    const handleLogoutCancel = () => {
        setConfirmLogout(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    };

    const toggleSettingsDropdown = () => {
        setSettingsDropdownOpen(prev => !prev);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const generateBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        return (
            <div className="breadcrumbs">
                <Link to="/">Home</Link>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return (
                        <span key={to}>
                            {' > '}
                            <Link to={to}>{value.charAt(0).toUpperCase() + value.slice(1)}</Link>
                        </span>
                    );
                })}
            </div>
        );
    };

    const handleFontSizeChange = (event) => {
        const newSize = event.target.value;
        setFontSize(newSize);
        // Update the global font size variable
        document.documentElement.style.setProperty('--base-font-size', `${newSize}px`);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="Logo" className="logo-circle" />
                    <span>CryptoGuard</span>
                </Link>
                <ul className="navbar-menu">
                    <li className="navbar-item">
                        <Link to="/" className="navbar-links">
                            <FontAwesomeIcon icon={faHome} /> Home
                        </Link>
                    </li>
                    {!isAuthenticated && (
                        <li className="navbar-item">
                            <Link to="/register" className="navbar-links">
                                <FontAwesomeIcon icon={faUserPlus} /> Register
                            </Link>
                        </li>
                    )}
                    {!isAuthenticated ? (
                        <li className="navbar-item">
                            <Link to="/login" className="navbar-links">
                                <FontAwesomeIcon icon={faSignInAlt} /> Login
                            </Link>
                        </li>
                    ) : (
                        <li className="navbar-item" onClick={toggleDropdown}>
                            <span className="navbar-links notification">
                                <FontAwesomeIcon icon={faBell} />
                                {notifications.length > 0 && (
                                    <span className="notification-bubble">
                                        {notifications.length}
                                    </span>
                                )}
                                Notifications
                            </span>
                            {dropdownOpen && (
                                <div className="notification-dropdown">
                                    {notifications.length > 0 ? (
                                        <>
                                            {notifications.map((note, index) => (
                                                <div key={index} className="notification-item">
                                                    {note}
                                                </div>
                                            ))}
                                            <button className="clear-notifications" onClick={clearNotifications}>
                                                Clear Notifications
                                            </button>
                                        </>
                                    ) : (
                                        <div className="notification-item">No notifications at the moment</div>
                                    )}
                                </div>
                            )}
                        </li>
                    )}
                    <li className="navbar-item settings" onClick={toggleSettingsDropdown}>
                        <span className="navbar-links">
                            <FontAwesomeIcon icon={faCog} /> Settings
                        </span>
                        {settingsDropdownOpen && (
                            <div className="settings-dropdown">
                                <ul>
                                    <li className="settings-item">
                                        <Link to="/help" className="navbar-links">
                                            <FontAwesomeIcon icon={faQuestionCircle} /> Help
                                        </Link>
                                    </li>
                                    <hr />
                                    <li className="settings-item">
                                        <label htmlFor="fontSizeSlider" className="navbar-links">Font Size:</label>
                                        <input
                                            type="range"
                                            id="fontSizeSlider"
                                            min="10"
                                            max="40"
                                            value={fontSize}
                                            onChange={handleFontSizeChange}
                                            className="font-size-slider"
                                        />
                                        <span>{fontSize}px</span>
                                    </li>
                                    <hr />
                                    {isAuthenticated && (
                                        <li className="settings-item" onClick={handleLogoutClick}>
                                            <span className="navbar-links" style={{ cursor: 'pointer' }}>
                                                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
            {generateBreadcrumbs()}
            {logoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>You have successfully logged out.</p>
                    </div>
                </div>
            )}
            {confirmLogout && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>Are you sure you want to log out?</p>
                        <div className="modal-buttons">
                            <button onClick={handleLogoutConfirm}>Yes</button>
                            <button onClick={handleLogoutCancel}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
