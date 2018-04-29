/*
 * This code is from the sample program shown in
 * "Node.js in Action" by M. Cantelon et al.
 *
 *
 * 1) To start server:
 * w1$ node simple.js
 * Server running at http://127.0.0.1:3000/
 *
 * 
 * 2) To test, on other window:
 * w2$ curl -i -X GET http://127.0.0.1:3000/
 * HTTP/1.1 200 OK
 * Connection: closed
 * Content-Length: 159
 * Content-Type: application/json; charset=utf8
 * Date: Tue, 18 Apr 2017 07:06:01 GMT
 * 
 * [
 * 	{
 * 		"id": 0,
 * 		"data": "0th item"
 * 	},
 * 	{
 * 		"id": 1,
 * 		"data": "1st item"
 * 	},
 * 	{
 * 		"id": 2,
 * 		"data": "2nd item"
 * 	},
 * 	{
 * 		"id": 3,
 * 		"data": "3rd item"
 * 	}
 * ]
 * w2$
 *
 * 3) Don't forget stop server:
 * type Ctl-C on w1.
 *
*/

const http = require('http');
var url = require('url');

const hostname = '127.0.0.1';
const port = 3000;
var items = [
    {'id': 0, 'data': '0th item'},
    {'id': 1, 'data': '1st item'},
    {'id': 2, 'data': '2nd item'},
    {'id': 3, 'data': '3rd item'}
];

const server = http.createServer();

var search = function(id) {
    var ret = -1;
    for(var i = 0; i < items.length; i++) {
	if(items[i]["id"] == id) {
	    ret = i;
	    break;
	}
    }
    return ret;
}

var deleted_ids = [];
var next_id = 4;
var next_id_to_post = function() {
    if(deleted_ids.length == 0) {
	return next_id++;
    } else {
	return parseInt(deleted_ids.shift());
    }
}

server.on('request', function(req, res) {
    var path = url.parse(req.url).pathname;
    req.setEncoding('utf8');
    res.setHeader('Connection', 'closed');
    switch(req.method) {
        case 'GET':
            if(path.match(/^\/$/)) {
            // $ curl -i -X GET http://127.0.0.1:3000
                var body = JSON.stringify(items, null, '\t');
                body += '\n';
                res.setHeader('Content-Length', Buffer.byteLength(body));
                res.setHeader('Content-Type', 'application/json; charset=utf8');
                res.statusCode = 200;
                res.statusMessage = 'OK';
                res.end(body);
            } else if(path.match(/^\/(id)\/\d+$/)) {
            // $ curl -i -X GET http://127.0.0.1:3000/id/:number
		var id = path.substring(4, path.length);
		var target = search(id);
		if(target == -1) {
		    res.statusCode = 404;
		    res.statusMessage = ('Not Found');
		    res.end('Not Found\n');
		} else {
                    var body = JSON.stringify(items[target]['data'], null, '\t');
                    body += '\n';
                    res.setHeader('Content-Length', Buffer.byteLength(body));
                    res.setHeader('Content-Type', 'application/json; charset=utf8');
                    res.statusCode = 200;
                    res.statusMessage = 'OK';
                    res.end(body);
		}
	    } else {
                res.statusCode = 400;
                res.statusMessage = 'Bad Request';
                res.end('Bad Request\n');
            }
            break;
        case 'POST':
            if(path.match(/^\/$/)) {
            // $ curl -i -v --data '{"data":"testdata"}' -X POST http://127.0.0.1:3000
                var item;
                var data = '';
                req.on('data', function(chunk){
                    data += chunk;
                });
                req.on('end', function(){
                    try {
                        item = JSON.parse(data, function(key, value) {
                            if(key === '' ) return value;
                            if(key === 'data') return value;
                        });
                    } catch(e) {
                        res.statusCode = 400;
                        res.statusMessage = e.message;
                        res.end('Bad Request\n');
                    }
                    if('data' in item){
                        // item.id = items.length;
                        item.id = next_id_to_post();
                        items.push(item);
                        var body = JSON.stringify(item, null, '\t');
                        res.setHeader('Content-Length', Buffer.byteLength(body));
                        res.setHeader('Content-Type', 'application/json; charset=utf8');
                        res.statusCode = 200;
                        res.statusMessage = 'OK';
                        res.end(body);
                    }else{
                        res.statusCode = 400;
                        res.statusMessage = ('Bad Request');
                        res.end('Bad Request\n');
                    }
                });
            } else {
                res.statusCode = 400;
                res.statusMessage = ('Bad Request');
                res.end('Bad Request\n');
            }
            break;
        case 'PUT':
	    if(path.match(/^\/(id)\/\d+$/)) {
	    // $ curl -i -v --data '{"data":"testdata"}' -X PUT http://127.0.0.1:3000/id/:number
		var item;
		var data = '';
		req.on('data', function(chunk){
                    data += chunk;
                });
		req.on('end', function(){
                    try {
                        item = JSON.parse(data, function(key, value) {
			    if(key === '' ) return value;
			    if(key === 'data') return value;
			});
                    } catch(e) {
                        res.statusCode = 400;
                        res.statusMessage = e.message;
                        res.end('Bad Request\n');
                    }
                    if('data' in item){
			var id = path.substring(4, path.length);
			var target = search(id);
			if (target == -1) {
			    res.statusCode = 404;
			    res.statusMessage = ('Not Found');
			    res.end('Not Found\n');
			} else {
                            items[target]['data'] = item['data'];
                            var body = JSON.stringify(items[target]['data'], null, '\t');
			    body += '\n';
                            res.setHeader('Content-Length', Buffer.byteLength(body));
                            res.setHeader('Content-Type', 'application/json; charset=utf8');
                            res.statusCode = 200;
                            res.statusMessage = 'OK';
                            res.end(body);
			}
                    } else {
                        res.statusCode = 400;
                        res.statusMessage = ('Bad Request');
                        res.end('Bad Request\n');
                    }
                });
	    } else {
		res.statusCode = 400;
		res.statusMessage = ('Bad Request');
		res.end('Bad Request\n');
	    }
	    break;
        case 'DELETE':
	    if(path.match(/^\/(id)\/\d+$/)) {
	    // $ curl -i -X DELETE http://127.0.0.1:3000/id/:number
		var id = path.substring(4, path.length);
		var target = search(id);
		if(target != -1) {
                    var body = JSON.stringify(items[target], null, '\t');
                    body += '\ndeleted\n';
                    res.setHeader('Content-Length', Buffer.byteLength(body));
                    res.setHeader('Content-Type', 'application/json; charset=utf8');
                    res.statusCode = 200;
                    res.statusMessage = 'OK';
                    res.end(body);
		    items.splice(target, 1);
		    deleted_ids.push(id);
		    deleted_ids.sort();
		} else {
		    var body = JSON.stringify('', null, '\t');
		    body += '\nnot found\n';
                    res.setHeader('Content-Length', Buffer.byteLength(body));
                    res.setHeader('Content-Type', 'application/json; charset=utf8');
                    res.statusCode = 404;
                    res.statusMessage = 'Not Found';
                    res.end(body);
		}
	    } else {
		res.statusCode = 400;
		res.statusMessage = ('Bad Request');
		res.end('Bad Request\n');
	    }
	    break;
        default:
            res.statusCode = 400;
            res.statusMessage = ('Bad Request');
            res.end('Bad Request\n');
            break;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
