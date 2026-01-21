import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
email = '';
password = '';
message = '';

constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}
ngOnInit() {
  if (this.authService.isLoggedIn()) {
      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') ||
        sessionStorage.getItem('returnUrl') ||
        '/home';

      sessionStorage.removeItem('returnUrl');
      this.router.navigateByUrl(returnUrl);
    }
}

login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (data) => {
        this.authService.setSession(data.token, {
          name: data.name,
          email: data.email,
          role: data.role
        });

        this.message = 'Login successful!';

        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ||
          sessionStorage.getItem('returnUrl') ||
          '/home';

        sessionStorage.removeItem('returnUrl');
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.message = err?.error || 'An error occurred';
      }
    });
  }
}
