import {Component, OnInit} from '@angular/core';
import {IndexApiService} from "../services/index.api.service";
import {ToastrService} from "ngx-toastr";
import {KongApi} from "../kongapi";
import {KongPlugin} from "../kongplugin";
import {KongRateLimit} from "../kongratelimit";

@Component({
  selector: 'app-apis',
  templateUrl: './apis.component.html',
  styleUrls: ['./apis.component.css']
})
export class ApisComponent implements OnInit {

  kongApis: KongApi[];
  newKongApi: KongApi = new KongApi();
  keyAuths: KongPlugin[];
  rateLimits: KongPlugin[];
  newRateLimit = {};
  upstreams = [];

  constructor(private indexService: IndexApiService, private toastr: ToastrService) {
  }

  ngOnInit() {
    this.getApis();
    this.getUpstreams();
  }

  getUpstreams() {
    this.indexService.getUpstreams(100)
      .subscribe(r => this.upstreams = r.data, error2 => this.toastr.error("Upstreams alınamadı", "Hata"));
  }

  saveKongRateLimit(kongApi: KongApi) {
    var rateLimit: KongRateLimit = new KongRateLimit();
    rateLimit.api_id = kongApi.id;
    rateLimit.second = this.newRateLimit["second"];
    rateLimit.minute = this.newRateLimit["minute"];
    rateLimit.hour = this.newRateLimit["hour"];
    rateLimit.day = this.newRateLimit["day"];
    rateLimit.month = this.newRateLimit["month"];
    rateLimit.year = this.newRateLimit["year"];
    this.indexService.addRateLimit(rateLimit)
      .subscribe(r => {
        if (r === 201) {
          this.toastr.success("Rate Limit Yaratıldı", "Başarılı");
          this.getApis();
        } else
          this.toastr.error("Rate Limit Yaratılamadı", "Hata");
      }, error2 => this.toastr.error(JSON.stringify(error2), "Hata"));
  }

  getApis() {
    this.indexService.getApis().subscribe(r => {
      this.kongApis = r.data;
      this.indexService.getKongPluginsByPluginName("key-auth").subscribe(ka => {
        this.kongApis.forEach(api => {
          this.keyAuths = ka.data;
          let foundedKeyAuth = this.keyAuths.filter(plugin => plugin.api_id === api.id);
          if (foundedKeyAuth.length > 0)
            api.hasKeyAuth = true;
          else
            api.hasKeyAuth = false;
        })
      });
      this.indexService.getKongPluginsByPluginName("rate-limiting").subscribe(ka => {
        this.kongApis.forEach(api => {
          this.rateLimits = ka.data;
          let foundedRateLimit = this.rateLimits.find(plugin => plugin.api_id === api.id && !plugin.consumer_id);
          if (foundedRateLimit) {
            api.hasRateLimiting = true;
            api.rateLimitConfig = foundedRateLimit;
            console.log(api.rateLimitConfig);
          }
          else
            api.hasRateLimiting = false;
        })
      });
      this.indexService.getKongPluginsByPluginName("acl").subscribe(acl => {
        this.kongApis.forEach(api => {
          let foundedAcl = acl.data.find(plugin => plugin.api_id === api.id);
          if (foundedAcl) {
            api.hasAcl = true;
            api.acl = foundedAcl;
          }
          else
            api.hasAcl = false;
        })
      })
    });
  }

  deletePlugin(kongApi: KongApi) {
    this.indexService.deletePlugin(kongApi.id, kongApi.rateLimitConfig.id)
      .subscribe(p => {
        if (p === 204) {
          this.toastr.success("Rate Limit Kaldırıldı", "Başarılı");
          kongApi.rateLimitConfig = null;
          kongApi.hasRateLimiting = false;

        } else
          this.toastr.error("Rate Limit Kaldırılamadı", "Hata");
      })
  }

  toggleKeyAuth(api, toggle) {
    if (toggle) {
      let keyAuth = this.keyAuths.find(plugin => plugin.api_id === api.id);
      this.indexService.deletePlugin(keyAuth.api_id, keyAuth.id)
        .subscribe(response => {
          if (response == 204) {
            this.toastr.success("Plugin Kaldırıldı", "Başarılı");
            this.getApis();
          }
          else
            this.toastr.error("Plugin Kaldırılamadı", "Hata");
        }, error2 => this.toastr.error(JSON.stringify(error2)))
    } else {
      this.indexService.addKeyAuthPlugin(api.id)
        .subscribe(r => {
          if (r == 201) {
            this.toastr.success("Plugin Eklendi", "Başarılı");
            this.getApis();
          }
          else
            this.toastr.error("Plugin Eklenemedi", "Hata");
        }, error2 => this.toastr.error(JSON.stringify(error2), "Hata"))
    }
  }

  toggleRateLimiting(kongApi: KongApi) {
    if (kongApi.rate_config_screen)
      kongApi.rate_config_screen = false;
    else
      kongApi.rate_config_screen = true;
  }

  toggleAclApi(kongApi: KongApi) {
    if (!kongApi.hasAcl) {
      this.indexService.createAclGroup(kongApi.id, kongApi.name)
        .subscribe(r => {
          if (r == 201) {
            this.toastr.success("Acl Eklendi", "Başarılı");
          } else {
            this.toastr.error("Acl Eklenemedi", "Hata");
          }
          this.getApis();
        }, error2 => this.toastr.error(JSON.stringify(error2)));
    } else {
      this.indexService.removeAclGroup(kongApi.id, kongApi.acl.id)
        .subscribe(r => {
          if (r == 204) {
            this.toastr.success("Acl Silindi", "Başarılı");
          } else {
            this.toastr.error("Acl Silinemedi", "Hata");
          }
          this.getApis();
        }, error2 => this.toastr.error(JSON.stringify(error2)));
    }
  }

  deleteApi(apiId) {
    this.indexService.deleteApi(apiId)
      .subscribe(r => {
        if (r == 204) {
          this.toastr.success("Api Silindi", "Başarılı");

        }
        else
          this.toastr.error("Api Silinemedi", "Hata");

        this.getApis();
      }, error2 => this.toastr.error(error2.toString(), "Hata"))
  }

  saveKongApi() {
    var upstream = this.newKongApi.upstream_url;
    if (!upstream.startsWith("http://"))
      upstream = "http://" + upstream;
    this.indexService.saveApi(this.newKongApi.name, this.newKongApi.hosts, this.newKongApi.uris, upstream)
      .subscribe(r => {
        if (r) {
          this.toastr.success("Api Oluşuturuldu", "Başarılı");
          this.indexService.createAclGroup(r.id, r.name).subscribe(r => {
            if (r == 201)
              this.toastr.success("Acl Oluşuturuldu", "Başarılı");
            else
              this.toastr.error("Acl Oluşturulamadı", "Hata");
          }, error2 => this.toastr.error(JSON.stringify(error2), "Hata"))
        }
        else
          this.toastr.error("Api Oluşturulamadı", "Hata");

        this.getApis();

      }, error2 => this.toastr.error(JSON.stringify(error2), "Hata"))
  }

}
