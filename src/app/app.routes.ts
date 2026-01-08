import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { About } from './components/about/about';
import { Destination } from './components/destination/destination';
import { Hotel } from './components/hotel/hotel';
import { Contact } from './components/contact/contact';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'about', component: About },
    { path: 'destination', component: Destination },
    { path: 'hotel', component: Hotel },
    { path: 'contact', component: Contact },
];
