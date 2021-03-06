import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { formatCurrency } from '@angular/common';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

declare var StripeCheckout:any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  loading: boolean = false;
  error: string;
  addOnBlur;
  invalidEmail: boolean = false;
  handler: any;
  emails: any = [];
  createPoolForm: FormGroup;
  emailInput: string = '';
  emailRegex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(fb: FormBuilder, public http: HttpClient, public authService: AuthService, public router: Router) {
    this.createPoolForm = fb.group({
      'name': [null, Validators.required],
      'buyin': [null, Validators.required]
    });
  }

  ngOnInit() {
    this.handler = StripeCheckout.configure({
      key: 'pk_test_azE802fthc69BcEpUKGLJx6W',
      image: 'https://skiride.com/assets/images/favicon.png',
      locale: 'auto',
      token: 'something'
    });
  }

  addEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim() && this.emailRegex.test(value)) {
      this.emails.push({email: value.trim()});

      if (input) {
        input.value = '';
        this.emailInput = '';
      }
    } else {
      this.invalidEmail = true;

      setTimeout(() => {
        this.invalidEmail = false;
      }, 500)
    }
  }

  removeEmail(invoiceTag): void {
    const index = this.emails.indexOf(invoiceTag);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  buyin() {
    // this.handler.open({
    //   name: 'skiride',
    //   allowRememberMe: false,
    //   email: 'tommy@skiride.com',
    //   panelLabel: `Add`,
    //   description: `Add ${formatCurrency(this.createPoolForm.value.buyin, 'en-US', '$')} to my pool "${this.createPoolForm.value.name}"`,
    //   amount: parseFloat(this.createPoolForm.value.buyin) * 100
    // });
    this.loading = true;
    this.error = null;

    this.http.post('https://cdbiahura2.execute-api.us-west-1.amazonaws.com/prod/postPool', {
      name: this.createPoolForm.value.name,
      buyin: this.createPoolForm.value.buyin,
      ProfileId: this.authService.getProfile()['ProfileId'],
      VerticalFeet: this.authService.getProfile()['VerticalFeet'],
      DaysOnMountain: this.authService.getProfile()['DaysOnMountain'],
      Lifts: this.authService.getProfile()['Lifts'],
      MountainsVisited: this.authService.getProfile()['MountainsVisited']
    }).toPromise().then((data: any) => {
      if(data.errorMessage) {
        if(JSON.parse(data.errorMessage).body === "Duplicate entry 'firstpool' for key 'Name_UNIQUE'") {
          this.loading = false;
          this.error = 'Pool name already taken.'
        }
      } else {
        this.router.navigate(['/dashboard']);
      }
    }).catch((error) => {
      this.loading = false;
      this.error = 'Something went wrong.'
      console.log(error)
    });
  }

}
