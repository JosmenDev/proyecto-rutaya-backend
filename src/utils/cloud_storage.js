// Cargar dotenv para usar variables de entorno
require('dotenv').config();

const { Storage } = require('@google-cloud/storage');
const { format } = require('util');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();

// Crear el objeto serviceAccount a partir de las variables de entorno
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Reemplazar saltos de línea
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// Inicializar Firebase Storage usando las credenciales de las variables de entorno
const storage = new Storage({
    projectId: serviceAccount.projectId,
    credentials: serviceAccount,  // Usamos el objeto serviceAccount
});

const bucket = storage.bucket("gs://test-project-3657a.appspot.com/");

/**
 * Subir el archivo a Firebase Storage
 * @param {object} file - Archivo a subir
 * @param {string} pathImage - Ruta donde se almacenará la imagen
 */
module.exports = (file, pathImage) => {
    return new Promise((resolve, reject) => {
        if (pathImage) {
        const fileUpload = bucket.file(`${pathImage}`);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
            contentType: 'image/png',
            metadata: {
                firebaseStorageDownloadTokens: uuid,
            },
            },
            resumable: false,
        });

        blobStream.on('error', (error) => {
            console.log('Error al subir archivo a Firebase:', error);
            reject('Something is wrong! Unable to upload at the moment.');
        });

        blobStream.on('finish', () => {
            const url = format(
            `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`,
            );
            console.log('URL de Cloud Storage:', url);
            resolve(url);
        });

        blobStream.end(file.buffer);
        } else {
        reject('No pathImage provided.');
        }
    });
};
