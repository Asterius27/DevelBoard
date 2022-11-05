import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as ace from "ace-builds";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild("editor") private editor: ElementRef<HTMLElement> = {} as ElementRef;
  private aceEditor = {} as ace.Ace.Editor;

  constructor() {}

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
  }

  uploadCode() {
    if (Object.entries(this.aceEditor).length !== 0) {
      console.log(this.aceEditor.getValue());
    }
  }

}
