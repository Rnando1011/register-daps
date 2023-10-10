import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders} from "@angular/common/http";
import { Observable, throwError, from  } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Usuario } from '../shared/Usuario';
import { Material } from '../shared/Material';
import { Registro } from '../shared/Registro';
import { Empleado } from '../shared/Empleado';

import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class APIRESTService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'
  })
  };

  usuario:Usuario;

  token:string;

  /**
   * Url base del servidor donde se encuentran nuestros endpoints
   */
  url:string="http://172.24.178.155/";
  //url:string="http://172.22.2.78/";


  /**
   * Constructor por medio del se inyectan los servicios que utilizan en esta clase
   * @param http Es el servicio por medio del cual se consumen los servicios rest en la Web
   * @param platform Es el servicio que nos indica sobre que plataforma esta corriendo la aplicación
   * @param alertController El servicio de alerta, para mostras mensajes importantes al usuario
   * @param router Es el servicio que nos permite enrutar nuestra aplicación a una pantalla en especifico
   */

  constructor(private http: HttpClient, public platform: Platform
    , private alertController:AlertController,
    private router:Router) {
    console.log('Servicio HTTP:');
  }



    async presentAlert() {
      const alert = await this.alertController.create({
        header: 'Sesión Caducada',
        //subHeader: 'Important message',
        message: 'Vuelva a iniciar sesión por favor!',
        buttons: ['OK'],
      });
      await alert.present();
    }

    async rolAlert() {
      const alert = await this.alertController.create({
        header: 'Accion No permitida',
        subHeader: 'Usuario Despachador no puede actualizar o eliminar materiales!!!',
        message: 'Solicite al administrador los permisos correspondientes para realizar esta acción',
        buttons: ['OK'],
      });
      await alert.present();
    }

    setToken(token:string):void{
      console.log("Token recibido en el setToken: "+token);
      this.token=token;
      console.log('Seteo el token al servicio APIREST: '+this.token);
    }

    getAuthorizationToken():string{
      return 'Bearer ' + this.token;
    }

    validarRolUsuario():Boolean{
      if(this.usuario.Rol==='Despachador'){
        this.rolAlert();
        this.router.navigate(['/menu']);
        return false;
      }
      return true;
    }


    login(url:string , usuario: Usuario): Observable<Usuario> {
      url=this.url+url;
      console.log("Url: "+url);
      console.log("Usuario: "+usuario.Usuario+"  "+usuario.Password);

      if (this.platform.is('hybrid')) {
        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },
          data: usuario,
        };

        return from(CapacitorHttp.post(options))
        .pipe(map((response:HttpResponse)=>{
          console.log("Logro consumir el restapi nativamente");
          if((response.status!==200)&&(response.status!==201)){
            console.log('Credenciales no Validas, http nativo');
            throw new Error('Credenciales No Validas');
          }
          console.log(response);
          usuario.Password="";
          usuario=response.data;
          this.usuario=usuario;
          console.log("Usuario: "+usuario.token);
          return usuario;
        }));

      }else{
        return this.http.post<Usuario>(url, usuario, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al Logearse en el servidor");
              console.log(err.json);
              return throwError(err);
            }
          )
        );
      }

    }

    //Bro, te podes basar en este metodo
    obtenerMateriales(url:string): Observable<Material[]>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },

        };

        let materiales:Material[]=[];
        /*CapacitorHttp.get(options).then(response=>{
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          console.log("Estatus: "+response.status);
          console.log("Headers: "+response.headers);
          console.log("Data: "+response.data);
          materiales=response.data;

        });
        console.log("Materiales Obtenidos: "+materiales.length);
        return of(materiales);*/
        return from(CapacitorHttp.get(options))
        .pipe(map((response:HttpResponse)=>{
          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          materiales=response.data;
          console.log("Materiales: "+materiales.length);
          return materiales;
        }));
      }else{
        return this.http.get<Material[]>(url, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al obtener materiales del servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }



    }

    obtenerRegistros(url:string): Observable<Registro[]>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },

        };

        let registros:Registro[]=[];
        /*CapacitorHttp.get(options).then(response=>{
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          console.log("Estatus: "+response.status);
          console.log("Headers: "+response.headers);
          console.log("Data: "+response.data);
          registros=response.data;

        });
        console.log("Registros Obtenidos: "+registros.length);
        return of(registros);*/
        return from(CapacitorHttp.get(options))
        .pipe(map((response:HttpResponse)=>{
          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          registros=response.data;
          console.log("Registros: "+registros.length);
          return registros;
        }));
      }else{
        return this.http.get<Registro[]>(url, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al obtener registros del servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }

    }

    obtenerEmpleados(url:string): Observable<Empleado[]>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },

        };

        let empleados:Empleado[]=[];
        /*CapacitorHttp.get(options).then(response=>{
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          console.log("Estatus: "+response.status);
          console.log("Headers: "+response.headers);
          console.log("Data: "+response.data);
          empleados=response.data;

        });
        console.log("Empleados Obtenidos: "+empleados.length);
        return of(empleados);*/
        return from(CapacitorHttp.get(options))
        .pipe(map((response:HttpResponse)=>{
          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          empleados=response.data;
          console.log("Empleados: "+empleados.length);
          return empleados;
        }));
      }else{

      }
      return this.http.get<Empleado[]>(url, this.httpOptions).pipe(
        catchError(err => {
            // onError
            console.log("Error capturado al obtener Empleados del servidor");
            console.log(err);
            return throwError(err);
          }
        )
      );
    }

    obtenerUsuarios(url:string): Observable<Usuario[]>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },

        };

        let usuarios:Usuario[]=[];
        /*CapacitorHttp.get(options).then(response=>{
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          console.log("Estatus: "+response.status);
          console.log("Headers: "+response.headers);
          console.log("Data: "+response.data);
          usuarios=response.data;

        });
        console.log("Usuarios Obtenidos: "+usuarios.length);
        return of(usuarios);*/
        return from(CapacitorHttp.get(options))
        .pipe(map((response:HttpResponse)=>{
          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }
          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          usuarios=response.data;
          console.log("Usuarios: "+usuarios.length);
          return usuarios;
        }));
      }else{
        return this.http.get<Usuario[]>(url, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al obtener Usuarios del servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }

    }




    enviarNuevoMaterial(url:string, material:Material): Observable<Material>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },
          data: material,
        };

        return from(CapacitorHttp.post(options))
        .pipe(map((response:HttpResponse)=>{
          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }

          if((response.status!==200)&&(response.status!==201)){
            console.log('Material no Ingresado');
            throw new Error('Material no Ingresado');
          }


          console.log("Logro consumir el restapi nativamente: "+response.status);
          console.log(response);
          material=response.data;
          console.log("Material: "+material.Descripcion);
          return material;
        }));
      }else{
        return this.http.post<Material>(url, material, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al enviar materiales al servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }
    }

    enviarNewRegister(url:string, registro:Registro): Observable<Registro>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },
          data: registro,
        };

        return from(CapacitorHttp.post(options))
        .pipe(map((response:HttpResponse)=>{
          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }

          if((response.status!==200)&&(response.status!==201)){
            console.log('Registro no Ingresado');
            throw new Error('Registro no Ingresado');
          }

          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          registro=response.data;
          console.log("Registro: "+registro.Descripcion);
          return registro;
        }));
      }else{
        return this.http.post<Registro>(url, registro, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al enviar registros al servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }

    }

    actualizarMaterial(url:string, material:Material): Observable<Material>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },
          data: material,
        };

        return from(CapacitorHttp.post(options))
        .pipe(map((response:HttpResponse)=>{


          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }


          if((response.status!==200)&&(response.status!==201)){
            console.log('Material no Actualizado');
            throw new Error('Material no Actualizado');
          }


          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          material=response.data;
          console.log("Material: "+material.Descripcion);
          return material;
        }));
      }else{
        return this.http.post<Material>(url, material, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al actualizar el materiale en el servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }
    }

    eliminarMaterial(url:string, material:Material): Observable<Material>{
      url=this.url+url;
      if (this.platform.is('hybrid')) {

        const options = {
          url: url,
          headers: { 'Content-Type': 'application/json',
          'Authorization':this.getAuthorizationToken()
          },
          data: material,
        };

        return from(CapacitorHttp.post(options))
        .pipe(map((response:HttpResponse)=>{


          if (response.status === 401) {
            console.log("Token caducado");
            this.presentAlert();
            this.router.navigate(['/login']);
          }


          if((response.status!==200)&&(response.status!==201)){
            console.log('Material no Actualizado');
            throw new Error('Material no Actualizado');
          }


          console.log("Logro consumir el restapi nativamente");
          console.log(response);
          material=response.data;
          console.log("Material: "+material.Descripcion);
          return material;
        }));
      }else{
        return this.http.post<Material>(url, material, this.httpOptions).pipe(
          catchError(err => {
              // onError
              console.log("Error capturado al actualizar el materiale en el servidor");
              console.log(err);
              return throwError(err);
            }
          )
        );
      }
    }

}
