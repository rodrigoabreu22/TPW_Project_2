import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { filter } from 'rxjs/operators';
import { UserProfile } from './user-profile';
import { LoginService } from './login.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AmorCamisola_frontend';
  showNavbar: boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Listen for navigation events
    ).subscribe(() => {
      const currentRoute = this.getDeepestChild(this.activatedRoute);
      this.showNavbar = currentRoute?.snapshot?.data?.['showNavbar'] ?? true;
      console.log('Navbar visibility:', this.showNavbar);
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
