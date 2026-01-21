import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
name = '';
email = '';
password = '';
message = '';

constructor(private authService: AuthService, private router: Router) {}

signup() {
  this.authService.signup({
    name: this.name,
    email: this.email,
    password: this.password
  }).subscribe({
    next: (res) => {
      this.message = res;
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.message = err?.error || 'An error occurred';
    }
  });
}

}
