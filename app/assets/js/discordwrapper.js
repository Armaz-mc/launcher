const { LoggerUtil } = require('helios-core');
const { Client } = require('discord-rpc-patch');
const Lang = require('./langloader');

const logger = LoggerUtil.getLogger('DiscordWrapper');

let client;
let activity;

exports.initRPC = function(genSettings, servSettings, initialDetails = Lang.queryJS('discord.waiting')) {
    let clientId;
    const serverName = servSettings.largeImageKey || 'undefined';

    if (serverName.toLowerCase() === 'gods') {
        clientId = '1309721703047495820';
    } else if (serverName.toLowerCase() === 'deadland') {
        clientId = '1277831457271709707';
    } else {
        clientId = servSettings.clientId || genSettings.clientId;
    }

    if (!clientId) {
        return;
    }

    client = new Client({ transport: 'ipc' });

    activity = {
        details: initialDetails,
        state: Lang.queryJS('discord.state', { shortId: servSettings.shortId }),
        largeImageKey: servSettings.largeImageKey,
        largeImageText: servSettings.largeImageText,
        smallImageKey: genSettings.smallImageKey,
        smallImageText: genSettings.smallImageText,
        startTimestamp: new Date().getTime(),
        instance: false,
        buttons: [
            { label: 'Website', url: 'https://armaz-mc.com' },
            { label: 'Discord', url: 'https://discord.com/invite/s96tb8sttP' }
        ],
    };

    client.on('ready', () => {
        client.setActivity(activity);
    });

    client.login({ clientId }).catch((error) => {
        if (!error.message.includes('ENOENT')) {
            logger.info('Unable to initialize Discord Rich Presence: ' + error.message, error);
        }
    });
};

exports.updateActivity = function(newActivity) {
    const updatedActivity = { ...activity, ...newActivity };
    activity = updatedActivity;
    client.setActivity(activity);
};

exports.updateDetails = function(details) {
    if (!client) return;
    activity.details = details;
    client.setActivity(activity);
};

exports.updateState = function(state) {
    activity.state = state;
    client.setActivity(activity);
};

exports.shutdownRPC = function() {
    if (!client) return;
    client.clearActivity();
    client.destroy();
    client = null;
    activity = null;
};
