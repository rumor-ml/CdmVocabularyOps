import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'debug/docs/:collection',
    loadComponent: () => import('./debug/fixtures/fixtures.component').then(mod => mod.FixturesComponent),
  },
  {
    path: '',
    loadComponent: () => import('./vocabularies/vocabularies.component').then(mod => mod.VocabulariesComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
