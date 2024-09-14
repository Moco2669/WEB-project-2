import React, {useState} from 'react';
import axios from 'axios';
import { rateRide } from '../services/RideService';
import useAuth from '../contexts/useAuth';

const RideRating: React.FC = () => {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const {token} = useAuth();

    const handleRating = async (newRating: number) => {
        setRating(newRating);
        try {
            if(token?.token){
                rateRide(token.token, newRating);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    return (
        <div>
            <h3>Rate your ride:</h3>
            <div style={{ display: 'flex' }}>
                {Array(5).fill(0).map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <span
                            key={index}
                            onClick={() => handleRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                                cursor: 'pointer',
                                fontSize: '2rem',
                                color: starValue <= (hoverRating || rating) ? 'gold' : 'gray'
                            }}
                        >
                            ★
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default RideRating;