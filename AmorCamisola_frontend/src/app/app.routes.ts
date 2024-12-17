import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { OffersListComponent } from './offers-list/offers-list.component';
import { PublishProductComponent } from './publish-product/publish-product.component';
import { IndexComponent } from './index/index.component';
import { ModeratorComponent } from './moderator/moderator.component';
import { AccountComponent } from './account/account.component';
import { WalletComponent } from './wallet/wallet.component';
import { UsersPageComponent } from './users-page/users-page.component';

export const routes: Routes = [
    {path: '', redirectTo: '/products', pathMatch: 'full'},
    {path: 'products', component: IndexComponent},
    {path: 'product/:id', component: ProductDetailsComponent},
    {path: 'users', component: UsersPageComponent},
    {path: 'profile/:username', component: UserProfileComponent},
    {path: 'favorites', component: FavoritesComponent},
    {path: 'offers', component: OffersListComponent},
    {path: 'authentication', component: AuthenticationComponent, data: {showNavbar: false, showFooter: false}},
    {path: 'sell', component: PublishProductComponent},
    {path: 'moderator', component: ModeratorComponent},
    {path: 'account', component: AccountComponent},
    {path: 'wallet', component: WalletComponent}
];
