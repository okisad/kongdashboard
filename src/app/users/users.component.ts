import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {IndexApiService} from "../services/index.api.service";
import {ToastrService} from "ngx-toastr";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkJoin";
import {KongConsumer} from "../kongconsumer";
import {KongApi} from "../kongapi";
import {KongPlugin} from "../kongplugin";
import {KongRateLimit} from "../kongratelimit";


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  controlButtons = {
    "createKongConsumersRateLimitButton": false,
    "deleteKongConsumersRateLimitButton": false,
    "createKongConsumersTokenButton": false,
    "deleteKongConsumersTokenButton": false,
  };

  kongConsumers;
  users: KongConsumer[];
  foundedUsers: KongConsumer[] = [];
  selected: KongConsumer[] = [];
  filterText;
  selectAll = false;
  apiId;
  tokenMessage = "ok";
  newUsername: string;
  kongApi: KongApi;
  newRateLimit = {
    second:null,
    minute:null,
    hour:null,
    day:null,
    month:null,
    year:null
  };
  groups:KongPlugin[];


  constructor(private router: ActivatedRoute, private indexService: IndexApiService, private toastr: ToastrService) {
    this.router.params.subscribe(params => {
      if (params.id){
        this.indexService.getApi(params.id)
          .subscribe(r => {
            this.kongApi = r;
            this.fetchUsers();
          }, error2 => this.toastr.error(JSON.stringify(error2)));
      }else{
        this.indexService.getKongConsumers().subscribe(p => {
          this.foundedUsers = p.data;
          this.foundedUsers.forEach(p => p["checked"] = false);
          this.foundedUsers.forEach(p => p["rateConfig"] = "Loading...");
        });
      }
    });
  }

  ngOnInit() {
    this.indexService.getKongPluginsByPluginName("acl")
      .subscribe(r => {
        this.groups = r.data;
      },error2 => this.toastr.error(JSON.stringify(error2)))
  }

  fetchUsers() {
    this.indexService.getKongConsumers().subscribe(p => {
      this.users = p.data;
      this.indexService.getConsumersByAcl(this.kongApi.name)
        .subscribe(r => {
          console.log(r);
          this.users.forEach(user => {
            var founded = r.data.find(acl => user.id === acl.consumer_id);
            if (founded){
              user.group = founded.group;
              this.foundedUsers.push(user);
            }
          });
        });
      this.foundedUsers.forEach(p => p["checked"] = false);
      this.foundedUsers.forEach(p => p["rateConfig"] = "Loading...");
    });
  }

  onGroupChange(consumerId,groupName){
    this.indexService.getAclsByConsumer(consumerId)
      .subscribe(r => {
        if (r.data.length <= 0) {
          this.indexService.addConsumerAcl(consumerId,groupName).subscribe(r => {
            if (r)
              this.toastr.success("Consumer acl eklendi","Başarılı");
            else
              this.toastr.error("Consumer acl eklenemedi","Hata");
          },error2 => this.toastr.error(JSON.stringify(error2)))
        } else {
          let observableBatch = [];
          r.data.forEach(acl => observableBatch.push(this.indexService.removeAclGroupConsumers(consumerId,acl.id)));
          Observable.forkJoin(observableBatch).subscribe(r => {
            console.log(r);
            this.indexService.addConsumerAcl(consumerId,groupName).subscribe(r => {
              if (r)
                this.toastr.success("Consumer acl eklendi","Başarılı");
              else
                this.toastr.error("Consumer acl eklenemedi","Hata");
            },error2 => this.toastr.error(JSON.stringify(error2)))
          },error2 => this.toastr.error(JSON.stringify(error2)));
        }
      },error2 => this.toastr.error(JSON.stringify(error2)))
  }

  deleteConsumer(consumer: KongConsumer) {
    this.indexService.deleteKongConsumer(consumer.username)
      .subscribe(r => {
        if (r === 204) {
          this.toastr.success("Consumer Silindi", "Başarılı");
          this.fetchUsers();
        }
        else
          this.toastr.success("Consumer Silinemedi", "Hata");
      }, error2 => this.toastr.error(JSON.stringify(error2)));
  }

  addKongConsumer(username) {
    this.indexService.addKongConsumer(username)
      .subscribe(r => {
        if (r === 201) {
          this.toastr.success("Consumer Yaratıldı", "Başarılı");
          this.fetchUsers();
        }
        else
          this.toastr.error("Consumer Yaratılamadı", "Hata");
      }, error2 => this.toastr.error(JSON.stringify(error2)))
  }


  /*controlConsumerIds(buttonName) {
    this.indexService.getKongConsumers().then(r => {
      this.kongConsumers = r;
      for(let user of this.users){
        this.selected = this.selected.filter(p => p.id !== user.id);
        user["checked"] = false;
        for (let kongConsumer of this.kongConsumers){
          if (user.userName === kongConsumer.username) {
            user["consumerId"] = kongConsumer.id;
            break;
          } else {
            delete user["consumerId"];
          }
        }
      }
      this.controlButtons[buttonName] = false;
      console.log(this.users);
    }).catch(e => {
      console.log(e);
      this.controlButtons[buttonName] = false;
    });
  }*/


  deleteKongConsumers() {
    /*this.controlButtons.deleteKongConsumersButton = true;
    var i = 0;
    this.selected.forEach(user => {
      this.indexService.deleteKongConsumer(user.userName).subscribe(b => {
        i++;
        if (b === 204) {
          console.log(user.userName + " Kong Consumer is deleted");
          //this.notificationService.success("Success",user.userName + "Kong Consumer is deleted");
        }

        if (i === this.selected.length) {
          this.controlConsumerIds("deleteKongConsumersButton");
          i = 0;
        }
      },error2 => console.log(error2));
    });*/
  }

  createKongConsumersRateLimit(){
    this.controlButtons.createKongConsumersRateLimitButton = true;
    var rateLimit:KongRateLimit = new KongRateLimit();
    rateLimit.api_id = this.kongApi.id;
    rateLimit.second = this.newRateLimit["second"];
    rateLimit.minute = this.newRateLimit["minute"];
    rateLimit.hour = this.newRateLimit["hour"];
    rateLimit.day = this.newRateLimit["day"];
    rateLimit.month = this.newRateLimit["month"];
    rateLimit.year = this.newRateLimit["year"];
    var i = 0;
    this.selected.forEach(user => {
      rateLimit.consumer_id = user.id;
      this.indexService.addRateLimit(rateLimit)
        .subscribe(r => {
          i++;
          if (r === 201){
            this.toastr.success(user.username + " için rate limit belirlendi.","Başarılı");
          }else if(r=== 409){
            this.toastr.error(user.username + " için rate limit zaten mevcut.","Hata");
          }
          if (i === this.selected.length){
            this.controlButtons.createKongConsumersRateLimitButton = false;
          }
        },error2 => this.toastr.error(JSON.stringify(error2),"Hata"));
    })
  }

  deleteKongConsumersRateLimit(){
    this.controlButtons.deleteKongConsumersRateLimitButton = true;
    var i = 0;
    this.selected.forEach(user => {
      this.indexService.getConsumerRateLimiting(user.username)
        .subscribe(r => {
          if (r.data.length > 0){
            this.indexService.deleteConsumerRateLimiting(user.username,r.data[0].id)
              .subscribe(r => {
                i++;
                if (r == 204){
                  this.toastr.success(user.username + " için rate limiting silindi","Başarılı");
                }else {
                  this.toastr.error(user.username + " için rate limiting silinemedi","Hata");
                }
                if (this.selected.length === i){
                  this.controlButtons.deleteKongConsumersRateLimitButton = false;
                }
              },error2 => {
                this.toastr.error(JSON.stringify(error2),"Hata");
                this.controlButtons.deleteKongConsumersRateLimitButton = false;
              })
          }
        },error2 => {
          this.toastr.error(JSON.stringify(error2),"Hata");
          this.controlButtons.deleteKongConsumersRateLimitButton = false;
        })
    })
  }

  createKongConsumersToken() {
    this.controlButtons.createKongConsumersTokenButton = true;
    var i = 0;

    this.selected.forEach(user => {
      this.indexService.getUserKeyAuth(user.username)
        .subscribe(userKeys => {
          i++;
          if (userKeys.data.length === 0) {
            this.indexService.addConsumerKeyAuth(user.username).subscribe(b => {
              if (b) {
                this.toastr.success("Key Yaratıldı", "Başarılı");
              } else {
                this.toastr.info("Key Yaratılamadı", "Hata");
              }
            }, error2 => {
              this.toastr.error(JSON.stringify(error2));
              this.controlButtons.createKongConsumersTokenButton = false;
            });
          }
          if (i === this.selected.length) {
            this.controlButtons.createKongConsumersTokenButton = false;
            i = 0;
          }
        },error2 =>  {
          this.toastr.error(JSON.stringify(error2),"Hata");
          this.controlButtons.createKongConsumersTokenButton = false;
        });
    });
  }

  deleteKongConsumersToken() {
    this.controlButtons.deleteKongConsumersTokenButton = true;
    this.selected.forEach(user => {
      this.indexService.getUserKeyAuth(user.username)
        .subscribe(response => {
          response.data.forEach(key => {
            this.indexService.deleteConsumerKeyAuth(user.username, key.id)
              .subscribe(r => {
                if (r === 204) {
                  this.toastr.success(user.username + " için key silindi", "Başarılı");
                } else {
                  this.toastr.error(user.username + " için key silinemedi", "Hata");
                }
              }, error2 => {
                this.controlButtons.deleteKongConsumersTokenButton = false;
                this.toastr.error(JSON.stringify(error2), "Hata");
              })
          })
        }, error2 => {
          this.controlButtons.deleteKongConsumersTokenButton = false;
          this.toastr.error(JSON.stringify(error2), "Hata");
        });
      this.controlButtons.deleteKongConsumersTokenButton = false;
    });
  }


  showConfig(user) {
    /*
        console.log(user);

        this.kongApiService.getKongPugins(this.apiId).then(r => {
          r.forEach(plugin => {
            if (plugin.name === "rate-limiting" && plugin.consumerId === user.consumerId) {
              user["rateConfig"] = plugin.config;
            }
          });
        });*/
  }


  showToken(user, popover) {
    if (!popover.isOpen()) {
      user["tokenMessage"] = "Loading...";
      user["token"] = "";
      this.indexService.getUserKeyAuth(user.username).subscribe(r => {
        if (r.data.length > 0) {
          user["token"] = r.data[0].key;
          delete user["tokenMessage"];
        } else {
          user["tokenMessage"] = "No Key";
        }
      }, error2 => this.toastr.error(JSON.stringify(error2)));
    } else {
      delete user["token"];
    }
  }

  showRateLimiting(user:KongConsumer,popover){
    if (!popover.isOpen()) {
      user["rateLimitingMessage"] = "Loading...";
      delete user["ratelimiting"];
      this.indexService.getConsumerRateLimiting(user.username).subscribe(r => {
        if (r.data.length > 0) {
          var config = {};
          config["second"] = r.data[0].config["second"];
          config["minute"] = r.data[0].config["minute"];
          config["hour"] = r.data[0].config["hour"];
          config["day"] = r.data[0].config["day"];
          config["month"] = r.data[0].config["month"];
          config["year"] = r.data[0].config["year"];
          user["ratelimiting"] = config;
          console.log(user["ratelimiting"]);
          delete user["rateLimitingMessage"];
        } else {
          user["rateLimitingMessage"] = "Rate Limit Belirlenmemiş";
        }
      }, error2 => this.toastr.error(JSON.stringify(error2)));
    } else {
      delete user["token"];
    }
  }

  hideToken(user) {
    //delete user["token"];
  }

  onSelect(user) {

    if (user.checked) {
      this.selected.push(user);
    } else {
      this.selected = this.selected.filter(p => p.id !== user.id);
    }

    if (this.selected.length === this.users.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    console.log(this.selected);

  }

  onSelectAll() {
    if (this.selectAll)
      this.users.forEach(p => p["checked"] = true);
    else
      this.users.forEach(p => p["checked"] = false);
  }


}
