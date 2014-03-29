
var fs = require('fs'),
    colors = require('colors'),
    sqlite3 = require('sqlite3').verbose(),
    defaultFileLocation = '{{home}}/.Skype/{{username}}/main.db',
    options = {
        dbfile: null,
        username: null,
        chatname: null,
        limit: 1000,
        maxage: null,
        exportfile: './output/' + (new Date()).getTime() + '.csv',
        fields: ['timestamp', 'convo_id', 'author', 'body_xml'],
        includeHeader: true,
        newName: null,
        authorMap: {}
    };

/**
 * Begins script execution
 * @return {void}
 */
function main() {
    console.log("\nSkype Chat Extract\n".blue.bold);

    var o = processOptions();

    var db = new sqlite3.Database(o.dbfile, sqlite3.OPEN_READONLY, function() {
        console.log('db is ready');

        db.each('SELECT Messages.id, convo_id, author, Messages.timestamp, body_xml ' +
            'FROM Messages ' +
            'JOIN Chats ON Messages.convo_id = Chats.conv_dbid '+
            'WHERE convo_id IN (SELECT Chats.conv_dbid FROM Chats WHERE friendlyname LIKE \'%PROJ - iostudio%\') ' +
            'LIMIT 10',
            function(err, row) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(row.id + ', ' + row.convo_id + ', ' + row.timestamp);
                }
            },
            function(err, count) {
                console.log(('found ' + count + ' rows').green);
                db.close();
                process.exit(0);
            }
        );
    });
}

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

        } else if (/^-h$/.test(val) || /^help$/.test(val)) {
            // If the user is request help, show it and exit
            printUsage();
            process.exit(0);
        }
    });

    if (!o.dbfile && o.username) {
        o.dbfile = defaultFileLocation
            .replace(/\{\{home\}\}/, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])
            .replace(/\{\{username\}\}/, 'jakerella');
    }

    console.log(('Initializing wih the following options: ' + JSON.stringify(o)).blue);

    return o;
}

function printUsage() {
    console.log(
        "This script extracts chat messages from your local Skype\n" +
        "storage and creates a comma-separated version of the file\n" +
        "(a .csv) useful for importing into other systems." +
        "\n\n" +
        "    Basic Example:" +
        "  ~$ node extract.js username=jordan chatname=\"Project Chat\"".yellow +
        "\n\n" +
        "Available options:\n" +
        "  username    Your Skype username; used to find your Skype DB file (optional, use either this OR 'dbfile')\n" +
        "  dbfile      The location of your Skype SQLite database file (optional, use either this OR 'username')\n" +
        "  chatname    The name of the chat you wish to export (can be a partial name) (required)\n" +
        "  limit       Limit the number of chat messages returned (optional, defaults to 1000)\n" +
        "  maxage      The oldest chat message to retrieve; can be date (YYYY-MM-DD) or timestamp (optional)\n" +
        "  exportfile  Name of the file to export to (optional, defaults to output/{timestamp}.csv)\n"
    );
}


// ------------------ START SCRIPT ------------------- //
                        main();
// --------------------------------------------------- //