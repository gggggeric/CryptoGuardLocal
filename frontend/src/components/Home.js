import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css'; // Import the CSS file

const HomePage = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/homepage/');
                setMessage(response.data.message);
            } catch (error) {
                console.error("There was an error fetching the data!", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="homepage"> {/* Use the homepage class from CSS */}
            <h1>{message}</h1>
            <button>
                Get Started
            </button>
        </div>
    );
};

export default HomePage;
