import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as ace from "ace-builds";
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild("editor") private editor: ElementRef<HTMLElement> = {} as ElementRef;
  private aceEditor = {} as ace.Ace.Editor;
  public title = "";
  public challenge: {[k: string]: any} = {};

  constructor(private c: ChallengesService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.title = this.route.snapshot.paramMap.get('title') || "";
  }

  ngAfterViewInit(): void {
    ace.require("ace/ext/language_tools");
    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.12.5/src-noconflict');
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.setTheme('ace/theme/twilight');
    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
    });
    this.load_challenge();
  }

  disabled() {
    if (Object.entries(this.aceEditor).length !== 0) {
      if (this.aceEditor.getValue()) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  load_challenge() {
    this.c.getChallenge(this.title).subscribe({
      next: (data) => {
        this.challenge = data;
        this.aceEditor.session.setMode('ace/mode/' + this.challenge['language'].toLowerCase());
      }
    });
  }

  uploadCode() {
    if (Object.entries(this.aceEditor).length !== 0) {
      let temp:string = "class Challenge {\n" + this.aceEditor.getValue() + "\n}";
      // console.log(this.aceEditor.getValue());
      this.c.submitCode(temp, this.challenge['language'].toLowerCase(), this.title).subscribe({
        next: (data) => {
          console.log(data.score);
          this.router.navigate(['/home']);
          // TODO show evaluation/output (data.score, data.compile) pop up window
        }
      });
    }
  }

}
