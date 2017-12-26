import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {KongApis} from "../kongapis";
import {KongApi} from "../kongapi";
import {ConsumerAcls} from "../consumeracls";
import {ConsumerAcl} from "../consumeracl";
import {KongPlugins} from "../kongplugins";
import {Upstreams} from "../upstreams";
import {Targets} from "../targets";
import {KongConsumers} from "../kongconsumers";
import {KongRateLimit} from "../kongratelimit";
import {KongConsumerKey} from "../kongconsumerkey";
import {KongKeyAuthConsumers} from "../kongkeyauthconsumers";
import {Upstream} from "../upstream";

@Injectable()
export class IndexApiService {

  private kongUrl = "";

  private baseUrlPredictCitizen = 'api/predict-citizen/';
  private baseMongoUrlControlCitizen = 'api/mongo-control-citizen/';
  private baseCategory = 'api/category';

  constructor(private http: Http) {
  }

  public getApis(): Observable<KongApis> {
    var url = this.kongUrl + "/apis";
    return this.http.get(url)
      .map(response => response.json())
      .catch((error: any) => Observable.throw("Apiler Alınırken Hata Oluştu"));
  }

  public getApi(apiId): Observable<KongApi> {
    var url = this.kongUrl + "/apis/" + apiId;
    return this.http.get(url)
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public deleteApi(apiId): Observable<number> {
    var url = this.kongUrl + "/apis/" + apiId;
    return this.http.delete(url)
      .map(r => r.status)
      .catch((error: any) => Observable.throw("Api Silinirken Hata Oluştu"));
  }

  public saveApi(name, host, uri, upstream_url): Observable<KongApi> {
    var url = this.kongUrl + "/apis";
    var req = "";
    if (name)
      req = "name=" + name;
    if (host)
      req = req + "&hosts=" + host;
    if (uri)
      req = req + "&uris=" + uri;
    if (upstream_url)
      req = req + "&upstream_url=" + upstream_url;
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));

  }

  createAclGroup(apiId, groupName): Observable<number> {
    var url = this.kongUrl + "/apis/" + apiId + "/plugins";
    var req = "name=" + "acl";
    if (groupName)
      req = req + "&config.whitelist=" + groupName;
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  removeAclGroup(apiId,aclId): Observable<number> {
    var url = this.kongUrl + "/apis/" + apiId + "/plugins/"+aclId;
    return this.http.delete(url)
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  getConsumersByAcl(group):Observable<ConsumerAcls>{
    var url = this.kongUrl + "/acls?";
    if (group){
      url = url + "group="+group+"&";
    }
    return this.http.get(url)
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  getAclsByConsumer(consumerId):Observable<ConsumerAcls>{
    var url = this.kongUrl + "/consumers/" + consumerId + "/acls";
    return this.http.get(url)
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  removeAclGroupConsumers(consumerId,aclId):Observable<number>{
    var url = this.kongUrl + "/consumers/" + consumerId + "/acls/" + aclId;
    return this.http.delete(url)
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  addConsumerAcl(consumerId,groupName):Observable<ConsumerAcl>{
    var url = this.kongUrl + "/consumers/" + consumerId + "/acls";
    var req = "group="+groupName;
    return this.http.post(url,req,{headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(response => response.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public getKongPluginsByPluginName(pluginName): Observable<KongPlugins> {
    var url = this.kongUrl + "/plugins?name=" + pluginName;
    return this.http.get(url)
      .map(response => response.json())
      .catch((error: any) => Observable.throw("Pluginler Alınırken Hata Oluştu"));
  }

  public getUpstreams(number): Observable<Upstreams> {
    var url = this.kongUrl + "/upstreams?size=" + number;
    return this.http.get(url)
      .map(response => response.json())
      .catch((error: any) => Observable.throw("Upstreamler Alınırken Hata Oluştu"));
  }

  public getUpstreamTargets(upstreamName): Observable<Targets> {
    var url = this.kongUrl + "/upstreams/" + upstreamName + "/targets";
    return this.http.get(url)
      .map(response => response.json())
      .catch((error: any) => Observable.throw("Targetlar Alınırken Hata Oluştu"));
  }

  public getKongConsumers(): Observable<KongConsumers> {
    var url = this.kongUrl + "/consumers";
    return this.http.get(url)
      .map(response => response.json())
      .catch((error: any) => Observable.throw("Consumers Alınırken Hata Oluştu"));
  }

  public deleteKongConsumer(username): Observable<number> {
    var url = this.kongUrl + "/consumers/" + username;
    return this.http.delete(url)
      .map(response => response.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public addKongConsumer(username): Observable<number> {
    var url = this.kongUrl + "/consumers";
    var req = "username=" + username;
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(response => response.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public addKeyAuthPlugin(apiId): Observable<number> {
    var url = this.kongUrl + "/apis/" + apiId + "/plugins";
    var req = "name=key-auth";
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(response => response.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public deletePlugin(apiId, pluginId): Observable<number> {
    var url = this.kongUrl + "/apis/" + apiId + "/plugins/" + pluginId;
    return this.http.delete(url)
      .map(response => response.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public addRateLimit(kongRateLimit: KongRateLimit): Observable<number> {
    var url = this.kongUrl + "/apis/" + kongRateLimit.api_id + "/plugins";
    var req = "name=" + "rate-limiting";
    if (kongRateLimit.consumer_id)
      req = req + "&consumer_id=" + kongRateLimit.consumer_id;
    if (kongRateLimit.second)
      req = req + "&config.second=" + kongRateLimit.second;
    if (kongRateLimit.minute)
      req = req + "&config.minute=" + kongRateLimit.minute;
    if (kongRateLimit.hour)
      req = req + "&config.hour=" + kongRateLimit.hour;
    if (kongRateLimit.day)
      req = req + "&config.day=" + kongRateLimit.day;
    if (kongRateLimit.month)
      req = req + "&config.month=" + kongRateLimit.month;
    if (kongRateLimit.year)
      req = req + "&config.year=" + kongRateLimit.year;
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public deleteConsumerRateLimiting(username, rateLimitingId) {
    var url = this.kongUrl + "/consumers/" + username + "/plugins/" + rateLimitingId;
    return this.http.delete(url)
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public getConsumerRateLimiting(username): Observable<KongPlugins> {
    var url = this.kongUrl + "/consumers/" + username + "/plugins?name=rate-limiting";
    return this.http.get(url)
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public addConsumerKeyAuth(username): Observable<KongConsumerKey> {
    var url = this.kongUrl + "/consumers/" + username + "/key-auth/";
    var req = "";
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public getKeyAuths(): Observable<KongKeyAuthConsumers> {
    var url = this.kongUrl + "/key-auths";
    return this.http.get(url)
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public getUserKeyAuth(username): Observable<KongKeyAuthConsumers> {
    var url = this.kongUrl + "/consumers/" + username + "/key-auth";
    return this.http.get(url)
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public deleteConsumerKeyAuth(username, keyAuthId): Observable<number> {
    var url = this.kongUrl + "/consumers/" + username + "/key-auth/" + keyAuthId;
    return this.http.delete(url)
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }


  public addUpstream(name):Observable<Upstream> {
    var url = this.kongUrl + "/upstreams";
    var req = "name=" + name;
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(r => r.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  public addTargetToUpstream(upstreamName, target, weight) {
    var url = this.kongUrl + "/upstreams/" + upstreamName + "/targets";
    var req = "target="+target+"&weight="+weight;
    return this.http.post(url, req, {headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'})})
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  public deleteUpstream(upstreamName):Observable<number>{
    var url = this.kongUrl + "/upstreams/"+upstreamName;
    return this.http.delete(url)
      .map(r => r.status)
      .catch((error: any) => Observable.throw(error.json()));
  }

  /*public saveControlCitizenRequests(controlCitizenRequests:MongoControlCitizenRequest[]):Observable<MongoControlCitizenRequest[]>{
    var url = this.baseMongoUrlControlCitizen + "save-cititzens";
    var headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(url,controlCitizenRequests,options)
      .map(response => {
        return response.json();
      })
      .catch((error:any) => Observable.throw("Değişiklikler Kaydedilirken Hata Oluştu"));
  }


   logout():Observable<any>{
     return this.http.post("/logout",{}).map(p => {
       return p;
     }).catch((error:any) => Observable.throw("Çıkış Başarısız Oldu"));
   }
*/


}
