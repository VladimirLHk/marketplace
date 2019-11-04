let mix = require('laravel-mix')

mix.setPublicPath('dist')
   .js('resources/js/script.js', 'js')
   .sass('resources/sass/styles.scss', 'css')
