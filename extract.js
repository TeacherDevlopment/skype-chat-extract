
var fs = require('fs'),
    colors = require('colors'),
    sqlite3 = require('sqlite3').verbose(),
    defaultFileLocation = '{{home}}/.Skype/{{username}}/main.db',
    debug = false,
    _log = console.log,
    options = {
        dbfile: null,
        username: null,
        chatname: null,
        limit: 1000,
        maxage: null,
        exportfile: './output/' + (new Date()).getTime() + '.csv',
        fields: ['timestamp', 'id', 'author', 'body'],
        // FOR SLACK: timestamp, channel, username, text
        includeHeader: true,
        newName: null,
        authorMap: {}
    };

/**
 * Begins script execution
 * @return {void}
 */
function main() {
    console.info("\nSkype Chat Extract\n".blue.bold);

    var o = processOptions();

    if (!o.dbfile || !o.chatname) {
        console.error("Please be sure to specify the Skype db location and the chat name to export!\n".red);
        printUsage();
        process.exit(10);
    }

    var db = new sqlite3.Database(o.dbfile, sqlite3.OPEN_READONLY, function(err) {
        if (err) {
            console.error(
                ("Problem opening connection to SQLite database (" + o.dbfile + "):\n").red,
                err.toString().red
            );
            process.exit(20);
        }

        console.log(('Database connection opened (' + o.dbfile + ')...').grey);

        verifyChatInfo(o, db, function(chat) {
            console.info(('Found Skype chat room: \'' + chat.name + '\' (id=' + chat.id + ')').blue);

            getChatMessages(o, db, chat, function(messages) {
                console.info(('Found ' + messages.length + ' messages in this chat').blue);

                db.close();
                console.log('Database connection closed.'.grey);

                writeOutputFile(o, messages, function() {
                    console.info(('Successfully wrote all messages to file: ' + o.exportfile).green);
                    process.exit(0);
                });
            });

        });
    });
}

/**
 * Basic console log abstraction for debug switching
 * @return {void}
 */
console.log = function() {
    if (debug) {
        _log.apply(console, Array.prototype.slice.call(arguments));
    }
};


/**
 * Process command line arguments and integrate with default options
 * @return {Object} The integrated options
 */
function processOptions() {
    var d,
        o = options,
        args = process.argv.slice(2);

    args.forEach(function(val) {
        if (/^dbfile=/.test(val)) {
            o.dbfile = val.split(/\=/)[1];

        } else if (/^username=/.test(val)) {
            o.username = val.split(/\=/)[1];

        } else if (/^chatname=/.test(val)) {
            o.chatname = val.split(/\=/)[1];

        } else if (/^limit=/.test(val)) {
            o.limit = Number(val.split(/\=/)[1]) || 1000;

        } else if (/^maxage=/.test(val)) {
            d = new Date(val.split(/\=/)[1]);
            o.maxage = (d && d.getTime()) || null;

        } else if (/^exportfile=/.test(val)) {
            o.exportfile = val.split(/\=/)[1];

        } else if (/^--debug$/.test(val)) {
            debug = true;

        } else if (/^-h$/.test(val) || /^help$/.test(val)) {
            // If the user is request help, show it and exit
            printUsage();
            process.exit(0);
        }
    });

    if (!o.dbfile && o.username) {
        o.dbfile = defaultFileLocation
            .replace(/\{\{home\}\}/, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])
            .replace(/\{\{username\}\}/, o.username);
    }

    return o;
}

function printUsage() {
    console.info(
        "This script extracts chat messages from your local Skype storage and creates a\n" +
        "comma-separated version of the file (a .csv) useful for importing into other systems." +
        "\n\n" +
        "  Basic Example:\n" +
        "    ~$ node extract.js username=jordan chatname=\"Project Chat\"".green +
        "\n\n" +
        "  Example specifying export file name and max age of chat messages:\n" +
        "    ~$ node extract.js username=jordan chatname=\"Project Chat\" maxage=2014-01-01 exportfile=/home/me/project_chat.csv".green +
        "\n\n" +
        "Note that you MUST specify either a `dbfile` or `username` option (but not both)!\n".yellow +
        "You must also specify the chat you wish to export, which will be loosely matched.\n" +
        "(Multiple chats matching \"project\", for example, would cause an error.)".grey +
        "\n\n" +
        "Available options:\n" +
        "  username    Your Skype username; used to find your Skype DB file" + " (optional, use either this OR `dbfile`)\n".grey +
        "  dbfile      The location of your Skype SQLite database file" + " (optional, use either this OR `username`)\n".grey +
        "  chatname    The name of the chat you wish to export (can be a partial name)" + " (required)\n".grey +
        "  limit       Limit the number of chat messages returned" + " (optional, defaults to 1000)\n".grey +
        "  maxage      The oldest chat message to retrieve; can be date (YYYY-MM-DD) or timestamp" + " (optional)\n".grey +
        "  exportfile  Name of the file to export to" + " (optional, defaults to output/{timestamp}.csv)\n".grey
    );
}

function verifyChatInfo(o, db, cb) {
    var sql = 'SELECT friendlyname AS name, conv_dbid AS id FROM Chats WHERE friendlyname LIKE \'%' + o.chatname + '%\'';

    cb = cb || function() {};

    db.all(sql, function(err, rows) {
        if (err) {
            console.error(
                "There was an error verifying the Skype chat room info:\n".red,
                err.toString().red
            );
            console.log(sql);
            process.exit(30);
        }

        if (!rows.length) {
            console.error("Sorry, but there was no chat room matching that chatname\n".red);
            process.exit(31);
        }

        if (rows.length > 1) {
            console.error("There is more than one chat room matching that chatname, can you be more specific?\n".red);
            process.exit(32);
        }

        cb(rows[0]);
    });
}

function getChatMessages(o, db, chat, cb) {
    var sql = 'SELECT Messages.timestamp AS timestamp, Messages.id AS id, Messages.author AS author, Messages.body_xml AS body ' +
        'FROM Messages JOIN Chats ON Messages.convo_id = Chats.conv_dbid '+
        'WHERE Messages.convo_id = ' + chat.id;

    cb = cb || function() {};

    if (o.maxage) {
        sql += ' AND Messages.timestamp >= ' + o.maxage;
    }

    if (o.limit) {
        sql += ' LIMIT ' + o.limit;
    }

    db.all(sql, function(err, rows) {
        if (err) {
            console.error(
                "There was an error retrieving chat messages:\n".red,
                err.toString().red
            );
            console.log(sql);
            process.exit(40);
        }
        
        if (!rows.length) {
            console.warn('No chat messages were found!');
        }

        cb(rows);
    });
}

function writeOutputFile(o, messages, cb) {
    cb = cb || function() {};

    cb();
}

// ------------------ START SCRIPT ------------------- //
                        main();
// --------------------------------------------------- //