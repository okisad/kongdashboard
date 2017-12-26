import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {UsersComponent} from "./users/users.component";
import {FilterPipe} from "./filters/pipeFilter";
import {NavigationComponent} from "./navigation/navigation.component";
import {ToastrModule} from "ngx-toastr";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {routing} from "./app.routing";
import {ApisComponent} from "./apis/apis.component";
import {IndexApiService} from "./services/index.api.service";
import {UpstreamsComponent} from "./upstreams/upstreams.component";

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    UsersComponent,
    ApisComponent,
    UpstreamsComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    routing,
    HttpModule,
    FormsModule,
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [IndexApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
