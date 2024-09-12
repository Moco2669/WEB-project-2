import React, {useState, useEffect} from 'react';

interface CountdownTimerProps {
    starttime: string;
    driverarrivetime: string;
    traveltime: string;
}

const calculateTimeRemaining = (targetTime: string): number => {
    const target = new Date(targetTime).getTime();
    const now = Date.now();
    return Math.max(target - now, 0);
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ starttime, driverarrivetime, traveltime }) => {
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
        const startDate = new Date(starttime).getTime();
        const driverArrivalMs = parseTimeSpanToMs(driverarrivetime);
        return startDate + driverArrivalMs;
    };

    const getTravelEndTime = () => {
        const arrivalTime = getArrivalTime();
        const travelTimeMs = parseTimeSpanToMs(traveltime);
        return arrivalTime + travelTimeMs;
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now() + 7200000;
            const razlika = now - (new Date(starttime).getTime());
            console.log("RAZLIKA " + razlika);
            if (phase === 'arrive') {
                const arrivalTime = getArrivalTime();
                const timeUntilArrival = Math.max(arrivalTime - now, 0);
                console.log("RAZLIKA " + razlika);
                if (timeUntilArrival === 0) {
                    setPhase('travel');
                }

                setTimeLeft(timeUntilArrival);
            } else if (phase === 'travel') {
                const travelEndTime = getTravelEndTime();
                const timeUntilTravelEnd = Math.max(travelEndTime - now, 0);

                setTimeLeft(timeUntilTravelEnd);
            }
        };

        const intervalId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(intervalId);
    }, [phase, starttime, driverarrivetime, traveltime]);

    const minutes = Math.floor(timeLeft / 1000 / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <div>
            {phase === 'arrive' ? (
                <p>Driver will arrive in: {minutes} minutes, {seconds} seconds</p>
            ) : (
                <p>Time remaining to destination: {minutes} minutes, {seconds} seconds</p>
            )}
        </div>
    );
};   
    /* const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining(targetTime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeRemaining(targetTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime]);

    const minutes = Math.floor(timeLeft / 1000 / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <div>
            <p>Driver will arrive in: {minutes} minutes, {seconds} seconds</p>
        </div>
    );
};
*/
export default CountdownTimer;