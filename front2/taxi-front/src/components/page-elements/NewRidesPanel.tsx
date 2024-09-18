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
            <div className='flex items-center'>
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
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            User
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Start Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Destination Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Price
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Distance
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {newRides.map(ride => (
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 transition-colors">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {ride.user}
                            </th>
                            <td className="px-6 py-4">
                                {ride.startaddress}
                            </td>
                            <td className="px-6 py-4">
                                {ride.destaddress}
                            </td>
                            <td className="px-6 py-4">
                                {ride.price}
                            </td>
                            <td className="px-6 py-4">
                                {ride.distance}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    className='bg-green-500 text-white p-2 rounded mr-2 w-full hover:bg-green-700 transition-colors'
                                    onClick={() => handleTakeRide(ride.user)}
                                >
                                    Take Ride
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NewRidesPanel;