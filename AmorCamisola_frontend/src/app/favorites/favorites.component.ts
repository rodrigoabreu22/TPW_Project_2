import { Component, inject } from '@angular/core';
import { FavoritesService } from '../favorites.service';
import { Product } from '../product';
import { CommonModule } from '@angular/common';
import { ProductComponent } from '../product/product.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, ProductComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent{
  favorites: Product[] = [];
  userId: number | null = null;
  token: string | null = null;

  favoriteService: FavoritesService = inject(FavoritesService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    if (this.isBrowser()) {
      const storedId = localStorage.getItem("id");
      this.token = localStorage.getItem("token");
      console.log("ola",storedId)
      if(storedId !== null){
        this.userId = parseInt(storedId, 10);
      }
    } else {
      console.warn("localStorage não está disponível no ambiente atual.");
    }
    console.log(this.userId)
    if(this.userId){  
    this.favoriteService
      .getFavorites(this.userId, this.token!)
      .then((fetchedFavorites: Product[])=>{
        this.favorites = fetchedFavorites;
        console.log(this.favorites)
    })
    .catch((error) => {
      console.error('Error fetching products from user:', error);
    });
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } 

}
