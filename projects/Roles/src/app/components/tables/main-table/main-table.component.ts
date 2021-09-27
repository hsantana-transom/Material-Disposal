import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { MessageService, SharepointIntegrationService } from 'shared-lib';
import { MainFormDialogComponent } from '../../dialogs/main-form-dialog/main-form-dialog.component';
import { MainDataSource } from '../../../datasources/main-data-source';
import { MainTableService } from '../../../services/main-table.service';

@Component({
  selector: 'app-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['./main-table.component.scss']
})
export class MainTableComponent implements OnInit {
  @Input() tabNumber;
  columns = COLUMNS;
  displayedColumns = ['name', 'rol','organization', 'operations'];
  dataSource: MainDataSource;
  loading = true;
  
  constructor(
    private dialog: MatDialog,
    private message: MessageService,
    private mts: MainTableService,
    private sis: SharepointIntegrationService,
  ) {}

  ngOnInit() {

    this.dataSource = this.mts.dataSource;
    this.tabNumber=0;
    this.tabChanged(this.tabNumber);
    /*this.mts.loadData()
      .subscribe(
        () => {},
        err => this.message.genericHttpError(err),
        () => this.loading = false
      );*/
  }

  // Custom public methods

  onOperation(event) {
    switch (event.operation) {
      case 'delete':
        this.onDelete(event.item);
        break;
      case 'edit':
        this.onEdit(event.item);
        break;
    }
  }

  // Custom private methods

  private onDelete(item: any) {
    this.message.confirm({
      text: '¿Desea eliminar?',
      title: 'Eliminar'
    })
    .subscribe(response => {
      if (response) {
        this.sis.getFormDigest().pipe(
          switchMap(formDigest =>
            this.sis.delete('Roles', item.id, formDigest)
          )
        )
        .subscribe(
          () => {
            this.message.show('Elemento eliminado');
            this.tabChanged(this.tabNumber);

          },
          err => this.message.genericHttpError(err)
        );
      }
    });
  }

  private onEdit(item: any) {
    const dialogRef = this.dialog.open(MainFormDialogComponent, {
      data: item,
      disableClose: true,
      width:"50%"
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.tabChanged(this.tabNumber);
          this.message.genericSaveMessage();
        }
      });
  }
  tabChanged(event)
  {
    this.loading = true
    this.tabNumber=event;
    console.log("tab selected:" + event);
    this.dataSource = this.mts.dataSource;
    console.log(this.dataSource);
    switch(event)
    {
      case 0:
        this.mts.loadData().subscribe(
          () => {},
          err => this.message.genericHttpError(err),
          () => this.loading = false
        );
      break;
      case 1:
        this.mts.loadDataByOrg("DRC").subscribe(
          () => {},
          err => this.message.genericHttpError(err),
          () => this.loading = false
        );
      break;
      case 2:
        this.mts.loadDataByOrg("DCM").subscribe(
          () => {},
          err => this.message.genericHttpError(err),
          () => this.loading = false
        );
      break;
      case 3:
        this.mts.loadDataByOrg("WBC").subscribe(
          () => {},
          err => this.message.genericHttpError(err),
          () => this.loading = false
        );
      break;
      case 4:
        this.mts.loadDataByOrg("EATON").subscribe(
          () => {},
          err => this.message.genericHttpError(err),
          () => this.loading = false
        );
      break;
    }
    
  }


}
export const COLUMNS = [
  {
    key: 'createdLabel',
    label: 'Creado'
  },
  {
    key: 'name',
    label: 'Nombre'
  },
  {
    key: 'rol',
    label: 'Rol'
  },
  {
    key: 'organization',
    label: 'Organización'
  },
];

