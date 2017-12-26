import {Target} from "./target";

export class Upstream{
  id:string;
  name:string;
  slots:number;
  created_at:number;
  apis:Target[];
}
