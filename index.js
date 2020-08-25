const { app, BrowserWindow, screen, globalShortcut } = require('electron');
const amqp = require('amqplib');

const margin = 10;
const width = 500;
const height = 100;
const idStack = [];
const queue = 'notifications';

if (module.hot) {
    module.hot.accept();
}

/**
 * Creates a notification with a message.
 * @param {String} message - message to display in notification
 */
const createNotif = (message) => {
    // when there's many, it may be necessary to stack
    // dynamic height based on content??
    const win = new BrowserWindow({
        x: screen.getPrimaryDisplay().workAreaSize.width - width - margin,
        y: (idStack.length * (height + 2 * margin)) + margin, // (margin + height + margin) per notif + 1x margin offset
        height,
        width,
        useContentSize: true,
        frame: false,
        skipTaskbar: true,
        focusable: false,
        show: false,
        transparent: true,
        // backgroundColor: '#ffffff',
        alwaysOnTop: true,
    });

    let url = process.env.NODE_ENV === 'prod' ? 'file://${__dirname}/app/index.html' : 'http://localhost:8080';
    url += `?msg=${message}`;
    win.loadURL(url);
    win.webContents.on('dom-ready', () => { // ready-to-show not really working
        win.show();
        // win.webContents.openDevTools();
        idStack.push(win.id);
    });
};

/**
 * Dismiss a number of notifications
 * @param {Number} count - number of notifications to dismiss
 */
const dismissNotif = (count) => {
    if (count === 0) {
        console.log('popping nothing');
        return;
    }
    if (idStack.length >= count) {
        for (let i = 0; i < count; i++) {
            const id = idStack.pop();
            BrowserWindow.fromId(id).close();
            console.log(`popped window ${id}`);
        }
    } else {
        console.log('unable to pop that many');
    }
};

/**
 * Register keyboard shortcuts
 */
const registerShortcuts = () => {
    globalShortcut.register('CmdOrCtrl+Space', () => {
        dismissNotif(idStack.length > 0 ? 1 : 0)
    });

    globalShortcut.register('CmdOrCtrl+Shift+Space', () => {
        dismissNotif(idStack.length);
    });

    globalShortcut.register(':+q', () => {
        dismissNotif(idStack.length);
        app.quit();
    });
};

/**
 * Setup and execute main logic.
 */
const setup = async () => {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();
    await channel.assertQueue(queue);
    console.log('AMQP conn est');

    await app.whenReady();
    registerShortcuts();

    app.on('will-quit', async () => {
        console.log('closing down notifs');
        globalShortcut.unregisterAll();
        // ack everything remaining? or nack?
        // close the channel
        await channel.close();
    });

    app.on('window-all-closed', () => {
        console.log('no more notifs');
    }); // do not exit on all window close

    channel.consume(queue, msg => {
        if (msg !== null) {
            console.log(`new msg: ${msg.content.toString()}`);
            createNotif(encodeURIComponent(msg.content.toString()));
            channel.ack(msg);
        }
    });
};

setup();
