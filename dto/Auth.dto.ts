import { CustomerPayload } from "./Customer.dto";
import { vandorPayload } from "./Vandor.dto";

export type AuthPayload = vandorPayload | CustomerPayload;
