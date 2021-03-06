'use strict';

var UrlUtils = require('url');
var Wreck = require('wreck');
var _ = require('lodash');

var httpfy = require('trooba-http-api');

module.exports = function transport(pipe, config) {
    pipe.on('request', function onRequest(request) {
        var options = _.merge(request || {}, config);
        var genericTimeout = options.timeout;

        if (options.connectTimeout) {
            options.timeout = options.connectTimeout;
        }
        if (options.body) {
            options.payload = options.body;
        }
        if (options.path) {
            options.pathname = options.path;
        }

        var url = UrlUtils.format(options);

        Wreck.request(options.method, url, options, function onResponse(err, response) {
            /* handle err if it exists, in which case res will be undefined */
            if (err) {
                pipe.throw(err);
                return;
            }

            // buffer the response stream
            options.timeout = genericTimeout;
            if (options.socketTimeout) {
                options.timeout = options.socketTimeout;
            }
            Wreck.read(response, options, function onResponseRead(err, body) {
                if (err) {
                    pipe.throw(err);
                    return;
                }
                response.body = body;
                pipe.respond(response);
            });
        });
    });

    httpfy(pipe);
};
