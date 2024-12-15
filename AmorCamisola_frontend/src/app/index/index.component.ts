import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { ProductListComponent } from '../product-list/product-list.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductListComponent],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  filterForm: FormGroup;
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  productService: ProductService = inject(ProductService);
  isLoading: boolean = true;

  categories: string[] = ['Camisola', 'Calção', 'Meia', 'Chuteira'];
  sizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];
  chuteiraSizes: number[] = Array.from({ length: 19 }, (_, i) => 30 + i); // Sizes 30 to 48

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      sellerUsername: [''],
      category: [[]], // Array to hold multiple selected categories
      size: [''],
      priceMin: [null],
      priceMax: [null],
      sortBy: ['name'] // Default sorting by name
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  async fetchProducts(): Promise<void> {
    try {
      this.allProducts = await this.productService.getProducts(null);
      this.filteredProducts = [...this.allProducts];
      this.isLoading = false;
    } catch (error) {
      console.error('Error fetching products:', error);
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    const { searchTerm, sellerUsername, category, size, priceMin, priceMax, sortBy } = this.filterForm.value;

    let products = [...this.allProducts];

    // Filter by search term (name, category, team)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term)) ||
        product.team.toLowerCase().includes(term)
      );
    }

    // Filter by seller username
    if (sellerUsername) {
      const seller = sellerUsername.toLowerCase();
      products = products.filter(product => product.seller.username.toLowerCase().includes(seller));
    }

    // Filter by categories (multiple selection allowed)
    if (category.length > 0) {
      products = products.filter(product => category.includes(product.category));
    }

    // Filter by size
    if (size) {
      products = products.filter(product =>
        product.size === size || product.size === parseInt(size, 10) // Handles numeric and string sizes
      );
    }

    // Filter by price range
    if (priceMin !== null) {
      products = products.filter(product => product.price >= priceMin);
    }
    if (priceMax !== null) {
      products = products.filter(product => product.price <= priceMax);
    }

    // Sort products
    if (sortBy === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-reverse') {
      products.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-reverse') {
      products.sort((a, b) => b.price - a.price);
    }

    this.filteredProducts = products;
  }

  // Update selected categories when a checkbox is checked/unchecked
  onCategoryChange(event: any): void {
    const category = event.target.value;
    const categories = this.filterForm.value.category;

    if (event.target.checked) {
      categories.push(category);  // Add category to the selected list
    } else {
      const index = categories.indexOf(category);
      if (index > -1) {
        categories.splice(index, 1); // Remove category from the selected list
      }
    }

    this.filterForm.patchValue({ category: categories });
    this.applyFilters(); // Re-apply filters after category change
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      sellerUsername: '',
      category: [],
      size: '',
      priceMin: null,
      priceMax: null,
      sortBy: 'name' // Reset to default sorting
    });
    this.applyFilters();
  }
}
