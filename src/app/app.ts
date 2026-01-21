import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,Navbar,Footer,HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit{
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
  if (this.auth.getToken()) {
    this.auth.getMe().subscribe({
      next: (user) => this.auth.setSession(this.auth.getToken()!, user),
      error: () => this.auth.logout()
    });
  }
}
}

