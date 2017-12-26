import { Component, OnInit } from '@angular/core';
import {IndexApiService} from "../services/index.api.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  routeUrl:string;

  constructor(private apiService:IndexApiService,private router: Router,private route:ActivatedRoute, private toastr: ToastrService) {
    console.log(this.router.url);
    router.events.subscribe(event => {

      if (event instanceof NavigationEnd ) {
        console.log("current url",event.url);
        let elements = document.getElementsByClassName('nav-item');
        for (let i = 0;i<elements.length;i++){
          elements[i].classList.remove('active');
        }
        if(event.url=="/marked")
          elements[1].classList.add('active');
        else
          elements[0].classList.add('active');
      }
    },error2 => {
      this.toastr.error(error2,"Hata");
    });
  }

  ngOnInit() {
  }

  /*logout() {
    this.apiService.logout().subscribe(p => {
      console.log(p);
      if (p.status == 200) {
        localStorage.removeItem("user");
        this.router.navigate(['/login']);
        this.toastr.success("Çıkış Başarılı","Başarılı");
      }
    },error2 => {
      this.toastr.error(error2,"Hata");
    });
  }
*/
  nav(a){
    let elements = document.getElementsByClassName('nav-item');
    for (let i = 0;i<elements.length;i++){
      elements[i].classList.remove('active');
    }
    a.target.parentNode.classList.add('active');
  }
}
