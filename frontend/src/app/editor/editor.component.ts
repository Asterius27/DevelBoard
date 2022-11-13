import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

  constructor(private c: ChallengesService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    ace.require("ace/ext/language_tools");
    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.12.5/src-noconflict');
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.setTheme('ace/theme/twilight');
    this.aceEditor.session.setMode('ace/mode/java');
    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
    });
    this.load_challenge();
  }

  load_challenge() {
    this.c.getChallenge("id").subscribe({ // TODO change id
      next: (data) => {
        // TODO load the challenge
      }
    });
  }

  uploadCode() {
    if (Object.entries(this.aceEditor).length !== 0) {
      console.log(this.aceEditor.getValue());
      this.c.submitCode(this.aceEditor.getValue(), "java").subscribe({ // TODO add language variable
        next: (data) => {
          // TODO show evaluation/output
        }
      });
    }
  }

}
