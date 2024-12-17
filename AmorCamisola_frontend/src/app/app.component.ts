import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component'; // Assuming you have a footer component
import { filter } from 'rxjs/operators';
import { UserProfile } from './user-profile';
import { LoginService } from './login.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AmorCamisola_frontend';
  showNavbar: boolean = true; // Default to true, assuming navbar is visible by default
  showFooter: boolean = true; // Default to true, footer is visible by default

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.getDeepestChild(this.activatedRoute);

      // Update visibility based on route data
      this.showNavbar = currentRoute?.snapshot?.data?.['showNavbar'] ?? true;
      this.showFooter = currentRoute?.snapshot?.data?.['showFooter'] ?? true;

      console.log('Navbar visibility:', this.showNavbar);
      console.log('Footer visibility:', this.showFooter);
    });
  }

  /**
   * Traverse to the deepest activated child route
   */
  private getDeepestChild(route: ActivatedRoute): ActivatedRoute | null {
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}

