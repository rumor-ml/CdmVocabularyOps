import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocsMock } from './docs-mock.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    NavigationComponent,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [
    {provide: 'DocsToken', useClass: DocsMock},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
