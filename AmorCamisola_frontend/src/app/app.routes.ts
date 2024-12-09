import { Routes } from '@angular/router';

import { Product } from './product';
import { ProductListComponent } from './product-list/product-list.component';
import { UserProfile } from './user-profile';

export const routes: Routes = [
    {path: '', redirectTo: '/top', pathMatch: 'full'},
    {path: 'products', component: ProductListComponent},
];
