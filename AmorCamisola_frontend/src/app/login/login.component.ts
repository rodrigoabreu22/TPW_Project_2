import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {CommonModule, Location} from "@angular/common";
import { LoginService } from '../login.service';
import { UserProfile } from '../user-profile';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  loginUserService: LoginService = inject(LoginService);
  invalidCredentials: boolean = false;

  constructor(private formBuilder: FormBuilder, private location: Location) { 
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;

      this.loginUserService.login(username, password)
        .then((success: UserProfile | null) => {
          if (success) {
            console.log("Success!!!", success);
            this.goBack();
          } else {
            this.invalidCredentials = true;
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
          this.invalidCredentials = true;
        });

    } else {
      this.loginForm.markAllAsTouched();
      console.log('Invalid form submitted');
    }
  }

  goBack(): void {
    this.location.back();
  }
}