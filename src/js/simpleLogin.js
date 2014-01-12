
/**
 * Funciones para autenticar a un usuario mediante
 * el API de Google Drive.
 *
 * Created on: 10 de Enero del 2014.
 * @author: Aguirre Alvarez J Giovanni.
 *
 */


// Variables de configuracion de la libreria
// utilizando las credenciales de 'Cloud Noises'
var CLIENT_ID = '193851110022-0kep9bunm764avib2q8roca0l8gum2g9.apps.googleusercontent.com';
var SCOPES    = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];


/** Se ejecuta cuando la libreria es cargada */
function handleClientLoad() 
{
    console.log("Libreria cargada exitosamente");
}

/** 
 * Autenticacion del usuario mediante su cuenta Google
 * esta funcion se ejecuta con el boton: 'inciar sesion' 
*/
function loginUser() 
{
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'inmediate': true
        },
        function(authResult) 
        {
            if (authResult) {
                console.log("Autenticacion exitosa");
            }
            else {
                console.log("Error al autenticar");
            }
        }
    );
}