
/**
 * Funciones para autenticar a un usuario mediante
 * el API de Google Drive, mostar metadatos de algun archivo
 * mediante el Picker de Google y para Descargar y cargar archivos.
 *
 * Created on: 10 de Enero del 2014.
 * @author: Aguirre Alvarez J Giovanni.
 *
 */


// Variables de configuracion de la libreria
// utilizando las credenciales de 'Cloud Noises'
var CLIENT_ID = '193851110022-0kep9bunm764avib2q8roca0l8gum2g9.apps.googleusercontent.com';
var SCOPES    = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    
var accessToken;

/**
 * Permite seleccionar un archivo y muestra metadatos
 * de este con el apoyo de otras funciones.
 */
function pickupFile() {
    gapi.load('picker', { 'callback': function () {
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        //view.setMimeTypes("image/png,image/jpeg,image/jpg");
        
        var picker = new google.picker.PickerBuilder()
            //.enableFeature(google.picker.Feature.NAV_HIDDEN)
            //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(CLIENT_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    } });
}

/**
 * Permite seleccionar un folder desde GDrive
 * y muestra metadatos sobre este.
 */
function pickupFolder() {
    gapi.load('picker', { 'callback': function() {
        var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
        //view.setIncludeFolders(true);
        view.setSelectFolderEnabled(true);
        view.setMode(google.picker.DocsViewMode.LIST);
        
        var picker = new google.picker.PickerBuilder()
            .setAppId(CLIENT_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setTitle("Elige tu carpeta de musica.")
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }});
}

/**
 * Busca audio dentro de un folder elegido mediante un 'file-picker'
 */
function searchForAudio() {
    gapi.load('picker', { 'callback': function() {
        var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
        view.setSelectFolderEnabled(true);
        view.setMode(google.picker.DocsViewMode.LIST);
        
        var picker = new google.picker.PickerBuilder()
            .setAppId(CLIENT_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setTitle("Elige una carpeta para buscar audio en ella")
            .setCallback(function (data) {
                if (data.action == google.picker.Action.PICKED){
                    listFiles(data.docs[0].id, 'audio/mpeg');
                };
            })
            .build();
        picker.setVisible(true);
    }})
}

// Es llamada como 'callback' del file-picker anterior
function pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED)
    {
        var request = gapi.client.request({
            'path': '/drive/v2/files/' + data.docs[0].id,
            'method': "GET"
        });
        request.execute(function (response) {
            if (response.mimeType === 'application/vnd.google-apps.folder')
            {
                despMetadataFolder(response);
            }
            else
            {
                despMetadataFile(response);
            };
        });
    };
}

/** Muestra metadatos de un archivo por consola */
function despMetadataFile(file) {
    console.log("Se eligio un archivo: --- --- ---");
    console.log("Id: " + file.id);
    console.log("Titulo: " + file.title);
    console.log("MIME Type: " + file.mimeType);
    console.log("Download link: " + file.webContentLink);
    console.log("File extension: " + file.fileExtension)
}

/** Muestra datos sobre algun folder en consola */
function despMetadataFolder(folder) {
    console.log("Se eligio un folder: --- --- ---");
    console.log("folderId: " + folder.id);
    console.log("Nombre: " + folder.title);
    listFiles(folder.id, null);
}

/** Despliega los archivos de un determinado folder */
function listFiles(folderId, mimeTypeFilter) {
    if (mimeTypeFilter != null) {
        var request = gapi.client.request({
            'path': '/drive/v2/files/' + folderId + '/children',
            'method': "GET",
            'params': { 'q': 'mimeType=\''+mimeTypeFilter+'\''}
        });
    } else {
        var request = gapi.client.request({
            'path': '/drive/v2/files/' + folderId + '/children',
            'method': "GET"
        });
    }
    request.execute(function (response) {
        console.log("El folder contiene los siguientes archivos: ");
        for (var i = 0; i < response.items.length; i++) {
            gapi.client.request({
                'path': '/drive/v2/files/'+response.items[i].id,
                'method': "GET"
            }).execute(function (resp) {
                console.log("   |- " + resp.title);
            })
        };
    }) 
}

/** 
 * Autenticacion del usuario mediante su cuenta Google
 * esta funcion se ejecuta con el boton: 'inciar sesion' 
 */
function loginUser() {
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
                accessToken = authResult.access_token;
            }
            else {
                console.log("Usuario no autenticado ... :(");
            }
        }
    );
}