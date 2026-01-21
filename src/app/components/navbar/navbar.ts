import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
isLoggedIn = false;
userName = '';

constructor(private auth: AuthService, private router: Router) {}

ngOnInit(): void {
  this.auth.isLoggedIn$.subscribe(v => this.isLoggedIn = v);

  this.auth.currentUser$.subscribe(user => {
    this.userName = user?.name ?? '';
  });
}

logout() {
  this.auth.logout();
  this.router.navigate(['/login']);
}

}
