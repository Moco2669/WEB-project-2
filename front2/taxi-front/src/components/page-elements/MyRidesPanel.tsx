import React, {useEffect, useState} from "react";
import useAuth from "../contexts/useAuth";
import IRideDetails from "../interfaces/IRideDetails";
import { getMyRides } from "../services/PreviousRidesService";

const MyRidesPanel: React.FC = () => {
    const[myRides, setMyRides] = useState<IRideDetails[]>([]);
    const {token} = useAuth();

    useEffect(() => {

        const fetchMyRides = async () => {
            if(token?.token){
                const rides = await getMyRides(token?.token);
                setMyRides(rides);
            }
        };

        fetchMyRides();
    }, [token?.token]);
    return(
        <div>
        <h2 className='text-xl mb-4'>My Rides</h2>
        <ul>
            {myRides.map(ride => (
                <li className='flex justify-between items-center p-2 bg-white mb-2 rounded shadow'>
                    <span>{ride.user}</span>
                    <span>{ride.startaddress}</span>
                    <span>{ride.destaddress}</span>
                    <span>{ride.price}</span>
                    <span>{ride.distance}</span>
                    <span>{ride.rating}</span>
                </li>
            ))}
        </ul>
    </div>
    );
};

export default MyRidesPanel;