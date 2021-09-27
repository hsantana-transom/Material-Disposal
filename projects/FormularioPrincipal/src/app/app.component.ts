import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormsService,MessageService, SharepointIntegrationService } from 'shared-lib';
import { map, startWith, switchMap } from 'rxjs/operators';
import { ɵangular_packages_platform_browser_platform_browser_k } from '@angular/platform-browser';
import { forkJoin, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { B } from '@angular/cdk/keycodes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { FlexStyleBuilder } from '@angular/flex-layout';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { DatePipe } from '@angular/common';
declare var uploadFile:any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  mainForm: FormGroup;
  npcz: any=[];
  nprx: any=[];
  npnew: any=[];
  status:string;
  filteredOptionsNPCZ: Observable<string[]>;
  filteredOptionsNPRX: Observable<string[]>;
  filteredOptionsNPNEW: Observable<string[]>;
  bandUploadingFile=false;
  bandFileRepeated=false;
  loading=false;
  filesFolder:string;
  files:any=[];
  files5years:any=[];
  filesForecast:any=[];
  filesCompletar:any=[];
  intTime;
  dataCurrentUser;
  url;
  wwidUser
  noRequest;
  isRequester=false;
  isCoreManager=false;
  isSupervisorAlmacen=false;
  isAprobador=false;
  dataRequester;
  dataAprobador;
  actualAprover;
  requestData;
  AprobacionLevel;
  bandButtonSave=false;
  bandButtonApprovalCore=false;
  bandButtonApproval=false;
  bandButtonReject=false;
  bandNpcz=false;
  bandNprx=false;
  bandNpnew=false;
  rechazadoPor:string;
  a1:string;
  a2:string;
  a3:string;
  a4:string;
  a5:string;
  a6:string;
  a7:string;
  a8:string;
  totalAmount=0;
  bandCoreApproval=false;
  bandApproverComments=false;
  approvalText:string;
  approvalButton:string;
  commentsApproverVar:string;
  listaComentarios:[]=[];
  bandAlmacenView=false;
  myOrgs=[];
  bandNPCZSelected=false;
  bandNPRXSelected=false;
  bandNPNewSelected=false;
 
  constructor(
    private fb: FormBuilder,
    private fs: FormsService,
    private snackbar: MatSnackBar,
    private sis: SharepointIntegrationService,
    private http: HttpClient,
    private message: MessageService,
  ) 
  {
    this.url=window.location.pathname.split('/');
    this.wwidUser= this.url[this.url.length - 2];
    this.noRequest= this.url[this.url.length - 1];
    this.getCurrentUser();
  }
  ngOnInit() {
    this.a1=this.a2=this.a3=this.a4=this.a5=this.a6=this.a7=this.a8='Pendiente';
    this.loading=true;
    this.filesFolder= "Request " +  this.noRequest + "-" + this.wwidUser;
    this.status='New';
    //this.getNPs('NPCZ');
    //this.getNPs('NPRX');
    //this.getNPs('NPNew');
    this.setupForm();
    this.mainForm.get("npcz").valueChanges.subscribe(r=>this.bandNPCZSelected=false);
    this.mainForm.get("nprx").valueChanges.subscribe(r=>this.bandNPRXSelected=false);
    this.mainForm.get("npnew").valueChanges.subscribe(r=>this.bandNPNewSelected=false);


  }
  getTotal()
  {
    console.log("calculando...");
    this.totalAmount= this.mainForm.get("oh").value * this.mainForm.get("unitPrice").value;
    
  }

  /**
   * disables all form controls
   */
   disableFields() {
    this.fs.disableFields(this.mainForm);
  }

  /**
   * enables all form controls
   */
  enableFields() {
    this.fs.enableFields(this.mainForm);
  }

  private setupForm() {
    
    this.mainForm = this.fb.group({
      id:null,
      npcz:[null,Validators.required],
      nprx:[null,Validators.required],
      npnew:[null,Validators.required],
      organization: [null,Validators.required],
      oh: [null,Validators.required],
      model:null,
      componente:null,
      comments:null,
      commentsCore:null,
      unitPrice:null,
      commentsApprover:null,
      fechaE: null,
      fechaS: null,
      commentsSupervisor:null,



    });
    this.mainForm.get("oh").valueChanges.subscribe(() => {this.getTotal(); this.checkCoreApprovalButton()});
    this.mainForm.get("unitPrice").valueChanges.subscribe(() => {this.getTotal();this.checkCoreApprovalButton()});

   

  }
  checkCoreApprovalButton()
  {
    if(this.mainForm.get("oh").value!=null && this.mainForm.get("unitPrice").value!=null)
      this.bandCoreApproval=true;
      else
      this.bandCoreApproval=false;
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    console.log(value);
    var Aux;
    
     Aux= this.npcz.filter(option => option.Segment.toLowerCase().indexOf(filterValue) === 0);
     console.log(Aux);
     return Aux;    
  }
  private _filterNprx(value: string): string[] {
    const filterValue = value.toLowerCase();
    var Aux;
     Aux= this.nprx.filter(option => option.Segment.toLowerCase().indexOf(filterValue) === 0);
     console.log(Aux);
     return Aux;    
  }
  private _filterNpnew(value: string): string[] {
    const filterValue = value.toLowerCase();
    var Aux;
     Aux= this.npnew.filter(option => option.Segment.toLowerCase().indexOf(filterValue) === 0);
     return Aux;    
  }
  getNPs(listName:string, org: string)
  {
    const data={
      select:['Id','Organization','Segment'],
      top:5000,
    };
    forkJoin([
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "1" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "2" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "3" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "4" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "5" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "6" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "7" + "')/items?$select=Id,Organization,Segment&$top=5000"),
      this.http.get("https://cummins365.sharepoint.com/sites/GRP_CC44493/_api/web/lists/getbytitle('" + listName + "8" + "')/items?$select=Id,Organization,Segment&$top=5000"),
    ]).subscribe(response =>{
      console.log("RESPONSE CONSULTAS NPCZ")
      console.log(response);
      var aux: any = response;
      switch(org)
        {
          case 'NPCZ':  this.npcz= [...aux[0].value, ...aux[1].value,  ...aux[2].value, ...aux[3].value, ...aux[4].value,...aux[5].value,...aux[6].value, ...aux[7].value]
          console.log(this.npcz);
          this.filteredOptionsNPCZ = this.mainForm.get('npcz').valueChanges.pipe(
            startWith(' '),
            map(value => this._filter(value)));
            this.bandNpcz=false;
            this.mainForm.get("npcz").enable();

          break;
          case 'NPRX': this.nprx=[...aux[0].value, ...aux[1].value,  ...aux[2].value, ...aux[3].value, ...aux[4].value,...aux[5].value,...aux[6].value, ...aux[7].value]
          console.log(this.nprx);
          this.filteredOptionsNPRX = this.mainForm.get('nprx').valueChanges.pipe(
            startWith(' '),
            map(value => this._filterNprx(value)));
            this.bandNprx=false;
            this.mainForm.get("nprx").enable();
          break;
          case 'NPNew': this.npnew=[...aux[0].value, ...aux[1].value,  ...aux[2].value, ...aux[3].value, ...aux[4].value,...aux[5].value,...aux[6].value, ...aux[7].value]
          console.log(this.npnew);
          this.filteredOptionsNPNEW = this.mainForm.get('npnew').valueChanges.pipe(
            startWith(' '),
            map(value => this._filterNpnew(value)));
            this.bandNpnew=false;
            this.mainForm.get("npnew").enable();
          break;
        }
      //this.npcz= [...aux[0].value, ...aux[1].value,  ...aux[2].value, ...aux[3].value, ...aux[4].value,...aux[5].value,...aux[6].value, ...aux[7].value]
      //console.log(this.npcz);
    })
    /*
    this.sis.read(listName,data).subscribe((response:any)=>{
      if(response)
      {
        switch(listName)
        {
          case 'NPCZ': this.npcz=response.value;
          console.log(this.npcz);
          this.filteredOptionsNPCZ = this.mainForm.get('npcz').valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value)));
          break;
          case 'NPRX': this.nprx=response.value;
          console.log(this.nprx);
          this.filteredOptionsNPRX = this.mainForm.get('nprx').valueChanges.pipe(
            startWith(''),
            map(value => this._filterNprx(value)));
          break;
          case 'NPNew': this.npnew=response.value;
          console.log(this.npnew);
          this.filteredOptionsNPNEW = this.mainForm.get('npnew').valueChanges.pipe(
            startWith(''),
            map(value => this._filterNpnew(value)));
          break;
        }
      }
    });*/
  }

  readFile(event,ButtonFile:string)
  {

    this.bandUploadingFile=true;
    const file= event.target.files[0].name;

    this.bandFileRepeated=this.checkFile(file.trim());
   

    if(this.bandFileRepeated==false)
    {
      this.loading=true;
      this.snackbar.open('Subiendo Archivo...', null, { duration:1000 });
      uploadFile(file.name,this.filesFolder, ButtonFile)
      this.intTime=setInterval(() =>{
        var bFile;
        bFile=localStorage.getItem('fileUp');
        console.log(bFile);
        this.snackbar.open('Subiendo Archivo...', null, { duration:1000 });
      //  bFile='true';//Eliminar
        if(bFile=='true')
        {
          this.snackbar.open('Archivo cargado correctamente!', null, { duration:1000 });
          switch(ButtonFile)
          {
            case '5yearsFiles': this.files5years.push(file);
            break;
            case 'ForecastFiles': this.filesForecast.push(file);
            break;
            case 'UserFiles': this.files.push(file);
            break;
            case 'completeFiles':this.filesCompletar.push(file);
            break;
          }
          
          clearInterval(this.intTime);
          this.bandUploadingFile=false;
          this.loading=false;
        }
        if(bFile=='false')
        {
          this.snackbar.open('Error al cargar el archivo.Intentalo de nuevo', null, { duration:1000 });
          this.bandUploadingFile=false;
          this.loading=false;
          clearInterval(this.intTime);

        }
      },2000)
     }
    /*console.log("5yearFiles");
    console.log(this.files5years);
    console.log("ForecastFiles");
    console.log(this.filesForecast);
    console.log("files");
    console.log(this.files);
    */


  }
  checkFile(fileName: string)
  {
    console.log(this.files);
    console.log(fileName);
    var aux;

    aux=this.files.indexOf(fileName);
    //console.log("AUX1");
    //console.log(aux);
    if (aux != -1 )
      return true;
  
    //console.log("AUX2");
    //console.log(aux);
    aux=  this.files5years.indexOf(fileName);
    console.log(aux);
    if (aux != -1 )
      return true;

    //console.log("AUX3");
    //console.log(aux);
    aux= this.filesForecast.indexOf(fileName);
    if (aux != -1 )
      return true;

    aux= this.filesCompletar.indexOf(fileName);
    if (aux != -1 )
      return true;
    
      return false;

  }
   /**
   * Deletes a file from de array 
   * @param index array index to delete
   */
    onDelete(index, fileArray)
    {
      switch(fileArray)
      {
        case "UserFiles": this.files.splice(index,1);
        break;
        case "files5years": this.files5years.splice(index,1);
        break;
        case "filesForecast": this.filesForecast.splice(index,1);
        break;
        case "completeFiles": this.filesCompletar.splice(index,1);
        break;
      }
        
    }
    onSubmit(pressedButton)
    {
      const datePipe = new DatePipe('en-US');
      this.loading=true;
      const values = this.mainForm.value;
      console.log("values")
      console.log(values)
      var filesAnexo= this.files.length>0 ? this.files.join() : null;
      var filesYears= this.files5years.length>0 ? this.files5years.join() : null;
      var filesFore= this.filesForecast.length>0 ? this.filesForecast.join() :  null;
      var filesCom= this.filesCompletar.length>0 ? this.filesCompletar.join() : null;
      values.commentsApprover= values.commentsApprover!=null ? values.commentsApprover : "";
      const data: any = {
        __metadata: { type: 'SP.Data.MainFormListItem' },
       // Id: values.id ? values.id : null,
        Organizacion: values.organization,
        NPCZ: values.npcz,
        NPRX: values.nprx,
        NPNew: values.npnew,
        OH: values.oh.toString(),  
        Modelo:values.model,
        Component: values.componente,
        Comentarios: values.comments,
        Files: filesAnexo,
        SalesLast: filesYears,
        SalesForecast: filesFore,
        wwidUser: this.wwidUser,
        NoRequest: this.noRequest,
        ComentariosCore: values.commentsCore,
        unitPrice:values.unitPrice ? values.unitPrice.toString() :  null
        

        //Nombre: {ID:values.loginName,Name:this.loginUserName},
        //Manager:{ID:values.loginNameSupervisor, Name: this.loginSuperName} 
      };
      switch(pressedButton)
      {
        case 'Guardar':
          data.Estatus= 'Under Review';
          data.Aprobacion='Core Management'
        break;
        case 'aprobadoByCore': 
          data.Estatus= 'Awaiting Approval';
          data.Aprobacion='Planeador';
        break;
        case 'aprobado':
          var todayDate= new Date();
          var stringDate=  datePipe.transform(todayDate, 'dd-MM-yyyy');
          switch(this.AprobacionLevel)
          {
            case 'Planeador': 
              data.Aprobacion= 'Gerente de Planeacion';
              data.ComentariosAprobador= "Planeador - " + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" + "&&";   
            break;
            case 'Gerente de Planeacion':
              data.Aprobacion= 'Ingeniero de Producto';
              data.ComentariosAprobador= this.commentsApproverVar + "Gerente de Planeación - "  + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" + "&&";   
            break;
            case 'Ingeniero de Producto':
              data.Aprobacion='Gerente de Ingenieria';
              data.ComentariosAprobador= this.commentsApproverVar + "Ingeniero de Producto - " + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" + "&&";   
            break;
            case 'Gerente de Ingenieria':
              data.Aprobacion='Coordinador de Finanzas';
              data.ComentariosAprobador= this.commentsApproverVar + "Gerente de Ingenieria - " + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" + "&&";
            break;
            case 'Coordinador de Finanzas':
              data.Aprobacion='Gerente de Control de Produccion';
              data.ComentariosAprobador= this.commentsApproverVar + "Coordinador de Finanzas - " + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" + "&&";
            break
            case 'Gerente de Control de Produccion':
              data.Aprobacion='Director de Planta';
              data.ComentariosAprobador= this.commentsApproverVar + "Gerente de Control de Producción - " + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" + "&&";
            break;
            case 'Director de Planta':
              data.Estatus='Approved';
              data.Aprobacion='Aprobado';
              data.ComentariosAprobador= this.commentsApproverVar + "Director de Planta - " + this.dataAprobador[0].Nombre + ": " + values.commentsApprover + " (" + stringDate  + ")" ;
            break;

          }
        break;
        case 'rechazado':
          data.Estatus='Rejected';
          data.RejectedBy=this.AprobacionLevel;
          data.ComentariosAprobador= this.commentsApproverVar  + this.AprobacionLevel + " - " + this.dataAprobador[0].Nombre + ": " +  values.commentsApprover + " (" + stringDate  + ")" ;
          data.Aprobacion='Rechazado';
        break;
        case 'completado':
          data.Estatus="Complete";
          data.FechaEntrega=values.fechaE.toISOString();
          data.FechaSalida= values.fechaS.toISOString();
          data.ComentariosAlmacen= values.commentsSupervisor;
          data.completeFiles= filesCom;
          data.Aprobacion='Completado';
        
        break;
      }

      if (values.id) {
        data.Id = values.id;
      }

      console.log(data);

      return this.sis.getFormDigest().pipe(
        switchMap(formDigest => {
          return this.sis.save('MainForm', data, formDigest);
        })
      ).subscribe(r => {
        this.loading=false
      },
      err => this.message.genericHttpError(err),
      () =>
      {
        switch(data.Estatus)
        {
          case 'Under Review':
            this.snackbar.open('Enviado a aprobación', null, { duration:3000 });
          break;
          case 'Awaiting Approval':
            this.snackbar.open('Aprobado', null, { duration:3000 });
          break;
          case 'Rejected':
            this.snackbar.open('Rechazado', null, { duration:3000 });
          break;
          case 'Complete':
            this.snackbar.open('Solicitud completa', null, { duration:3000 });
          break;
        }
       
        window.location.href = '/sites/GRP_CC44493/';
      }
      );
      
    }
     /**
   * gets current user
   */
  getCurrentUser()
  {
    this.sis.readCurrentUser().subscribe(res=>{
      console.log(res);
      this.dataCurrentUser=res;
      console.log(this.dataCurrentUser.LoginName);
      if(this.dataCurrentUser.LoginName.includes(this.wwidUser))
      {
         this.isRequester=true;
         this.getExistingData();

      }
      else{
        this.getUserRole(this.dataCurrentUser.LoginName);
      }
    
      
    })
  }
  getExistingData()
  {
    var bo;
    const data = {
      select: ['Id', 'Organizacion','Estatus','NPCZ','NPRX','NPNew', 'OH', 'Modelo',
                'Component', 'SalesLast', 'SalesForecast','Comentarios','Files', 'Aprobacion',
                'wwidUser','NoRequest','ComentariosCore','RejectedBy','unitPrice','ComentariosAprobador',
                'FechaEntrega', 'FechaSalida', 'completeFiles', 'ComentariosAlmacen'
              ],
      top: 1,
      filter:["wwidUser eq '" + this.wwidUser  + "'", "NoRequest eq " + this.noRequest],
    };
    this.sis.read('MainForm', data).subscribe(res=>{
      this.requestData=res;
      console.log("RequestDATA");
      console.log(this.requestData);
      console.log(this.myOrgs);

      if(this.requestData.value.length > 0)
      { 

        bo= this.myOrgs.map(x=> {return x}).indexOf(this.requestData.value[0].Organizacion);
        console.log("bo: " + bo);
        if(bo==-1)
        {
          this.isAprobador=false;
          this.isCoreManager=false;
          this.isSupervisorAlmacen=false;
        }

        if(this.requestData.value[0].Estatus!='New')
          this.disableFields();
        if(this.requestData.value[0].Estatus=="Under Review" && this.isCoreManager)
        {
          this.mainForm.get('componente').enable();
          this.mainForm.get('model').enable();
          this.mainForm.get('oh').enable();
          this.mainForm.get('unitPrice').enable();
          this.mainForm.get('commentsCore').enable();
          this.setupForm();
        }
        if(this.requestData.value[0].Estatus=="Approved" && this.isSupervisorAlmacen)
        {
          this.mainForm.get('fechaS').enable();
          this.mainForm.get('fechaE').enable();
          this.mainForm.get('commentsSupervisor').enable();
          this.setupForm();
        }
        if(this.requestData.value[0].Estatus=="Awaiting Approval")
        {
          this.mainForm.get("commentsApprover").enable();
          this.setupForm();
        }
        this.mainForm.patchValue({
          id: this.requestData.value[0].Id,
          npcz: this.requestData.value[0].NPCZ,
          nprx:this.requestData.value[0].NPRX,
          npnew:this.requestData.value[0].NPNew,
          organization: this.requestData.value[0].Organizacion,
          oh: this.requestData.value[0].OH,
          model:this.requestData.value[0].Modelo,
          componente:this.requestData.value[0].Component,
          comments:this.requestData.value[0].Comentarios,
          commentsCore:this.requestData.value[0].ComentariosCore,
          unitPrice: this.requestData.value[0].unitPrice,
          fechaS: this.requestData.value[0].FechaSalida ? new Date(this.requestData.value[0].FechaSalida) : null,
          fechaE: this.requestData.value[0].FechaEntrega ? new Date(this.requestData.value[0].FechaEntrega) : null,
          commentsSupervisor: this.requestData.value[0].ComentariosAlmacen

        });
        this.status=this.requestData.value[0].Estatus;
        this.AprobacionLevel= this.requestData.value[0].Aprobacion;
        this.commentsApproverVar= this.requestData.value[0].ComentariosAprobador;
        this.listaComentarios = this.requestData.value[0].ComentariosAprobador ? this.requestData.value[0].ComentariosAprobador.split("&&") : null;

        this.bandNPCZSelected=true;
        this.bandNPRXSelected=true;
        this.bandNPNewSelected=true;

        if(this.status=="Rejected")
          this.rechazadoPor= this.requestData.value[0].RejectedBy
        if(this.status=="Approved" || this.status=="Complete")
        {
          this.bandAlmacenView=true;
        }
        if(this.requestData.value[0].Files!=null)
          this.files= this.requestData.value[0].Files.split(',');
        if(this.requestData.value[0].SalesLast!=null)
          this.files5years= this.requestData.value[0].SalesLast.split(',');
        if(this.requestData.value[0].SalesForecast!=null)
          this.filesForecast= this.requestData.value[0].SalesForecast.split(',');
        if(this.requestData.value[0].completeFiles!=null)
          this.filesCompletar= this.requestData.value[0].completeFiles.split(',');
        this.setAprobaciones();
        
        	
	

        if(this.isAprobador)
          this.setApprovalValidations();
        this.loading=false;
      }
      else
      {
        this.loading=false;
        if(this.status=="New")
        {
          this.mainForm.get('commentsCore').disable();
          this.mainForm.get('unitPrice').disable();
        }
      }
     

      
    });
  }
  setAprobaciones()
  {
    //set Aprobados
    if(this.status=="Awaiting Approval")
      this.a1='Aprobado';
    if(this.status=="Awaiting Approval" && this.AprobacionLevel=='Gerente de Planeacion')
      this.a2='Aprobado';
    if(this.status=="Awaiting Approval"  && this.AprobacionLevel=='Ingeniero de Producto')
      this.a3=this.a2='Aprobado';
    if(this.status=="Awaiting Approval" && this.AprobacionLevel=='Gerente de Ingenieria')
      this.a4=this.a3=this.a2='Aprobado';
    if(this.status=="Awaiting Approval"  && this.AprobacionLevel=='Coordinador de Finanzas')
      this.a5=this.a4=this.a3=this.a2='Aprobado';
    if(this.status=="Awaiting Approval"  && this.AprobacionLevel=='Gerente de Control de Produccion')
      this.a6=this.a5=this.a4=this.a3=this.a2='Aprobado';
    if(this.status=="Awaiting Approval" && this.AprobacionLevel=='Director de Planta')
      this.a7=this.a6=this.a5=this.a4=this.a3=this.a2='Aprobado';
    if(this.status=="Approved" || this.status=="Complete" )
      this.a8=this.a1=this.a2=this.a3=this.a4=this.a5=this.a6=this.a7='Aprobado';

    //Set Rechazado

    if(this.status=='Rejected' && this.rechazadoPor=='Core Management')
    { 
      this.a1='Rechazado';
      //this.a2=this.a3=this.a4=this.a5=this.a6=this.a7=this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Planeador')
    { 
      this.a2='Rechazado';
      this.a1='Aprobado';
      //this.a3=this.a4=this.a5=this.a6=this.a7=this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Gerente de Planeacion')
    { 
      this.a3='Rechazado';
      this.a1=this.a2='Aprobado';
      //this.a4=this.a5=this.a6=this.a7=this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Ingeniero de Producto')
    { 
      this.a4='Rechazado';
      this.a1=this.a2=this.a3='Aprobado';
      //this.a5=this.a6=this.a7=this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Gerente de Ingenieria')
    { 
      this.a5='Rechazado';
      this.a1=this.a2=this.a3=this.a4='Aprobado';
      //this.a6=this.a7=this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Coordinador de Finanzas')
    { 
      this.a6='Rechazado';
      this.a1=this.a2=this.a3=this.a4=this.a5='Aprobado';
      //this.a7=this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Gerente de Control de Produccion')
    { 
      this.a7='Rechazado';
      this.a1=this.a2=this.a3=this.a4=this.a5=this.a6='Aprobado';
      //this.a8="Pendiente"
    }
    if(this.status=='Rejected' && this.rechazadoPor=='Director de Planta')
    {
      this.a8='Rechazado';
      this.a1=this.a2=this.a3=this.a4=this.a5=this.a6=this.a7='Aprobado';
    }
    
  }
  setApprovalValidations()
  {
    console.log("SET APPROVAL VALIDATIONS")
    console.log(this.status);
    console.log(this.AprobacionLevel);
    
    
    if(this.status!='New' && this.status!="Approved" && this.status!="Rejected")
    {
      if(this.status=="Under Review" && this.isCoreManager)
      {
        
        this.bandButtonApproval=false;
        this.bandButtonApprovalCore=true;
        this.bandButtonReject=true;
      } 
      if(this.status=="Awaiting Approval")     
      {
        if(this.AprobacionLevel=='Planeador' && this.dataAprobador[0].Rol=='Planeador' ||
          this.AprobacionLevel=='Gerente de Planeacion' && this.dataAprobador[0].Rol=='Gerente de Planeación' ||
          this.AprobacionLevel=='Ingeniero de Producto' && this.dataAprobador[0].Rol=='Ingeniero de Producto' ||
          this.AprobacionLevel=='Gerente de Ingenieria' && this.dataAprobador[0].Rol=='Gerente de Ingeniería' ||
          this.AprobacionLevel=='Coordinador de Finanzas' && this.dataAprobador[0].Rol=='Coordinador de Finanzas' ||
          this.AprobacionLevel=='Gerente de Control de Produccion' && this.dataAprobador[0].Rol=='Gerente de Control de Producción' ||
          this.AprobacionLevel=='Director de Planta' && this.dataAprobador[0].Rol=='Director de Planta' 
        )
        {
          this.bandButtonApproval=true;
          this.bandButtonApprovalCore=false;
          this.bandButtonReject=true;
        }
        else{
          this.bandButtonApproval=false;
          this.bandButtonApprovalCore=false;
          this.bandButtonReject=false;
        }
        this.getTotal();
      }

    }
  


  }
  getUserRole(ln)
  {
    const data = {
      select: ['Id', 'Rol','NombreId','Nombre/Title','Nombre/Name','Organizacion'],
      expand:['Nombre'],
      //top:1,
      filter:["Nombre/Name eq '" + encodeURIComponent(ln)  + "'", "Rol ne 'Administrador'" ],
      
    };
    this.sis.read('Roles', data)
    .pipe(
      map((users: any) => this.getRolesInfo(users.value)),
    ).subscribe(response =>{
      if(response)
      {
        this.dataAprobador=response;
        console.log("DATAAPROBADOR");
        console.log(this.dataAprobador);
        this.dataAprobador.forEach(e => {
          this.myOrgs.push(e.Org);
        });
    
        this.isAprobador=true;
        if(this.dataAprobador[0].Rol=="Core Management")
          this.isCoreManager=true
        else if(this.dataAprobador[0].Rol=="Supervisor de Almacén")
        {
          this.isSupervisorAlmacen=true;
        }
        else
          this.isAprobador=true;
        console.log("IS CORE MANAGER: " + this.isCoreManager);
        console.log("IS APPROVER: " + this.isAprobador);
      }
      this.getExistingData();

    });
  }
  getRolesInfo(users:any[])
  {
      
    return users.map(r =>({
      id: r.Id,
      Nombre: r.Nombre.Title,
      LoginName: r.Nombre.Name,
      Rol: r.Rol,
      Org:r.Organizacion
    }))
  }
  cancelRequest()
  {
    window.location.href='/sites/GRP_CC44493';
  }
  CheckOrganizationSelected(event)
  {
    console.log(event);
    this.mainForm.get("npcz").setValue("");
    this.mainForm.get("nprx").setValue("");
    this.mainForm.get("npnew").setValue("");

    this.mainForm.get("npcz").disable();
    this.mainForm.get("nprx").disable();
    this.mainForm.get("npnew").disable();
    switch(event)
    {
      case "DRC":
        this.bandNpcz=true;
        this.bandNprx=true;
        this.bandNpnew=true;
        this.getNPs("NPCZ-DRC-","NPCZ");
        this.getNPs("NPRX-DRC-","NPRX");
        this.getNPs("NPNew-DRC-","NPNew");
      break;
      case "DCM":
        this.bandNpcz=true;
        this.bandNprx=true;
        this.bandNpnew=true;
        this.getNPs("NPCZ-DCM-","NPCZ");
        this.getNPs("NPRX-DCM-","NPRX");
        this.getNPs("NPNew-DCM-","NPNew");
      break;
      case "WBC":
      case "EATON":
        this.bandNpcz=true;
        this.bandNprx=true;
        this.bandNpnew=true;
        this.getNPs("NPCZ-WBC-","NPCZ");
        this.getNPs("NPRX-WBC-","NPRX");
        this.getNPs("NPNew-WBC-","NPNew");
      break;
    }
  }
  openAppovalCard(val)
  {
    this.approvalButton=val;
    switch(val)
    {
      case "aprobado":this.approvalText="¿Aprobar?";
      break;
      case "rechazado":this.approvalText="¿Rechazar?";
      break;
    }
    
    this.bandApproverComments=true;
  }
  optionSelected(opt,control:string)
  {
    console.log(opt);
    console.log(control);
    switch(control)
    {
      case 'npcz':this.bandNPCZSelected=true;
      break;
      case 'nprx':this.bandNPRXSelected=true;
      break;
    }
  }

}
