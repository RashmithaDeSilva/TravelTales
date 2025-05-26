import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    loadComponent: () => {
        return import('./home/home.component').then((module) => module.HomeComponent);
    },
},
{
    path: 'login',
    pathMatch: 'full',
    loadComponent: () => {
        return import('./login/login.component').then((module) => module.LoginComponent);
    },
},
{
    path: 'singin',
    pathMatch: 'full',
    loadComponent: () => {
        return import('./singin/singin.component').then((module) => module.SinginComponent);
    },
},];
