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
  public display = "none";
  public display_error = "none";

  constructor(private router: Router, private c: ChallengesService) {}

  ngOnInit(): void {
    let today = new Date();
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
      expireDate: new FormControl('', Validators.required),
      expireTime: new FormControl('', Validators.required)
    });
  }

  submit() {
    let test_re = /^(\[([0-9]{1,}, |"[\w]{1,}", |[0-9]{1,}\.[0-9]{1,}, )*([0-9]{1,}|"[\w]{1,}"|[0-9]{1,}\.[0-9]{1,})\]; )*\[([0-9]{1,}, |"[\w]{1,}", |[0-9]{1,}\.[0-9]{1,}, )*([0-9]{1,}|"[\w]{1,}"|[0-9]{1,}\.[0-9]{1,})\]$/;
    let result_re = /^(\[[0-9]{1,}\]; |\["[\w]{1,}"\]; |\[[0-9]{1,}\.[0-9]{1,}\]; )*(\[[0-9]{1,}\]|\["[\w]{1,}"\]|\[[0-9]{1,}\.[0-9]{1,}\])$/;
    let temp:string[] = this.createChallengeForm.get('expireDate')!.value.split('-');
    let tests:string[] = this.createChallengeForm.get('testCases')!.value.split('; ');
    let results:string[] = this.createChallengeForm.get('resultCases')!.value.split('; ');
    let time:string[] = this.createChallengeForm.get('expireTime')!.value.split(':');
    if (tests.length === results.length && this.createChallengeForm.get('language')!.value !== "" && this.createChallengeForm.get('testCases')!.value.match(test_re) !== null && this.createChallengeForm.get('resultCases')!.value.match(result_re) !== null) {
      let date = {
        year: temp[0],
        month: temp[1],
        day: temp[2],
        hour: time[0],
        minute: time[1]
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
          this.display = "block";
        }
      });
    } else {
      this.display_error = "block";
    }
  }

  return_home() {
    this.router.navigate(['/home']);
  }

  close_popup() {
    this.display_error = "none";
  }

}
