import React, {useEffect, useState} from 'react';
import IUser from '../interfaces/IUser';
import IToken from '../interfaces/IToken';
import IRide, {defaultRide} from '../interfaces/IRide';
import { estimateRide, confirmRide, checkRide } from '../services/RideService';
import IRideEstimate from '../interfaces/IRideEstimate';
import IRideDetails from '../interfaces/IRideDetails';
import CountdownTimer from '../ui-elements/CountdownTimer';
import RideRating from '../ui-elements/RideRating';
import useAuth from '../contexts/useAuth';

const NewDrivePanel : React.FC = () => {
    const [rideModel, setRideModel] = useState<IRide>(defaultRide);
    const [rideEstimate, setRideEstimate] = useState<IRideEstimate | null>(null);
    const [rideStatus, setRideStatus] = useState<IRideEstimate["status"] | null>(null);
    const [rideDetails, setRideDetails] = useState<IRideDetails | null>(null);
    const {token} = useAuth();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [phase, setPhase] = useState<'arrive' | 'travel'>('arrive');

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
                const response = await checkRide(token.token);
                if (response.status === 404) {
                    setRideStatus(null);
                } else {
                    setRideDetails(response);
                    //console.log(response);
                    setRideStatus(response.status);
                }
            }
        } catch (error) {
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
                            checkExistingRide();
                            //setRideStatus("Done");
                        }
                    }
                }
            }
        };

        const intervalId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(intervalId);
    }, [phase, rideDetails?.starttime, rideDetails?.driverarrivetime, rideDetails?.traveltime]);

    useEffect(() => {
        checkExistingRide();
    }, [token?.token]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if(token?.token){
                const result = await estimateRide(rideModel, token.token);
                setRideEstimate(result);
                if(result!=null){
                    setRideStatus(result.status);
                }
            }
        } catch (error) {
            console.error('Error estimating ride:', error);
        }
    };

    const handleChange=(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        key: keyof IRide
    ) => {
        setRideModel({
            ...rideModel,
            [key]: event.target.value,
        });
    };

    const handleConfirmRide = async () => {
        try {
            if(token?.token){
                    const result = await confirmRide(token.token);
                    setRideStatus(result.status);
                    setRideDetails(result);
            }
        } catch(error) {

        }
    };

    useEffect(() => {
        if (rideStatus === 'Waiting') {
            const ws = new WebSocket(`ws://localhost:8655/ws/ride-notifications?token=${token?.token}`);

            ws.onmessage = (event) => {
                const updatedRide: IRideDetails = JSON.parse(event.data);
                console.log("DRIVERARRIVETIME" + updatedRide.driverarrivetime);
                console.log("STARTTIME" + updatedRide.starttime);
                console.log("ARRIVETIME" + updatedRide.traveltime);
                if (updatedRide.status === 'InProgress') {
                    setRideStatus(updatedRide.status);
                    setRideDetails(updatedRide);
                }
            };

            return () => {
                ws.close();
            };
        }
    }, [rideStatus, token?.token]);

    if (rideStatus === 'Done') {
        return (
            <div>
                <h3>Ride Completed!</h3>
                <RideRating />
            </div>
        );
    }

    if (rideStatus === 'Waiting') {
        return (
            <div>
                <h3>Your ride is waiting for a driver...</h3>
            </div>
        );
    }

    if (rideStatus === 'InProgress' && rideDetails) {
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
            <h2 className='text-xl mb-4'>New Ride</h2>
            <form onSubmit={handleSubmit} className='mx-auto mb-4 mt-8 max-w-md space-y-4'>
                <div className='relative space-y-4'>
                    <label>
                        Starting Address
                    </label>
                    <div className='relative'>
                        <input type='text' autoFocus value={rideModel.startaddress} onChange={(e)=> handleChange(e, "startaddress")} className='w-full rounded-lg border-2 p-3' placeholder='Starting Address'/>
                    </div>
                    <label>
                        Destination Address
                    </label>
                    <div className='relative'>
                        <input type='text' value={rideModel.destaddress} onChange={(e)=>handleChange(e, "destaddress")} className='w-full rounded-lg border-2 p-3' placeholder='Destination Address'/>
                    </div>
                    <div className='flex items-center justify-between'>
                        <button type='submit' className='select-none rounded-lg p-3 bg-lime-600'>
                            Calculate Time and Price
                        </button>
                    </div>
                </div>
            </form>
            {rideEstimate && (
                <div className='mt-4'>
                    <h3 className='text-lg font-bold'>Ride Estimate</h3>
                    <p>Distance: {rideEstimate.distance.toFixed(2)} km</p>
                    <p>Travel Time: {rideEstimate.traveltime}</p>
                    <p>Price: {rideEstimate.price.toFixed(2)} din</p>
                    <div className='flex items-center justify-between'>
                        <button onClick={handleConfirmRide} className='select-none rounded-lg p-3 bg-lime-600'>
                            Confirm Ride
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewDrivePanel;