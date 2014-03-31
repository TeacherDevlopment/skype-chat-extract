Skype Chat Extract
====

This is a tool (Node script) for extracting chat messages from your local Skype storage and creating 
a comma-separated version of the file (a .csv) useful for importing into other systems.

## Basic Usage

```bash
~$ node extract.js username=jordan chatname="Project Chat"
```

This command would find the first 1000 messages (the default limit) in a Skype chat that matched the 
name "Project Chat" and create a .csv file named with the current timestamp.

_Note that the `chatname` must find one and only one Skype chat room._ If it doesn't, you'll need to be more specific.

### Specifying more options

_Example specifying export file name and max age of chat messages:_

```bash
~$ node extract.js username=jordan chatname=\"Project Chat\" maxage=2014-01-01 exportfile=/home/me/project_chat.csv
```

Note that you MUST specify either a `dbfile` or `username` option (__but not both__)!

## Available options

```
username       Your Skype username; used to find your Skype DB file (optional, use either this OR `dbfile`)
dbfile         The location of your Skype SQLite database file (optional, use either this OR `username`)
chatname       The name of the chat you wish to export (can be a partial name) (required)
limit          Limit the number of chat messages returned (optional, defaults to 1000)
maxage         The oldest chat message to retrieve; can be date (YYYY-MM-DD) or timestamp (optional)
exportfile     Name of the file to export to (optional, defaults to ./{timestamp}.csv)
outputchatname Name to use in the output file for this chat (optional, defaults to Skype chat name)
authormap      An object mapping Skype usernames to the target service (optional, example: { 'john.doe': 'jdoe' })
```

## Author

Jordan Kasper (@jakerella)

## LICENSE

MIT

Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

http://opensource.org/licenses/MIT
