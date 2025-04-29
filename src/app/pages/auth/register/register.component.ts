import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormErrorComponent } from '../../../shared/form-error/form-error.component';
import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm!: FormGroup;
  selectFile?: File;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private cookieService: CookieService,
              private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      image: [null, Validators.required],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile = input.files[0];
      this.registerForm.patchValue({image: this.selectFile});
    }
  }

  onSubmit() {
    if (this.registerForm.invalid || !this.selectFile) {
      this.errorMessage = 'Please fill the required fields and upload an image.';
      return;
    }
    const formData = new FormData();
    formData.append('name', this.registerForm.get('name')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('image', this.selectFile); 

    this.authService.register(formData).subscribe({
      next: (response: any) => {
        console.log('Registration successful', response);
        if (response.token) {
          this.cookieService.set('auth_token', response.token);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'No token received.';
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = 'Registration failed. Please try again.';
      },
    });
  }
}
