import { RouterModule, Routes } from '@angular/router';
import { Home } from './components/home/home';
import { About } from './components/about/about';
import { Destination } from './components/destination/destination';
import { Hotel } from './components/hotel/hotel';
import { Contact } from './components/contact/contact';
import { HotelDetail } from './components/hotel-detail/hotel-detail';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'about', component: About },
    { path: 'destination', component: Destination },
    { path: 'hotel/:id', component: HotelDetail },  // dynamic route FIRST
    { path: 'hotel', component: Hotel },           // static route SECOND
    { path: 'contact', component: Contact },
];
import { RouteReuseStrategy, ActivatedRouteSnapshot } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean { return false; }
  store(route: ActivatedRouteSnapshot, handle: any): void {}
  shouldAttach(route: ActivatedRouteSnapshot): boolean { return false; }
  retrieve(route: ActivatedRouteSnapshot): any { return null; }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Only reuse the route if the URL is exactly the same
    return future.routeConfig === curr.routeConfig && JSON.stringify(future.params) === JSON.stringify(curr.params);
  }
}

