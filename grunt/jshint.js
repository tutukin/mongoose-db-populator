module.exports = {
    options:    {
        reporter:   require('jshint-stylish')
    },
    Gruntfile:  {
        target: ['Gruntfile.js', 'grunt/**/*.js']
    },
    src:        {
        target: ['src/**/*.js', 'test/support/**/*.js']
    }
};
