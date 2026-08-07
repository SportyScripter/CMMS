export interface User {
    id : number;
    sap_number: string;
    name : string;
    lastname : string,
    role_id : number,
    is_active : boolean,
    role: Role;
}

export interface Role {
    id : number;
    name : string;
    description?: string;
}
