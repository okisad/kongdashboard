import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {UsersComponent} from "./users/users.component";
import {NavigationComponent} from "./navigation/navigation.component";
import {ApisComponent} from "./apis/apis.component";
import {UpstreamsComponent} from "./upstreams/upstreams.component";

const appRoutes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: '',
        component: ApisComponent
      },{
        path:'upstreams',
        component: UpstreamsComponent
      },{
        path:'users/:id',
        component: UsersComponent
      },{
        path:'users',
        component: UsersComponent
      }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes,{useHash: true});
