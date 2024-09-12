import React, {useEffect, useState} from 'react';
import IWaitingRide from '../interfaces/IWaitingRide';
import { getNewRides, acceptRide } from '../services/RideService';

interface NewRidesProps{
    token:string;
}

const NewRidesPanel: React.FC<NewRidesProps> = ({token}) => {
    const [newRides, setNewRides] = useState<IWaitingRide[]>([]);

    useEffect(() => {
        const fetchNewRides = async () => {
            const rides = await getNewRides(token);
            setNewRides(rides);
        };

        fetchNewRides();
        console.log(newRides);
    }, [token]);

    const handleTakeRide = async (user:string) => {
        try{
            const result = await acceptRide(token, user);
        } catch(error){
            console.warn(error);
        }
    }

    return (
        <div>
            <h2 className='text-xl mb-4'>Unverified Users</h2>
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