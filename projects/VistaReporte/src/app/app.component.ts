import { Component,ViewChild,AfterViewInit} from '@angular/core';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { DatePipe } from '@angular/common';
import { map, switchMap, tap } from 'rxjs/operators';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  displayedColumns: string[] = ['NoRequest','Fecha', 'Organizacion', 'NPCZ', 'NPRX','NPNew','Modelo','Component','Estatus','Link'];
  displayedColumnsApprover: string[] = ['Id','Fecha', 'wwid', 'Organizacion', 'NPCZ', 'NPRX','NPNew','Modelo','Component','Estatus', 'Link'];
  dataCurrentUser;
  dataSource:any[];
  dataSourceAll:any[];
  dataUser:any=[];
  bandAprobador=false;
  bandUser=false;
  title = 'VistaReporte';
  wwwidUser:string;
  countReports: number;
  reportLink:string;
  rolName:string;
  bandAllData=false;
  url;
  dataSourceAux;
  myOrgs=[];
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  constructor(
    private sis: SharepointIntegrationService,
  

  ){
    this.url= window.location.pathname.split("/");
    this.getCurrentUser();
  }
  ngAfterViewInit() {
 

   
  
  }

  ngOnInit()
  {
    this.countReports=0;
  }
  getCurrentUser()
  {
    this.sis.readCurrentUser().subscribe(res=>{
      console.log(res);
      this.dataCurrentUser=res;
      console.log(this.dataCurrentUser.Email);
      this.getUserInformation();
    })
  }
   /**
   * Gets Current user information
   */
    getUserInformation()
    {
      if(this.url[this.url.length-1]=="VistaReporte.aspx")
      {
        const data={
          select:['Id','Nombre/Id','Nombre/Title','Nombre/Name','Nombre/EMail','Rol','Organizacion'],
          //top:1,
          filter:["Nombre/EMail eq '" + (this.dataCurrentUser.Email ? this.dataCurrentUser.Email : this.dataCurrentUser.Title) + "'", "Rol ne 'Administrador'"  ],
          expand:['Nombre']
        };
        const datePipe = new DatePipe('en-US');
        this.sis.read('Roles', data)
        .pipe(
          map((users: any) => this.getUserInfo(users.value)),
        )
        .subscribe(r=>{
          console.log(r);
          this.wwwidUser= this.dataCurrentUser.LoginName.replace("@cummins.com", "").replace("i:0#.f|membership|","")
          console.log("WWID: " + this.wwwidUser);
          if(r!= undefined)
          {
            if(r.length>0)
            {
              
              this.dataUser=r;
              this.bandAprobador=true;
              this.dataUser.forEach(e => {
                this.myOrgs.push(e.Organizacion);
              });
              switch(this.dataUser[0].Rol)
              {
                case 'Core Management': this.rolName='Core Management'; break;
                case 'Planeador': this.rolName='Planeador'; break;
                case 'Gerente de Planeación': this.rolName='Gerente de Planeacion'; break;
                case 'Ingeniero de Producto': this.rolName='Ingeniero de Producto'; break;
                case 'Gerente de Ingeniería': this.rolName='Gerente de Ingenieria'; break;
                case 'Coordinador de Finanzas': this.rolName='Coordinador de Finanzas'; break;
                case 'Gerente de Control de Producción': this.rolName='Gerente de Control de Produccion'; break;
                case 'Director de Planta': this.rolName='Director de Planta'; break;
                case 'Supervisor de Almacén': this.rolName="Aprobado"; break;

              }
              this.getReportData('approver');
            }
            else{
              this.bandUser=true;
              this.getReportData('user');

            }
          }        
        });
      }
      else
      {
        this.bandAllData=true;
        this.getAllData();
      }
    }
    /**
   * Creates an object of the users array data
   * @param users users array
   */
  getUserInfo(users: any[])
  {
    return users.map(r =>({
      id: r.Id,
      Nombre: r.Nombre.Title,
      Email:r.Nombre.EMail,
      NombreId: r.Nombre.Id,
      Login: r.Nombre.Name,
      Rol: r.Rol,
      Organizacion:r.Organizacion
    }));
  }
  /*
  *
  */
  getReportData(typeUser:string)
  {
    var data;
    if(typeUser=="user")
    {
        data={
        select:['Id','Organizacion','NPCZ','NPRX','NPNew','OH','NoRequest','Modelo','Component','wwidUser','Estatus','Created'],
        top:5000,
        filter:["wwidUser eq '" + this.wwwidUser + "'"],
        orderBy:"NoRequest"
      };
    }
    if(typeUser=="approver")
    {
        data={
        select:['Id','Organizacion','NPCZ','NPRX','NPNew','OH','NoRequest','Modelo','Component','wwidUser', 'Aprobacion', 'Estatus','Created'],
        top:5000,
        filter:["Aprobacion eq '" + this.rolName + "'"],
      };

    }
    this.sis.read("MainForm",data)
    .pipe(map((reportes:any)=>this.MapReportInfo(reportes.value))).subscribe(response=>{
      console.log(response);
      this.dataSource=response.map(x=>({...x}));
   
      /*
      *
        Ciclo para eliminar los reportes que no le pertenece al aprobador por Organizacion
      *
      */
      if(typeUser=="approver")
      {
        for(var i=0; i<response.length;i++)
        {
          var o= response[i].Organizacion;
          console.log(o);
          
          var ind= this.myOrgs.indexOf(o);
          if(ind==-1)
          {
            var foundElement= this.dataSource.map(x=> {return x.Id}).indexOf(response[i].Id);
            this.dataSource.splice(foundElement,1);
          }
            
        }
      }
      /*-------------------------------------------------------------------------*/
      this.countReports= response.length;
      this.reportLink="/sites/GRP_CC44493/SitePages/MainForm.aspx/"+ this.wwwidUser + "/" + (this.countReports + 1);
    });
  }
  MapReportInfo(reportes:any[])
  {
    const datePipe = new DatePipe('en-US');
    return reportes.map(r =>({
      Id:r.Id,
      NoReq: r.NoRequest,
      Organizacion: r.Organizacion,
      NPCZ: r.NPCZ,
      NPRX:r.NPRX,
      NPNew:r.NPNew,
      OH: r.OH,
      Modelo: r.Modelo,
      Component: r.Component,
      wwid: r.wwidUser,
      Estatus:r.Estatus,
      Created: datePipe.transform(r.Created, 'dd-MM-yyyy'),
      Link: "/sites/GRP_CC44493/SitePages/MainForm.aspx/" + r.wwidUser + "/" + r.NoRequest
    }));
  }
  getAllData()
  {

      const data={
        select:['Id','Organizacion','NPCZ','NPRX','NPNew','OH','Modelo','NoRequest','Component','wwidUser','Estatus','Created'],
        top:5000,
        orderBy:'Id',
        reverse: true
      };
      
      this.sis.read("MainForm",data)
      .pipe(map((reportes:any)=>this.MapReportInfo(reportes.value))).subscribe(response=>{
      console.log(response);
      this.dataSourceAll=response;
      this.dataSourceAux= new MatTableDataSource(this.dataSourceAll);
      this.dataSourceAux.paginator = this.paginator;
    });

    

  }
}

