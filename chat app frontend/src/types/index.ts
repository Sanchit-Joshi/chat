export interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    roomId: string;
  }
  
  export interface User {
    id: string;
    email: string;
  }
  
  export interface Room {
    id: string;
    name: string;
  }