/**
 * AuthManager
 * 
 * This module aims to abstract login procedures. Results from Mojang's REST api
 * are retrieved through our Mojang module. These results are processed and stored,
 * if applicable, in the config using the ConfigManager. All login procedures should
 * be made through this module.
 * 
 * @module authmanager
 */
// Requirements
const ConfigManager          = require('./configmanager')
const { LoggerUtil }         = require('helios-core')
const { RestResponseStatus } = require('helios-core/common')
const { MojangRestAPI, MojangErrorCode } = require('helios-core/mojang')
const { MicrosoftAuth, MicrosoftErrorCode } = require('helios-core/microsoft')
const { AZURE_CLIENT_ID }    = require('./ipcconstants')
const { AuthClient } = require('azuriom-auth')
const Lang = require('./langloader')

const log = LoggerUtil.getLogger('AuthManager')

// Error messages

/**
 * Ajoute un compte sans vérifier les informations.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} password - Mot de passe.
 * @returns {Promise<Object>} - Retourne un compte généré.
 */
exports.addAccount = async function(username, password, twoFactorCode) {
    try {
        const client = new AuthClient('https://armaz-mc.com'); // Remplacez par l'URL de votre site Azuriom
        let result = await client.login(username, password, twoFactorCode);
        console.log(result);

        if (result.status === 'pending' && result.requires2fa) {
            const twoFactorCode = '' // IMPORTANT: Replace with the 2FA user temporary code

            let result = await client.login(username, password, twoFactorCode);
        }


        if (result.status !== 'success') {
            throw 'Erreur lors de la connexion avec AzAuth : ' + JSON.stringify(result);
        }

        const randomId = Array.from({ length: 10 }, () =>
            'abcdefghijklmnopqrstuvwxyz1234567890'[Math.floor(Math.random() * 36)]
        ).join('');

        const accountId = result.uuid;
        const accountName = result.username;
        const accessToken = result.accessToken;

        const ret = ConfigManager.addMojangAuthAccount(accountId, accessToken, accountName, accountName);

        if (!ConfigManager.getClientToken()) {
            ConfigManager.setClientToken(`client_${randomId}`);
        }

        ConfigManager.save();
        log.info(`Compte ajouté avec succès: ${accountName}`);
        return ret;

    } catch (err) {
        if (err.requires2FA) {
            // Traiter le cas spécifique de 2FA
            throw '2FA required';
        }
        log.error('Erreur inattendue lors de l’ajout du compte:', err);
        return Promise.reject(err);
    }
}


/**
 * Ajoute un compte Microsoft (toujours valide).
 * @param {string} authCode - Code d'authentification.
 * @returns {Promise<Object>} - Retourne un compte généré.
 */
exports.addMicrosoftAccount = async function(authCode) {
    try {
        const randomId = Array.from({ length: 10 }, () => 
            'abcdefghijklmnopqrstuvwxyz1234567890'[Math.floor(Math.random() * 36)]
        ).join('');

        const accountId = `ms_${randomId}`;
        const accountName = `MicrosoftUser_${randomId}`;
        const accessToken = `ms_token_${randomId}`;
        const refreshToken = `ms_refresh_${randomId}`;
        const now = Date.now();

        const ret = ConfigManager.addMicrosoftAuthAccount(
            accountId,
            accessToken,
            accountName,
            calculateExpiryDate(now, 3600),
            accessToken,
            refreshToken,
            calculateExpiryDate(now, 7200)
        );

        ConfigManager.save();
        log.info(`Compte Microsoft ajouté avec succès: ${accountName}`);
        return ret;
    } catch (err) {
        log.error('Erreur inattendue lors de l’ajout du compte Microsoft:', err);
        return Promise.reject(err);
    }
}

/**
 * Valide toujours le compte sélectionné.
 * @returns {Promise<boolean>} - Retourne toujours true.
 */
exports.validateSelected = async function() {
    try {
        log.info('Validation simulée réussie pour le compte sélectionné.');
        return true; // Toujours valide
    } catch (err) {
        log.error('Erreur lors de la validation du compte:', err);
        return false;
    }
}

/**
 * Supprime un compte.
 * @param {string} uuid - Identifiant du compte.
 * @returns {Promise<void>} - Confirme la suppression.
 */
exports.removeAccount = async function(uuid) {
    try {
        ConfigManager.removeAuthAccount(uuid);
        ConfigManager.save();
        log.info(`Compte supprimé avec succès: ${uuid}`);
    } catch (err) {
        log.error('Erreur lors de la suppression du compte:', err);
        return Promise.reject(err);
    }
}

/**
 * Calcule la date d'expiration.
 * @param {number} nowMs - Temps actuel en ms.
 * @param {number} expiresInS - Durée de validité en secondes.
 * @returns {number} - Temps d'expiration ajusté.
 */
function calculateExpiryDate(nowMs, expiresInS) {
    return nowMs + ((expiresInS - 10) * 1000);
}