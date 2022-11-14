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

  constructor(private router: Router, private c: ChallengesService) {}

  ngOnInit(): void {
    this.createChallengeForm = new FormGroup({
      description: new FormControl('', Validators.required),
      language: new FormControl('', Validators.required),
      testCases: new FormControl('', Validators.required),
      expireDate: new FormControl('', Validators.required),
    });
  }

  submit() {
    this.c.createChallenge(
      this.createChallengeForm.get('description')!.value,
      this.createChallengeForm.get('language')!.value,
      this.createChallengeForm.get('testCases')!.value,
      this.createChallengeForm.get('expireDate')!.value
    ).subscribe({
      next: (data) => {
        this.router.navigate(['/home']);
      }
    });
  }

}
