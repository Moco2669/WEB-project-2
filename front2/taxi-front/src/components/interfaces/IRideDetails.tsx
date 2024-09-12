import IRideEstimate from "./IRideEstimate";

interface IRideDetails extends IRideEstimate {
    starttime:string;
    driverarrivetime:string;
    //traveltime:TimeRanges;
    arrivetime:string;
};

export default IRideDetails;