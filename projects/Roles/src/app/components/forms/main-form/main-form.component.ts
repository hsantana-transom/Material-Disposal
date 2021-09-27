import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Input, ComponentFactoryResolver } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FormsService, ImageFile, SharepointIntegrationService } from 'shared-lib';
import { MainTableService } from '../../../services/main-table.service';
import {Observable} from 'rxjs';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss']
})
export class MainFormComponent implements OnInit {

  @Input() data: any;
  fields: any = {};
  flags = {
    loadingFields: true
  };
  private isNew: boolean;
  keywords: string[] = [];
  usedOrders: number[] = [];
  avaliableOrders: number[]=[];
  mainForm: FormGroup;
  mainImage = null;
  readonly separatorKeysCodes: number[] = [ ENTER, COMMA ];
  checkButton = false;
  idSupervisor: string;
  nameSupervisor: string;
  emailSupervisor: string;
  idUser: string;
  nameUser: string;
  emailUser: string;
  users:any=[];
  filteredOptions: Observable<string[]>;
  isloading=false;
  bandSelectedUser=false;
  bandDuplicatedRol=false;
  bandDuplicatedUser=false;
  UsedData:any=[];
  userUsedRoles:any=[];
  usedRol:string;
  bandDifRol=false;
  contRoles;
  roles= ["Administrador",  
  "Core Management", 
  "Planeador", 
  "Gerente de Planeación",  
  "Ingeniero de Producto",  
  "Gerente de Ingeniería", 
  "Coordinador de Finanzas", 
  "Gerente de Control de Producción",  
  "Director de Planta",  
  "Supervisor de Almacén", 
  "Coordinador de Almacén" 
  ];
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private sis: SharepointIntegrationService,
    private mts: MainTableService
  ) 
  {
    this.getRolesData();
  }

  ngOnInit() {
    
    this.isNew = this.data ? false : true;
    this.setupForm();
   
    
    this.sis.readSiteUsers().pipe(
      map((users: any) => this.getUserInfo(users.value)),
    ).subscribe(r=>{
      console.log(r);
      r.forEach(element => {
        element.wwid!=null ? this.users.push(element) : null;
      });
     
      this.filteredOptions = this.mainForm.get('name').valueChanges.pipe(
      startWith(' '),
      map(value => this._filter(value))
    );
    });

   
    
  
  }
  // Custom public methods
  getRolesData()
  {
    var indUser;
    const data = {
      select: [ 'Rol','Nombre/Title', 'Organizacion','RolKey'],
      expand:['Nombre'],
      top: 5000
    }
    this.sis.read("Roles",data).pipe(
      map((roles: any) => this.filterRolesData(roles.value)),
    ).subscribe(r=>{
        console.log(r);
        this.UsedData=r;
       /* if(!this.isNew)
        {
          indUser= this.UsedData.map(us=> {return us.nombre}).indexOf(this.data.name);
          console.log(indUser);
          if (indUser != -1 )
          {
            this.UsedData.splice(indUser,1);
          }
        }*/
    });
  }
  private _filter(value: string): string[] {
    console.log(value);
    const filterValue = value.toLowerCase();

    return this.users.filter(option => option.Nombre.toLowerCase().indexOf(filterValue) === 0);
  }
  getUserInfo(users: any[])
  {
    return users.map(r =>({
      wwid: r.UserPrincipalName!= null ? r.UserPrincipalName.replace("@cummins.com", "") : null,
      Nombre: r.Title,
      Email:r.LoginName,
      id:r.Id
    }));
  }
  
  filterRolesData(roles: any[])
  {
    return roles.map(r =>({
      rol: r.Rol,
      nombre: r.Nombre.Title,
      org: r.Organizacion,
      rk:r.RolKey
    }));
  }

  getUserData(event)
  {
    this.disableFields();
    
    this.userUsedRoles=[];
    var res: any=[];
    this.isloading=true;
    console.log(event);
    this.idSupervisor="";
    this.nameSupervisor=null;
    this.emailSupervisor="";
    var indUs,indSup;
    this.emailUser= event.replace("i:0#.f|membership|","");
    this.idUser= this.emailUser.replace("@cummins.com", "");
    this.nameUser= this.mainForm.get('name').value;

    //aux=  this.UsedData.nombre.indexOf(this.nameUser);

    /*
    aux= this.UsedData.map(x=> {return x.nombre}).indexOf(this.nameUser);
    console.log(aux);
    if (aux != -1 )
      this.bandDuplicatedUser=true;
    else
      this.bandDuplicatedUser=false;
    
    for(var u=0; u<this.UsedData.length;u++)
    {
      if(this.UsedData[u].nombre==this.nameUser)
      {
        
        break;
      }
      else
        this.bandDuplicatedUser=false;
    }
    */

    this.sis.readUserProperties(event).subscribe(response => {
      res = response
      console.log(res.UserProfileProperties);
      if(res.UserProfileProperties)
      {
        this.emailSupervisor=res.UserProfileProperties[15].Value.replace("i:0#.f|membership|","");
        this.idSupervisor= this.emailSupervisor.replace("@cummins.com", "");

        indSup= this.users.map(us=> {return us.Email}).indexOf(res.UserProfileProperties[15].Value);
        console.log(indSup);
        if (indSup != -1 )
        {
          this.nameSupervisor= this.users[indSup].Nombre;
          this.mainForm.patchValue({
            loginNameSupervisor:this.users[indSup].id
          });
        }
        indUs= this.users.map(us=> {return us.Email}).indexOf(event);
        console.log(indUs);
        if (indUs != -1 )
        {
          this.mainForm.patchValue({
            loginName: this.users[indUs].id
          });
        }
        
        this.bandSelectedUser=true;
        this.checkUserSelectedRoles();
        if(this.isNew || this.data.name!=this.nameUser)
        {
          if(this.mainForm.get('rol').value!=null || this.mainForm.get('organization').value!=null )
          {
            this.mainForm.patchValue({
              rol:null,
              organization:null
            })
            this.bandDuplicatedUser=false;
            this.bandDuplicatedRol=false;
          }
        }
      
        this.isloading=false;
        this.enableFields();
      }
/*
        for(var j=0;j<this.users.length;j++)
        {
          if(this.users[j].Email== res.UserProfileProperties[15].Value)
          {
            this.nameSupervisor= this.users[j].Nombre;
            this.mainForm.patchValue({
              loginNameSupervisor:this.users[j].id
            });

            
          }
          if(this.users[j].Email== event)
          {
            this.mainForm.patchValue({
              loginName: this.users[j].id
            });

          }
          if(j== this.users.length-1)
          {
            this.isloading=false;
            this.bandSelectedUser=true;
            this.enableFields();

          }
        }
      }
      */
      /*
      for(var i=0; i<res.UserProfileProperties.length; i++ )
      {
        //console.log(res.UserProfileProperties[i]);
        if(res.UserProfileProperties[i].Key=="Manager")
        {
          //console.log(res.UserProfileProperties[i].Value);
         
          this.emailSupervisor=res.UserProfileProperties[i].Value.replace("i:0#.f|membership|","");
          this.idSupervisor= this.emailSupervisor.replace("@cummins.com", "");
          for(var j=0;j<this.users.length;j++)
          {
            if(this.users[j].Email== res.UserProfileProperties[i].Value)
            {
              this.nameSupervisor= this.users[j].Nombre;
              this.isloading=false;
              this.mainForm.patchValue({
                loginNameSupervisor:this.users[j].id
              });

              
            }
            if(this.users[j].Email== event)
            {
              this.mainForm.patchValue({
                loginName: this.users[j].id
              });

            }
          }
        }
      }
      */

      
      
    });
    
  }


  disableFields() {
    this.fs.disableFields(this.mainForm);
  }

  enableFields() {
    this.fs.enableFields(this.mainForm);
  }

  

  submit() {
    const values = this.mainForm.value;
    var rolAux;
    //values.keywords = this.keywords;
    //values.mainImage = this.mainImage;
    
    switch(values.rol)
    {
      case "Administrador": rolAux="Administrador"; break;  
      case "Core Management": rolAux="Core Management"; break; 
      case "Planeador": rolAux="Planeador"; break;
      case "Gerente de Planeación": rolAux="Gerente de Planeacion"; break;  
      case "Ingeniero de Producto": rolAux="Ingeniero de Producto"; break;
      case "Gerente de Ingeniería": rolAux="Gerente de Ingenieria"; break;
      case "Coordinador de Finanzas": rolAux="Coordinador de Finanzas"; break;
      case "Gerente de Control de Producción": rolAux="Gerente de Control de Produccion"; break;  
      case "Director de Planta": rolAux="Director de Planta"; break; 
      case "Supervisor de Almacén": rolAux="Supervisor de Almacen"; break; 
      case "Coordinador de Almacén" : rolAux="Coordinador de Almacen"; break;

    }
    const data: any = {
      __metadata: { type: 'SP.Data.RolesListItem' },
      Rol: values.rol,
      NombreId: values.loginName,
      ManagerId:values.loginNameSupervisor,
      Organizacion:values.organization,
      RolKey: values.rol + "-" + values.organization + "-" + this.contRoles.toString(),
      RolAuxiliar: rolAux + "-" + values.organization + "-" + this.contRoles.toString(),
      //Nombre: {ID:values.loginName,Name:this.loginUserName},
      //Manager:{ID:values.loginNameSupervisor, Name: this.loginSuperName} 
    };

    if (values.id) {
      data.Id = values.id;
    }
    console.log(data);
    return this.sis.getFormDigest().pipe(
      switchMap(formDigest => {
        return this.sis.save('Roles', data, formDigest);
      })
    );
  }
   // Custom private methods

  private setupForm() {
    this.mainForm = this.fb.group({
      id: null,
      name:null,
      loginName:null,
      loginNameSupervisor:null,
      rol: [{value:null ,disabled:!this.bandSelectedUser}, Validators.required],
      organization:[{value:null ,disabled:!this.bandSelectedUser},Validators.required]
     
    });
    if (!this.isNew) {
      
      console.log(this.data);
      this.mainForm.patchValue({
        id: this.data.id,
        name: this.data.name,
        rol: this.data.rol,
        organization: this.data.organization
      });
      this.getUserData(this.data.loginName);
    }
  }
  VerifyRol()
  {
    //console.log(selectedRol);
    var r=this.mainForm.get('rol').value;
    var o= this.mainForm.get('organization').value;
    console.log("ENTRE a verify rol");
    console.log(r);
    console.log(o);
    this.bandDuplicatedUser=false;
    this.bandDifRol=false;
    this.contRoles=0;
    if(r!=null && o !=null)
    {
    var cont=0;
      console.log("ENTRE");
      for(var i=0; i<this.UsedData.length; i++)
      {
        if(this.UsedData[i].rol == r && this.UsedData[i].org ==o )
        {
          cont++;
          this.contRoles=cont;
          if(this.UsedData[i].nombre == this.nameUser)
            this.bandDuplicatedUser=true;
          if(cont==2)
          {
            this.bandDuplicatedRol=true;
            break;
          }

        }
        else
          this.bandDuplicatedRol=false;
      }

      this.checkRolKey(r,o);
    }
    if(r!=null && this.usedRol!=null)
    {
      if(this.usedRol=="Administrador" || this.usedRol=="Core Management")
      {
        if(r!="Administrador" && r!="Core Management")
          this.bandDifRol=true;
      }
      else if(this.usedRol!=r)
      {
        this.bandDifRol=true;
      }
    }
  }
  checkRolKey(r,o)
  {
    console.log("CHECKING ROL KEY");
    var b1,b2;
    b1= this.UsedData.map(x=> {return x.rk}).indexOf(r+"-"+o+"-1");
    b2= this.UsedData.map(x=> {return x.rk}).indexOf(r+"-"+o+"-2");
    console.log("b1: " + b1 +  " b2: " +b2);
      if(b1==-1 && b2==-1)
        this.contRoles=1;
      else
      {
        if(b1!=-1)
          this.contRoles=2;
        if(b2!=-1)
          this.contRoles=1
      }

  }
  checkUserSelectedRoles()
  {
    this.usedRol=null;
    this.UsedData.forEach(e => {
    
      if(e.nombre==this.nameUser)
      {
        
        var ur=e.rol + "-" + e.org;
        this.userUsedRoles.push(ur);
        this.usedRol=e.rol;
        
      }
    });

  }
      
    
  
}
