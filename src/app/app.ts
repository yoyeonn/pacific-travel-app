import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,           // ✅ mark as standalone
  imports: [RouterOutlet,Navbar,Footer], // ✅ allowed now
  templateUrl: './app.html',
  styleUrls: ['./app.css']     // ✅ plural array
})
export class App {
  protected readonly title = signal('travel');
}

