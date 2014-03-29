
var options = {
    dbfile: '~/.Skype/{{username}}/main.db',
    username: null,
    chats: null,
    fields: ['timestamp', 'convo_id', 'author', 'body_xml'],
    includeHeader: true,
    chatName: null,
    authorMap: {}
};




var sqlite3 = require('sqlite3').verbose();

process.argv.forEach(function(val) {
    console.log('arg: ', val);
});

var db = new sqlite3.Database('/home/jordan/.Skype/jakerella/main.db');

db.serialize(function() {
    db.each('SELECT Messages.id, convo_id, author, Messages.timestamp, body_xml ' +
        'FROM Messages ' +
        'JOIN Chats ON Messages.convo_id = Chats.conv_dbid '+
        'WHERE convo_id IN (SELECT Chats.conv_dbid FROM Chats WHERE friendlyname LIKE \'%PROJ - iostudio%\') ' +
        'LIMIT 10', function(err, row) {
        if (err) {
            console.error(err);
        } else {
            console.log(row.id + ', ' + row.convo_id + ', ' + row.timestamp);
        }
    });
});

db.close();
