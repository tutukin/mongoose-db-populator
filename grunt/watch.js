module.exports = {
    Gruntfile: {
        files:  ['Gruntfile.js', 'grunt/**/*.js'],
        tasks:  ['jshint:Gruntfile']
    },

    src:        {
        files:  ['src/**/*.js', 'test/support/**/*.js'],
        tasks:  ['jshint:src', 'mochaTest']
    }
};
