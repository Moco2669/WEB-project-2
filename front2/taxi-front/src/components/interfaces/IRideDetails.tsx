import IRideEstimate from "./IRideEstimate";

interface IRideDetails extends IRideEstimate {
    starttime:string;
    driverarrivetime:string;
    //traveltime:TimeRanges;
    arrivetime:string;
    driver:string;
    user:string;
    rating:number;
};

export default IRideDetails;