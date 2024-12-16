import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserProfile } from '../user-profile';
import { User } from '../user';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegisterComponent implements OnInit {
  loginService: LoginService = inject(LoginService);
  registerForm!: FormGroup;
  formErrors: Record<string, string> = {
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    username: '',
    email: '',
    password1: '',
    password2: ''
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password1: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', Validators.required]
    });
  }

  validateForm(): boolean {
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = this.registerForm.get(field);
        if (control && control.invalid) {
          if (control.errors?.['required']) {
            this.formErrors[field] = 'Este campo é obrigatório.';
            return false;
          }
          if (control.errors?.['email']) {
            this.formErrors[field] = 'Formato de email inválido.';
            return false;
          }
          if (control.errors?.['minlength']) {
            this.formErrors[field] = 'Senha deve ter pelo menos 6 caracteres.';
            return false;
          }
        }
      }
    }
    return true;
  }

  onSubmit(): void {
    if (this.validateForm()) {
      const user : User = {
        id: 0,
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        first_name: this.registerForm.value.first_name,
        last_name: this.registerForm.value.last_name,
        is_active: true
      }
      const userProfile : UserProfile = {
        id: 0,
        user: user,
        address: this.registerForm.value.address,
        phone: this.registerForm.value.phone,
        image: '',
        wallet: 0
      }
      console.log('Registering user:', userProfile);

      //if the form is valid, create a UserProfile object and post it to the server
      const response = this.loginService.register(userProfile, this.registerForm.value.password1)
      if (response) {
        console.log('User registered:', response);
      }
      else {
        console.error('Error registering user:', response);
      }
    }
  }
}
