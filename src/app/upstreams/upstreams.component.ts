import {Component, OnInit} from "@angular/core";
import {IndexApiService} from "../services/index.api.service";
import {ToastrService} from "ngx-toastr";
import {Upstream} from "../upstream";

@Component({
  selector: 'app-upstreams',
  templateUrl: './upstreams.component.html',
  styleUrls: ['./upstreams.component.css']
})
export class UpstreamsComponent implements OnInit {

  upstreams: Upstream[];
  newUpstream = {
    name:null,
    target1:null,
    weight1:null,
    target2:null,
    weight2:null
  };
  addNewUpstreamButtonEnabled = true;

  constructor(private indexService: IndexApiService,private toastr: ToastrService) {
    this.ngOnInit();
  }

  ngOnInit() {
    this.getUpstreams();
  }

  getUpstreams(){
    this.indexService.getUpstreams(100).subscribe(
      r => {
        this.upstreams = r.data;
        this.upstreams.forEach(upstream => {
          this.indexService.getUpstreamTargets(upstream.name).subscribe(t => {
            upstream.apis = t.data;
          })
        })
      });
  }

  deleteUpstream(upstream:Upstream){
    this.indexService.deleteUpstream(upstream.name)
      .subscribe(r => {
        if (r === 204){
          this.toastr.success("Upstream silinmiştir","Başarılı");
        }else {
          this.toastr.error("Upstream silinememiştir","Hata");
        }
        this.getUpstreams();
      },error2 => this.toastr.error(JSON.stringify(error2)))
  }

  createUpstream(){
    this.addNewUpstreamButtonEnabled = false;
    if (this.newUpstream["name"]){
      this.indexService.addUpstream(this.newUpstream["name"])
        .subscribe(upstream  => {
          if (upstream){
            if (this.newUpstream["target1"] && this.newUpstream["weight1"]){
              this.indexService.addTargetToUpstream(upstream.name,this.newUpstream["target1"],this.newUpstream["weight1"])
                .subscribe(r => {
                  if (r === 201){
                    this.toastr.success("Target "+ upstream.name + " için yaratıldı","Başarılı");
                  }else {
                    this.toastr.error("Target "+ upstream.name + " için yaratılamadı","Hata");
                  }
                  this.addNewUpstreamButtonEnabled = true;
                  this.getUpstreams();
                  this.newUpstream = {
                    name:null,
                    target1:null,
                    weight1:null,
                    target2:null,
                    weight2:null
                  };
                },error2 => {this.toastr.error(JSON.stringify(error2),"Hata");this.addNewUpstreamButtonEnabled = true;});
            }
            if (this.newUpstream["target2"] && this.newUpstream["weight2"]){
              this.indexService.addTargetToUpstream(upstream.name,this.newUpstream["target2"],this.newUpstream["weight2"])
                .subscribe(r => {
                  if (r === 201){
                    this.toastr.success("Target "+ upstream.name + " için yaratıldı","Başarılı");
                  }else {
                    this.toastr.error("Target "+ upstream.name + " için yaratılamadı","Hata");
                  }
                  this.addNewUpstreamButtonEnabled = true;
                  this.getUpstreams();
                  this.newUpstream = {
                    name:null,
                    target1:null,
                    weight1:null,
                    target2:null,
                    weight2:null
                  };
                },error2 => {this.toastr.error(JSON.stringify(error2),"Hata");this.addNewUpstreamButtonEnabled = true;});
            }
            if (!this.newUpstream["target2"] && !this.newUpstream["target1"])
              this.addNewUpstreamButtonEnabled = true;
            this.toastr.success(upstream.name + " yaratıldı","Başarılı");
            this.getUpstreams();
          }else {
            this.toastr.error("Upstream Yaratılamadı","Hata");
            this.addNewUpstreamButtonEnabled = true;
          }
        },error2 => {this.toastr.error(JSON.stringify(error2),"Hata");this.addNewUpstreamButtonEnabled = true;})


    }else {
      this.toastr.error("İsim Alanı Doldurulmalı","Hata");
    }

  }




}
