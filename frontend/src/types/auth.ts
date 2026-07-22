export interface User {
    id : number;
    sap_number: string;
    name : string;
    lastname : string,
    role_id : number,
    is_active : boolean,
    role: {
    name: string;
  };
}