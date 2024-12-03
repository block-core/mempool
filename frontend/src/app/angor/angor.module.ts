import { NgModule } from "@angular/core";
import { ProjectsListComponent } from "./projects-list/projects-list.component";
import { ProjectComponent } from "./project/project.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { AngorRoutingModule } from "@app/angor/angor.routing.module";

@NgModule({
  declarations: [
    ProjectsListComponent,
    ProjectComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AngorRoutingModule
  ]
})
export class AngorModule{ }
