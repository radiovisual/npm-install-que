import stripAnsi from 'strip-ansi';
import rimraf from 'rimraf';
import test from 'ava';
import que from '../que.js';

const goodPkg = require('./success.json');
const failPkg = require('./fail.json');
const manyFailPkg = require('./manyfail.json');
const noDevsPkg = require('./nodevdeps.json');
const onlyDevsPkg = require('./onlydevdeps.json');

test.beforeEach(() => {
	rimraf.sync('node_modules');
});

test('successfully installs one at a time', async t => {
	let status = await que(goodPkg);
	status = stripAnsi(status);

	t.true(/100% installed successfully/g.test(status));
	t.true(/installed: noop/g.test(status));
	t.true(/installed: emtee/g.test(status));
});

test('report failed install', async t => {
	let status = await que(failPkg);
	status = stripAnsi(status);

	t.true(/50% installed successfully/g.test(status));
	t.true(/installed: emtee/g.test(status));
	t.true(/failed: THISMODULEWILLNEVEREXIST/g.test(status));
	t.true(/Retry failed installs by running the following command:/g.test(status));
	t.true(/npm install THISMODULEWILLNEVEREXIST/g.test(status));
});

test('report many failed installs', async t => {
	let status = await que(manyFailPkg);
	status = stripAnsi(status);

	t.false(/installed successfully/g.test(status));
	t.true(/100% failed install/g.test(status));
	t.true(/failed: THISMODULEWILLNEVEREXIST/g.test(status));
	t.true(/failed: ALSOTHISMODULEWILLNEVEREXIST/g.test(status));
	t.true(/Retry failed installs by running the following command:/g.test(status));
	t.true(/npm install THISMODULEWILLNEVEREXIST && npm install ALSOTHISMODULEWILLNEVEREXIST/g.test(status));
});

test('no devDependencies', async t => {
	let status = await que(noDevsPkg);
	status = stripAnsi(status);

	t.true(/100% installed successfully/g.test(status));
	t.true(/installed: emtee/g.test(status));
});

test('only devDependencies', async t => {
	let status = await que(onlyDevsPkg);
	status = stripAnsi(status);

	t.true(/100% installed successfully/g.test(status));
	t.true(/installed: emtee/g.test(status));
});
