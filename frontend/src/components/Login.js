import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Auth.css';

// Yup validation schema
const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const Login = ({ setIsAuthenticated }) => {
    const [loading, setLoading] = useState(false); // State for loading
    const [showModal, setShowModal] = useState(false); // Modal state
    const [errorMessage, setErrorMessage] = useState(''); // Error message state
    const [rememberMe, setRememberMe] = useState(false); // "Remember Me" checkbox state
    const [savedCredentials, setSavedCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    useEffect(() => {
        // Load saved credentials from localStorage if they exist
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');
        if (savedEmail && savedPassword) {
            setSavedCredentials({ email: savedEmail, password: savedPassword });
            setRememberMe(true); // Automatically check the checkbox
        }
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true); // Show loading spinner
        setErrorMessage(''); // Clear any existing error messages

        try {
            // Update URL to the deployed backend
            const response = await axios.post('http://localhost:8000/api/accounts/login/', {
                email: values.email,
                password: values.password,
            });

            // If login is successful
            setIsAuthenticated(true); // Update state to reflect successful authentication
            localStorage.setItem('isAuthenticated', 'true'); // Persist authentication status

            // Save credentials to localStorage if "Remember Me" is checked
            if (rememberMe) {
                localStorage.setItem('savedEmail', values.email);
                localStorage.setItem('savedPassword', values.password);
            } else {
                // Clear saved credentials if "Remember Me" is unchecked
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedPassword');
            }

            setLoading(false); // Hide loading spinner
            setShowModal(true); // Show success modal
            setTimeout(() => {
                navigate('/'); // Redirect to the home page or protected route after 2 seconds
            }, 2000);
        } catch (error) {
            setLoading(false); // Hide loading spinner
            // Set error message based on server response or default message
            setErrorMessage(
                error.response?.data?.message || 'Invalid email or password'
            );
        }
    };

    return (
        <div className="auth-container">
            <Formik
                initialValues={{
                    email: savedCredentials.email || '',
                    password: rememberMe ? savedCredentials.password : '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize // Ensure Formik reinitializes when initialValues change
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <h2>Login</h2>
                        <div className="input-container">
                            <Field
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="auth-input"
                            />
                            <ErrorMessage name="email" component="p" className="error-message" />
                        </div>
                        <div className="input-container">
                            <Field
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="auth-input"
                            />
                            <ErrorMessage name="password" component="p" className="error-message" />
                        </div>
                        <div className="checkbox-container">
    <label className="checkbox-label">
        <span>Remember Me</span> {/* Text first */}
        <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => {
                setRememberMe(!rememberMe);
                if (!rememberMe) {
                    setFieldValue('email', savedCredentials.email);
                    setFieldValue('password', savedCredentials.password);
                } else {
                    setFieldValue('email', '');
                    setFieldValue('password', '');
                }
            }}
        />
    </label>
</div>



                        <button type="submit" disabled={isSubmitting || loading}>Login</button>
                        {/* Show loading spinner when logging in */}
                        {loading && <div className="loading-spinner"></div>}
                        {/* Display error message */}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </Form>
                )}
            </Formik>

            {/* Modal for login success */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Login Successful!</h3>
                        <p>Welcome back!</p>
                        <button onClick={() => setShowModal(false)} className="modal-close-btn">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
