const Handlebars = require('handlebars');

Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

Handlebars.registerHelper('ifMinor', function (a, b, opts) {
    if (a.length < b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});
