import {KongPlugin} from "./kongplugin";

export class KongApi{
  created_at:number;
  strip_uri:boolean;
  id:string;
  name:string;
  http_if_terminated:boolean;
  https_only:boolean;
  upstream_url:string;
  uris:string[];
  hosts:string[];
  preserve_host:boolean;
  upstream_connect_timeout:number;
  upstream_read_timeout:number;
  upstream_send_timeout:number;
  retries:number;
  rateLimitConfig:KongPlugin;
  acl:KongPlugin;
  hasKeyAuth:boolean = false;
  hasRateLimiting:boolean = false;
  hasAcl:boolean = false;
  rate_config_screen=false;
  upstream_urlOption:string;
}
