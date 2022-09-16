import { src, dest, watch, series, parallel } from 'gulp'
import autoprefixer from 'autoprefixer'
import browserSync from 'browser-sync'
import concat from 'gulp-concat'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import cssnano from 'cssnano'
import plumber from 'gulp-plumber'
import postcss from 'gulp-postcss'
import postcssNormalize from 'postcss-normalize'
import pug from 'gulp-pug'
import { init, write } from 'gulp-sourcemaps'
import rename from 'gulp-rename'
import terser from 'gulp-terser'
const sass = gulpSass(dartSass)

const paths = {
	assets: {
		src: './src/images/**/*',
		dest: './dist/assets/images/',
	},
	scripts: {
		src: './src/scripts/**/_*.js',
		dest: './dist/assets/',
		srcVendor: './src/scripts/**/!(_)*.js',
		destVendor: './dist/assets/',
	},
	svg: './src/svg/**/*.svg',
	theme: {
		src: './src/theme/**/*.{scss,sass}',
		dest: './dist/assets/',
	},
	template: {
		src: './src/template/!(_)*.pug',
		dest: './dist/',
		watch: './src/template/**/*.pug',
	},
	dist: './dist/',
}

const startServer = () =>
	browserSync.init({
		server: {
			baseDir: `${paths.dist}`,
		},
	})

function pageBuilder() {
	return src(paths.template.src)
		.pipe(plumber())
		.pipe(pug({ pretty: true }))
		.pipe(dest(paths.template.dest))
		.pipe(browserSync.reload({ stream: true }))
}

const copyAssets = () => src(paths.assets.src).pipe(dest(paths.assets.dest))
const copyLib = () =>
	src(paths.scripts.srcVendor).pipe(dest(paths.scripts.destVendor))

function scriptsBuilder() {
	return src(paths.scripts.src)
		.pipe(concat('app.js'))
		.pipe(init())
		.pipe(terser().on('error', (error) => console.log(error)))
		.pipe(rename({ suffix: '.min' }))
		.pipe(write('.'))
		.pipe(dest(paths.scripts.dest))
}

function themeBuilder() {
	const plugins = [postcssNormalize(), autoprefixer(), cssnano()]
	return src(paths.theme.src)
		.pipe(init())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(plugins))
		.pipe(rename({ suffix: '.min' }))
		.pipe(write('.'))
		.pipe(dest(paths.theme.dest))
		.pipe(browserSync.reload({ stream: true }))
}

const watchJs = () => watch(paths.scripts.src, scriptsBuilder)
const watchJsVendor = () => watch(paths.scripts.srcVendor, copyLib)
const watchSvg = () => watch(paths.svg, pageBuilder)
const watchAssets = () =>
	watch(paths.assets.src, series(copyAssets, pageBuilder))
const watchStyles = () => watch(paths.theme.src, themeBuilder)
const watchViews = () => watch(paths.template.watch, pageBuilder)
function watcher() {
	startServer()
}

const watchTask = parallel(
	startServer,
	watchJs,
	watchJsVendor,
	watchSvg,
	watchAssets,
	watchStyles,
	watchViews
)
const buildTask = parallel(
	copyAssets,
	copyLib,
	scriptsBuilder,
	pageBuilder,
	themeBuilder
)
exports.build = buildTask
exports.default = series(buildTask, watchTask)
