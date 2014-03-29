
var fs = require('fs'),
    colors = require('colors'),
    sqlite3 = require('sqlite3').verbose(),
    defaultFileLocation = '{{home}}/.Skype/{{username}}/main.db',
    options = {
        dbfile: null,
        exportfile: './output/' + (new Date()).getTime() + '.csv',
        username: null,
        chatName: null,
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
    var o = options,
        args = process.argv.slice(2);

    args.forEach(function(val) {
        if (/^dbfile=/.test(val)) {
            o.dbfile = val.split(/\=/)[1];

        } else if (/^username=/.test(val)) {
            o.username = val.split(/\=/)[1];
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

    console.log();

}


// ------------------ START SCRIPT ------------------- //
                        main();
// --------------------------------------------------- //