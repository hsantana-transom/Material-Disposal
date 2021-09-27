import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { SharepointIntegrationService } from 'shared-lib';
import { MainDataSource } from '../datasources/main-data-source';

@Injectable({
  providedIn: 'root'
})
export class MainTableService {

  dataSource: MainDataSource;
  constructor(private sis: SharepointIntegrationService) {
    this.dataSource = new MainDataSource();
  }
  clearAll() {
    this.dataSource.clearAll();
  }
  loadData() {
    const data = {
      select: ['Id', 'Created', 'Rol','NombreId','Nombre/Title','Nombre/Name','ManagerId','Manager/Name','Organizacion'],
      expand:['Nombre','Manager'],
      top: 5000
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Roles', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Nombre.Title,
              loginName: r.Nombre.Name,
              rol:r.Rol,
              supervisor: r.Manager,
              organization:r.Organizacion
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
  loadDataByOrg(org:string) {
    const data = {
      select: ['Id', 'Created', 'Rol','NombreId','Nombre/Title','Nombre/Name','ManagerId','Manager/Name','Organizacion'],
      expand:['Nombre','Manager'],
      top: 5000,
      filter:["Organizacion eq '" + org + "'"]
    };
    const datePipe = new DatePipe('en-US');

    return this.sis.read('Roles', data)
      .pipe(
        map((response: any) => {
          return response.value.map(r => {
            const item: any = {
              created: new Date(r.Created),
              id: r.Id,
              name: r.Nombre.Title,
              loginName: r.Nombre.Name,
              rol:r.Rol,
              supervisor: r.Manager,
              organization:r.Organizacion
            };

            item.createdLabel = datePipe.transform(item.created, 'yyyy-MM-dd hh:mm a');
            return item;
          });
        }),
        tap((response: any) => {
          this.dataSource.replaceAll(response);
        })
      );
  }
  

  getUserProperties()
  {
    return this.sis.readUserProperties("i:0#.f|membership|qy411@cummins.com");
  }
}
