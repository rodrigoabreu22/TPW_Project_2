import { Routes } from '@angular/router';

import { Product } from './product';
import { ProductListComponent } from './product-list/product-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { AuthenticationComponent } from './authentication/authentication.component';

export const routes: Routes = [
    {path: '', redirectTo: '/products', pathMatch: 'full', data: {showNavbar: true}},
    {path: 'products', component: ProductListComponent, data: {showNavbar: true}},
    {path: 'product/:id', component: ProductDetailsComponent, data: {showNavbar: true}},
    {path: 'users', component: UserListComponent, data: {showNavbar: true}},
    {path: 'profile/:username', component: UserProfileComponent, data: {showNavbar: true}},
    {path: 'authentication', component: AuthenticationComponent, data: {showNavbar: false}},
];
