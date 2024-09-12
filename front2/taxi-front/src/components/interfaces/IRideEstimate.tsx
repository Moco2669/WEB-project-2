import IRide from "./IRide";

interface IRideEstimate extends IRide {
    distance: number;
    traveltime: string;
    price: number;
    status: "Estimated" | "Waiting" | "InProgress" | "Done";
};

export default IRideEstimate;