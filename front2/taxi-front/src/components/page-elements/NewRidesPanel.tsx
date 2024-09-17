import React, {useEffect, useState} from 'react';
import IWaitingRide from '../interfaces/IWaitingRide';
import { getNewRides, acceptRide, checkRidersRide } from '../services/RideService';
import IRideEstimate from '../interfaces/IRideEstimate';
import IRideDetails from '../interfaces/IRideDetails';
import useAuth from '../contexts/useAuth';
import CountdownTimer from '../ui-elements/CountdownTimer';

const NewRidesPanel: React.FC = () => {
    const [newRides, setNewRides] = useState<IWaitingRide[]>([]);
    const [rideStatus, setRideStatus] = useState<IRideEstimate["status"] | null>(null);
    const [rideDetails, setRideDetails] = useState<IRideDetails | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [phase, setPhase] = useState<'arrive' | 'travel'>('arrive');
    const {token} = useAuth();

    const parseTimeSpanToMs = (timeSpan: string): number => {
        const [hours, minutes, secondsAndMs] = timeSpan.split(':');
        const [seconds, milliseconds = '0'] = secondsAndMs.split('.').map(Number);
    
        const hoursInMs = Number(hours) * 60 * 60 * 1000;
        const minutesInMs = Number(minutes) * 60 * 1000;
        const secondsInMs = seconds * 1000;
        const ms = Number(milliseconds) / 1000;
    
        return hoursInMs + minutesInMs + secondsInMs + ms;
    };

    const getArrivalTime = () => {
        if(rideDetails?.starttime && rideDetails?.driverarrivetime){
            const startDate = new Date(rideDetails.starttime).getTime();
            const driverArrivalMs = parseTimeSpanToMs(rideDetails.driverarrivetime);
            return startDate + driverArrivalMs;
        }
    };

    const getTravelEndTime = () => {
        const arrivalTime = getArrivalTime();
        if(rideDetails?.traveltime && arrivalTime){
            const travelTimeMs = parseTimeSpanToMs(rideDetails.traveltime);
            return arrivalTime + travelTimeMs;
        }
    };

    const checkExistingRide = async () => {
        try {
            if(token?.token){
                const response = await checkRidersRide(token.token);
                if (response.status === 404) {
                    setRideStatus(null);
                } else {
                    setRideDetails(response);
                    //console.log(response);
                    setRideStatus(response.status);
                }
            }
        } catch (error) {
            fetchNewRides();
            console.error("Error checking ride status:", error);
        }
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now() + 7200000;
            if(rideDetails?.starttime){
                const razlika = now - (new Date(rideDetails?.starttime).getTime());
                if (phase === 'arrive') {
                    const arrivalTime = getArrivalTime();
                    if(arrivalTime){
                        const timeUntilArrival = Math.max(arrivalTime - now, 0);
                        if (timeUntilArrival === 0) {
                            setPhase('travel');
                        }
                        console.log(phase);
                        setTimeLeft(timeUntilArrival);
                    }
    
                } else if (phase === 'travel') {
                    const travelEndTime = getTravelEndTime();
                    if(travelEndTime){
                        const timeUntilTravelEnd = Math.max(travelEndTime - now, 0);
                        setTimeLeft(timeUntilTravelEnd);
                        if(travelEndTime<now){
                            //checkExistingRide();
                            setRideStatus(null);
                        }
                    }
                }
            }
        };

        const intervalId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(intervalId);
    }, [phase, rideDetails?.starttime, rideDetails?.driverarrivetime, rideDetails?.traveltime]);

    const fetchNewRides = async () => {
        if(token?.token){
            const rides = await getNewRides(token.token);
            setNewRides(rides);
            console.log(rides);
        }
    };

    useEffect(() => {
        

        checkExistingRide();
        //console.log(newRides);
    }, [token?.token, rideStatus]);

    const handleTakeRide = async (user:string) => {
        try{
            if(token?.token){
                const result = await acceptRide(token.token, user);
                setRideStatus(result.status);
                setRideDetails(result);
            }
        } catch(error){
            console.warn(error);
        }
    }

    if(rideStatus === "InProgress" && rideDetails){
        return (
            <div>
                <h3>Ride Accepted!</h3>
                <CountdownTimer timeLeft={timeLeft} phase={phase}/>
                <p>Destination: {rideDetails.destaddress}</p>
                <p>Estimated Travel Time: {rideDetails.traveltime}</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className='text-xl mb-4'>Rides</h2>
            <ul>
                {newRides.map(ride => (
                    <li key={ride.user} className='flex justify-between items-center p-2 bg-white mb-2 rounded shadow'>
                        <span>{ride.user}</span>
                        <span>{ride.startaddress}</span>
                        <span>{ride.destaddress}</span>
                        <span>{ride.distance}</span>
                        <span>{ride.price}</span>
                        <div>
                            <button 
                                className='bg-green-500 text-white p-2 rounded mr-2'
                                onClick={() => handleTakeRide(ride.user)}
                            >
                                Take Ride
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewRidesPanel;