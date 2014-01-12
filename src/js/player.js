
/**
 * Codigo javascript para el reproductor cloud noises con el API
 * de Google Drive
 *
 * Created on: 12 de Enero del 2014
 * @author: Aguirre Alvarez J Giovanni.
 *
 */

// Variables de configuracion de la libreria
// utilizando las credenciales de cloud noises
var CLIENT_ID = '193851110022-0kep9bunm764avib2q8roca0l8gum2g9.apps.googleusercontent.com';
var SCOPES    = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
var accessToken;

var playlist = [];
var indexCurrentSong = -1;

/**
 * Esta funcion se ejecuta una vez que el API de GDrive se ha
 * cargado exitosamente. La llamada a la funcion se asigna
 * en la etiqueta <scrip> correspondiente al cliente GDrive
 * en el codigo html que implementa este script
 */
function handleClientLoad() {
    loginUser();
}

/** Agrega las pistas de un folder al playlist */
function agregarFolder() {
    gapi.load('picker', { 'callback': function() {
        var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
        view.setSelectFolderEnabled(true);
        view.setMode(google.picker.DocsViewMode.LIST);
        
        var picker = new google.picker.PickerBuilder()
            .setAppId(CLIENT_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setTitle("Elige un folder que contenga musica")
            .setCallback(function (data) {
                if (data.action == google.picker.Action.PICKED) {
                    encolarPistas(data.docs[0].id);
                };
            })
            .build();
        picker.setVisible(true);
    }});
}

function encolarPistas(folderId) {
    var request = gapi.client.request({
        'path': '/drive/v2/files/'+folderId+'/children',
        'method': "GET",
        'params': { 'q': 'mimeType=\'audio/mpeg\'' }
    });
    request.execute(function (response) {
        for (var i = 0; i < response.items.length; i++) {
            gapi.client.request({
                'path': '/drive/v2/files/'+response.items[i].id,
                'method': 'GET'
            }).execute(function (resp) {
                var song = {
                    title: resp.title,
                    duration: resp.duration,
                    source: resp.webContentLink
                }
                playlist.push(song);
                $("#playlist").append("<span id=\"song-" + playlist.length + "\">" + playlist.length + ". " + song.title + "</span><br>");
                if (indexCurrentSong === -1)
                {
                    nextSong();
                };
            })
        };
    });
}

/** Agrega un archivo al playlist mediante un 'file-picker' */
function agregarArchivos() {
    gapi.load('picker', { 'callback': function () {
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("audio/mpeg");
        
        var picker = new google.picker.PickerBuilder()
            .setAppId(CLIENT_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback(function (data) {
                if (data.action == google.picker.Action.PICKED) {
                    gapi.client.request({
                        'path': '/drive/v2/files/'+data.docs[0].id,
                        'method': 'GET'
                    }).execute(function (resp) {
                        var song = {
                            title: resp.title,
                            duration: resp.duration,
                            source: resp.webContentLink
                        }
                        playlist.push(song);
                        $("#playlist").append("<span id=\"song-" + playlist.length + "\">" + playlist.length + ". " + song.title + "</span><br>");
                        if (indexCurrentSong === -1)
                        {
                            nextSong();
                        };
                    })
                };
            })
            .build();
        picker.setVisible(true);
    }})
}

// Reproduce la siguiente pista de audio del playlist (Si hay alguna)
function nextSong() {
    if (indexCurrentSong < playlist.length-1)
    {
        var nextSong = playlist[indexCurrentSong+1];
        var audio = document.getElementById("audio-player");
        if (!audio.paused) { audio.pause() };
        audio.src = nextSong.source;
        audio.play();
        indexCurrentSong++;
        destacarPista(indexCurrentSong + 1);
        //console.log("Resproduciendo pista: " + indexCurrentSong + ". " + nextSong.title);
    }
}

// Reproduce la pista anterior del playlist (Si esta disponible)
function prevSong() {
    if (indexCurrentSong > 0)
    {
        var prevSong = playlist[indexCurrentSong-1];
        var audio = document.getElementById("audio-player");
        if (!audio.paused) { audio.pause() };
        audio.src = prevSong.source;
        audio.play();
        indexCurrentSong--;
        destacarPista(indexCurrentSong + 1);
        //console.log("Resproduciendo pista: " + indexCurrentSong + ". " + prevSong.title);
    };
}

// Marca con color rojo la pista especificada.
// el resto de pistas, se marcan de color negro.
// util para marcar la pista que se reproduce actualmente
function destacarPista(indexOnPlaylist){
    for (var i = 1; i<=playlist.length; i++) 
    {
        var id_song = "#song-" + i;
        $(id_song).css("color", "black");
    };
    var id = "#song-" + indexOnPlaylist;
    $(id).css("color", "red");
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