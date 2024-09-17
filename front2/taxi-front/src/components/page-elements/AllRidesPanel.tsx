import React, {useEffect, useState} from "react";
import useAuth from "../contexts/useAuth";
import IRideDetails from "../interfaces/IRideDetails";
import { getAllRides } from "../services/PreviousRidesService";

const AllRidesPanel: React.FC = () => {
    const [allRides, setAllRides] = useState<IRideDetails[]>([]);
    const{token} = useAuth();

    useEffect(() => {

        const fetchAllRides = async () => {
            if(token?.token){
                const rides = await getAllRides(token?.token);
                setAllRides(rides);
            }
        };

        fetchAllRides();
    }, [token?.token]);

    return(
        <div>
            <h2 className='text-xl mb-4'>All Rides</h2>
            <ul>
                {allRides.map(ride => (
                    <li className='flex justify-between items-center p-2 bg-white mb-2 rounded shadow'>
                        <span>{ride.driver}</span>
                        <span>{ride.startaddress}</span>
                        <span>{ride.destaddress}</span>
                        <span>{ride.price}</span>
                        <span>{ride.distance}</span>
                        <span>{ride.rating}</span>
                        <span>{ride.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllRidesPanel;