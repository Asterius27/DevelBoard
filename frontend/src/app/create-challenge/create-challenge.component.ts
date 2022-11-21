import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'app-create-challenge',
  templateUrl: './create-challenge.component.html',
  styleUrls: ['./create-challenge.component.css']
})
export class CreateChallengeComponent implements OnInit {

  public createChallengeForm!: FormGroup;
  public minDate = "";

  constructor(private router: Router, private c: ChallengesService) {}

  ngOnInit(): void {
    let today = new Date(); // TODO add hour and minute
    let str_day = "";
    let str_month = "";
    let str_year = today.getFullYear().toString();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    if (month < 10) {
      str_month = '0' + month;
    } else {
      str_month = month.toString();
    }
    if (day < 10) {
      str_day = '0' + day;
    } else {
      str_day = day.toString();
    }
    this.minDate = str_year + "-" + str_month + "-" + str_day;
    this.createChallengeForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      language: new FormControl('', Validators.required),
      testCases: new FormControl('', Validators.required),
      resultCases: new FormControl('', Validators.required),
      expireDate: new FormControl('', Validators.required)
    });
  }

  submit() {
    let temp:string[] = this.createChallengeForm.get('expireDate')!.value.split('-');
    let tests:string[] = this.createChallengeForm.get('testCases')!.value.split('; ');
    let results:string[] = this.createChallengeForm.get('resultCases')!.value.split('; ');
    if (tests.length === results.length) {
      let date = {
        year: temp[0],
        month: temp[1],
        day: temp[2],
        hour: 16,
        minute: 20
      }
      this.c.createChallenge(
        this.createChallengeForm.get('title')!.value,
        this.createChallengeForm.get('description')!.value,
        this.createChallengeForm.get('language')!.value,
        this.createChallengeForm.get('testCases')!.value,
        this.createChallengeForm.get('resultCases')!.value,
        date
      ).subscribe({
        next: (data) => {
          this.router.navigate(['/home']); // TODO pop up window
        }
      });
    } else {
      // TODO show error
    }
  }

}
