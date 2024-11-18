import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Auth.css'; // Import the CSS file for styling

const Register = () => {
    const [loading, setLoading] = useState(false); // State to control loading spinner
    const [showModal, setShowModal] = useState(false); // State to control the modal visibility
    const [errorMessage, setErrorMessage] = useState(''); // State to store error message

    // Validation schema with Yup
    const validationSchema = Yup.object({
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must be less than 20 characters')
            .required('Username is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required')
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        const { username, email, password } = values;

        setLoading(true); // Show the loading spinner when the request is being sent
        setErrorMessage(''); // Clear any existing error message

        try {
            // Update the URL to point to the deployed backend
            await axios.post(
                'http://localhost:8000/api/accounts/register/',
                { username, email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            setLoading(false); // Hide the spinner when the request is complete
            setShowModal(true); // Show modal on successful registration
            resetForm(); // Reset the form fields
        } catch (error) {
            setLoading(false); // Hide the spinner if there's an error
            // Extract error message from the server response
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || 'Registration failed!');
            } else {
                setErrorMessage('An unexpected error occurred!');
            }
        }
        setSubmitting(false);
    };

    const closeModal = () => {
        setShowModal(false); // Close the modal
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>

            <Formik
                initialValues={{
                    username: '',
                    email: '',
                    password: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="auth-form">
                        <Field
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="auth-input"
                        />
                        <ErrorMessage name="username" component="div" className="error-message" />

                        <Field
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="auth-input"
                        />
                        <ErrorMessage name="email" component="div" className="error-message" />

                        <Field
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="auth-input"
                        />
                        <ErrorMessage name="password" component="div" className="error-message" />

                        {/* Display error message */}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isSubmitting || loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </Form>
                )}
            </Formik>

            {/* Show loading spinner while registering */}
            {loading && <div className="loading-spinner"></div>}

            {/* Registration Success Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>Registration successful!</p>
                        <div className="modal-buttons">
                            <button onClick={closeModal} className="modal-close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
