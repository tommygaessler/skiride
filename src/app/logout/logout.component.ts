import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(public authService: AuthService, public router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      // this.authService.removeCookie();
      this.authService.setProfile(null)
      this.router.navigate(['/']);
    })
  }

}
