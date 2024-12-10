import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import "../styles/Feedback.css";

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/end');
                const { text, message } = response.data;
                setFeedback(text);
                console.log(message);
            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    return (
        <div className="feedback-container">
            <h1>Feedback</h1>
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : feedback ? (
                <div className="feedback-message">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                </div>
            ) : (
                <p className="no-feedback">No feedback available</p>
            )}
        </div>
    );
};

export default Feedback;
