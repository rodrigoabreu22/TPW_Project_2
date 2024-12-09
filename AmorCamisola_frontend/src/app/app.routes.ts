import { Routes } from '@angular/router';

import { Product } from './product';
import { ProductListComponent } from './product-list/product-list.component';
import { UserProfile } from './user-profile';
import { UserListComponent } from './user-list/user-list.component';

export const routes: Routes = [
    {path: '', redirectTo: '/products', pathMatch: 'full'},
    {path: 'products', component: ProductListComponent},
    {path: 'users', component: UserListComponent}
];
